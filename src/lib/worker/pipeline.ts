import { db } from "../db/store";
import { tinyFish } from "../tinyfish/client";
import { gemmaService } from "../ai/gemma";
import { logger } from "../logger";
import { JobStatus, ResearchSource } from "../types";
import { TINYFISH_CONFIG } from "../config";

function sourceKey(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    url.hash = "";
    url.hostname = url.hostname.toLowerCase();
    url.pathname = url.pathname.replace(/\/+$/, "") || "/";
    return url.toString();
  } catch {
    return rawUrl.trim();
  }
}

function publicationDateFromText(text: string): string | null {
  const match = text.match(/(?:Posted\s+On|Published(?:\s+on)?|प्रविष्टि\s+तिथि)\s*:?\s*(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})/i);
  if (!match) return null;
  const monthIndex = new Date(`${match[2]} 1, 2000`).getMonth();
  if (Number.isNaN(monthIndex)) return null;
  return `${match[3]}-${String(monthIndex + 1).padStart(2, "0")}-${match[1].padStart(2, "0")}`;
}

export interface ResearchJobOptions {
  jobId: string;
  projectId: string;
  question: string;
  urls?: string[];
  pastedText?: string;
}

export class ResearchPipeline {
  /**
   * Run the complete 10-stage research intelligence pipeline
   */
  static async runJob(options: ResearchJobOptions): Promise<void> {
    const { jobId, projectId, question, urls = [], pastedText } = options;
    const startTime = Date.now();

    logger.info("Pipeline starting execution", { jobId, projectId, question });

    // Helper to transition state and append SSE progress event
    const transition = async (
      stage: string,
      status: JobStatus,
      message: string,
      completedUnits = 0,
      totalUnits = 6
    ) => {
      await db.updateJob(jobId, { status, current_stage: stage });
      await db.appendEvent({
        job_id: jobId,
        sequence_number: Date.now(),
        stage,
        status,
        message,
        completed_units: completedUnits,
        total_units: totalUnits,
        occurred_at: new Date().toISOString(),
      });
    };

    try {
      // Stage 1: Initialization
      await transition(
        "understanding_query",
        "queued",
        "Analyzed your research question and formulated search entities",
        1,
        6
      );

      // Check for cancellation
      const checkJob = await db.getJob(jobId);
      if (checkJob?.cancel_requested_at) {
        await transition("cancelled", "cancelled", "Research was cancelled by user", 1, 6);
        return;
      }

      // Stage 2: Source Discovery via TinyFish Search
      await transition(
        "discovering_sources",
        "discovering_sources",
        "Searching across trusted sources and scanning official websites",
        2,
        6
      );

      const asOf = new Date();
      const asOfDate = asOf.toISOString().slice(0, 10);
      const currentMonth = new Intl.DateTimeFormat("en", { month: "long", year: "numeric", timeZone: "UTC" }).format(asOf);
      const nextSixMonths = Array.from({ length: 6 }, (_, index) => {
        const month = new Date(Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth() + index + 1, 1));
        return new Intl.DateTimeFormat("en", { month: "long", year: "numeric", timeZone: "UTC" }).format(month);
      }).join(", ");
      const timeframe = `Research current as of ${asOfDate} (${currentMonth}). Prioritize current updates and confirmed events or deadlines through the next six months (${nextSixMonths}), but retain older sources when they establish history, changes, or that information may be outdated. Do not exclude a source only because it predates this month. Distinguish the source publication/update date, the period the information applies to, and today's retrieval date. Do not infer future dates from prior years.`;
      const searchQuestion = `${question}. ${timeframe} Prioritize relevant official/primary sources; exclude social media and forums.`;
      let searchResults: Awaited<ReturnType<typeof tinyFish.search>> = [];
      try {
        searchResults = await tinyFish.search(searchQuestion, TINYFISH_CONFIG.maxResults);
      } catch (searchError) {
        logger.warn("Source discovery failed; continuing with user-provided URLs", { jobId, error: (searchError as Error).message });
      }
      const maxSources = Math.min(TINYFISH_CONFIG.maxSources, Math.max(2, TINYFISH_CONFIG.sourceLimit));
      const candidates = [...urls, ...searchResults.map((result) => result.url)].filter((url) => typeof url === "string" && url.trim());
      const uniqueUrls = new Map<string, string>();
      for (const url of candidates) {
        const key = sourceKey(url);
        if (!uniqueUrls.has(key)) uniqueUrls.set(key, url);
      }
      const discoveredUrls = Array.from(uniqueUrls.values()).slice(0, maxSources);

      await transition(
        "collecting_sources",
        "fetching_sources",
        `Selected ${discoveredUrls.length} candidate sources (target ${maxSources}; user URLs prioritized)`,
        2,
        6
      );

      // Stage 3: Source Fetching via TinyFish Fetch
      await transition(
        "fetching_sources",
        "fetching_sources",
        "Reading and extracting clean content from each discovered source",
        3,
        6
      );

      const fetchedSources = await tinyFish.fetchUrls(discoveredUrls);

      const savedSources: ResearchSource[] = [];

      for (const fs of fetchedSources) {
        let credScore = 80;
        let credNotes = "General web resource";
        let category = "Blog Articles";

        const urlLow = fs.url.toLowerCase();
        if (urlLow.includes(".gov") || urlLow.includes(".edu") || urlLow.includes("withgoogle.com") || urlLow.includes("unesco.org")) {
          credScore = 95;
          credNotes = "Official authoritative institution";
          category = "Official Website";
        } else if (urlLow.includes("news") || urlLow.includes("blog") || urlLow.includes("techcrunch")) {
          credScore = 85;
          credNotes = "Published editorial news source";
          category = "News Articles";
        } else if (urlLow.includes("reddit") || urlLow.includes("forum")) {
          credScore = 72;
          credNotes = "Community discussion platform";
          category = "Community Discussions";
        }

        const saved = await db.addSource({
          project_id: projectId,
          submitted_url: fs.url,
          canonical_url: fs.url,
          title: fs.title || "Discovered Web Source",
          publisher: new URL(fs.url).hostname,
          published_at: fs.published_at || publicationDateFromText(fs.text || fs.markdown || ""),
          source_updated_at: fs.updated_at || null,
          fetched_at: new Date().toISOString(),
          content_type: fs.content_type || "text/html",
          fetch_status: fs.status,
          fetch_error_message: fs.error_message,
          extracted_text: fs.text || "",
          credibility_score: credScore,
          credibility_notes: credNotes,
          category,
        });
        savedSources.push(saved);
      }

      // If user provided pasted text, add as source
      if (pastedText && pastedText.trim().length > 0) {
        const textSource = await db.addSource({
          project_id: projectId,
          submitted_url: "user://pasted-text",
          title: "User Provided Text Input",
          publisher: "User Submission",
          fetched_at: new Date().toISOString(),
          content_type: "text/plain",
          fetch_status: "success",
          credibility_score: 85,
          credibility_notes: "User supplied document text",
          category: "Uploaded Documents",
          extracted_text: pastedText.trim(),
        });
        savedSources.push(textSource);
      }

      // Stage 4, 5, 6, 7, 8: Evidence Analysis with Gemma
      await transition(
        "extracting_claims",
        "extracting_claims",
        "Cross-checking information, extracting factual claims, and identifying contradictions",
        4,
        6
      );

      const usableSources = savedSources.filter((s) => s.fetch_status === "success" && s.extracted_text);
      const sourceFailures = savedSources.filter((source) => source.submitted_url !== "user://pasted-text" && source.fetch_status !== "success");
      if (usableSources.length < 2) {
        const message = `Insufficient evidence: only ${usableSources.length} source${usableSources.length === 1 ? " was" : "s were"} readable. At least two readable sources are needed for an evidence-backed analysis.`;
        await db.saveReport({
          project_id: projectId,
          report_json: {
            title: question.length > 50 ? `${question.slice(0, 47)}...` : question,
            research_question: question,
            executive_summary: message,
            readiness_score: 0,
            readiness_label: "Insufficient Evidence",
            total_findings: 0,
            verified_count: 0,
            gaps_count: 1,
            conflicts_count: 0,
            outdated_count: 0,
            key_findings: [],
            information_gaps: [{ item: "Fetch at least two readable sources.", reason: message, priority: "high" }],
            conflicts: [],
            outdated_warnings: [],
            unanswered_questions: [],
            checklist: [{ item: "Retry the unavailable sources or provide another relevant source.", priority: "high" }],
            limitations_and_uncertainty: `Retrieved ${savedSources.length} sources; ${sourceFailures.length} web source fetches failed. No factual analysis was generated.`,
          },
          version: 1,
        });
        await db.updateJob(jobId, { status: "completed_with_warnings", current_stage: "completed", finished_at: new Date().toISOString() });
        await transition("completed", "completed_with_warnings", message, 6, 6);
        return;
      }

      const analysisInput = usableSources.map((s) => ({
        id: s.id,
        title: s.title || "Untitled",
        url: s.submitted_url,
        extracted_text: s.extracted_text || "",
        published_at: s.published_at,
        updated_at: s.source_updated_at,
        retrieved_at: s.fetched_at,
        publisher: s.publisher,
        category: s.category,
      }));

      const aiAnalysis = await gemmaService.analyzeEvidence(
        `${question}\n\n${timeframe} Keep historical and current cycles separate. Do not call dates conflicting unless they refer to the same process, academic year, and applicable conditions. Missing requirements must stay unknown unless a fetched source states them.`,
        analysisInput
      );

      // Persist Claims and Evidence
      const claimIdMap: Record<string, string> = {};
      for (const claimData of aiAnalysis.claims) {
        const claim = await db.addClaim(
          {
            project_id: projectId,
            claim_text: claimData.claim_text,
            normalized_claim: claimData.normalized_claim,
            subject: claimData.subject,
            predicate: claimData.predicate,
            value: claimData.value,
            unit: claimData.unit,
            time_period: claimData.time_period,
            conditions: claimData.conditions,
            category: claimData.category,
            status: claimData.status,
            confidence_note: claimData.confidence_note,
          },
          claimData.evidence.map((e) => ({
            source_id: e.source_id,
            excerpt: e.excerpt,
            page_number: e.page_number,
            evidence_type: e.evidence_type,
          }))
        );
        claimIdMap[claimData.claim_text] = claim.id;
      }

      // Persist Conflicts
      for (const conf of aiAnalysis.conflicts) {
        const claimAId = claimIdMap[conf.claim_a_text] || Object.values(claimIdMap)[0];
        const claimBId = claimIdMap[conf.claim_b_text] || Object.values(claimIdMap)[1] || claimAId;
        if (claimAId && claimBId) {
          await db.addConflict({
            project_id: projectId,
            claim_a_id: claimAId,
            claim_b_id: claimBId,
            claim_a_text: conf.claim_a_text,
            claim_b_text: conf.claim_b_text,
            source_a_id: conf.source_a_id,
            source_b_id: conf.source_b_id,
            explanation: conf.explanation,
            status: "open",
          });
        }
      }

      // Persist Information Gaps
      for (const gap of aiAnalysis.information_gaps) {
        await db.addGap({
          project_id: projectId,
          question: gap.question,
          why_it_matters: "The fetched sources do not establish this detail. Verify it in the current official scheme guidelines or National Scholarship Portal notice.",
          priority: gap.priority,
          supporting_source_ids: gap.supporting_source_ids,
        });
      }

      // Stage 9: Verification Checklist
      await transition(
        "building_checklist",
        "building_checklist",
        "Generating prioritized verification checklist and identifying next steps",
        5,
        6
      );

      for (const chk of aiAnalysis.verification_checklist) {
        await db.addChecklistItem({
          project_id: projectId,
          item: chk.item,
          reason: chk.reason,
          priority: chk.priority,
          status: "pending",
        });
      }

      // Stage 10: Final Research Report Generation
      await transition(
        "saving_report",
        "saving_report",
        "Compiling executive summary and generating finalized evidence report",
        6,
        6
      );

      const verifiedClaims = aiAnalysis.claims.filter((c) => c.status === "CORROBORATED");
      const gapClaims = aiAnalysis.claims.filter((c) => c.status === "MISSING");
      const conflictClaims = aiAnalysis.claims.filter((c) => c.status === "CONFLICTING");
      const outdatedClaims = aiAnalysis.claims.filter((c) => c.status === "POTENTIALLY_OUTDATED");

      await db.saveReport({
        project_id: projectId,
        report_json: {
          title: question.length > 50 ? `${question.slice(0, 47)}...` : question,
          research_question: question,
          executive_summary: aiAnalysis.executive_summary,
          readiness_score: aiAnalysis.decision_readiness_score,
          readiness_label: aiAnalysis.decision_readiness_score > 75 ? "Ready with Verification" : "Needs Verification",
          total_findings: aiAnalysis.claims.length,
          verified_count: verifiedClaims.length,
          gaps_count: gapClaims.length + aiAnalysis.information_gaps.length,
          conflicts_count: conflictClaims.length + aiAnalysis.conflicts.length,
          outdated_count: outdatedClaims.length + aiAnalysis.outdated_warnings.length,
          key_findings: aiAnalysis.claims.map((c) => ({
            title: c.claim_text,
            description: c.confidence_note,
            status: c.status,
          })),
          information_gaps: aiAnalysis.information_gaps.map((g) => ({
            item: g.question,
            reason: "The fetched sources do not establish this detail. Verify it in the current official scheme guidelines or National Scholarship Portal notice.",
            priority: g.priority,
          })),
          conflicts: aiAnalysis.conflicts.map((co) => ({
            explanation: co.explanation,
            claims: [co.claim_a_text, co.claim_b_text],
          })),
          outdated_warnings: aiAnalysis.outdated_warnings.map((ow) => ({
            finding: ow.finding,
            warning: ow.warning,
          })),
          unanswered_questions: aiAnalysis.unanswered_questions,
          checklist: aiAnalysis.verification_checklist.map((v) => ({
            item: v.item,
            priority: v.priority,
          })),
          limitations_and_uncertainty: `Analysis processed ${usableSources.length} sources. Real-world verification must be conducted before making binding commitments.`,
        },
        version: 1,
      });

      // Complete job
      const hasWarnings = savedSources.some((s) => s.fetch_status !== "success");
      const finalStatus: JobStatus = hasWarnings ? "completed_with_warnings" : "completed";

      await db.updateJob(jobId, {
        status: finalStatus,
        current_stage: "completed",
        finished_at: new Date().toISOString(),
      });

      await transition(
        "completed",
        finalStatus,
        "Research intelligence analysis complete. Results and verification report ready.",
        6,
        6
      );

      logger.info("Pipeline successfully finished execution", {
        jobId,
        projectId,
        duration_ms: Date.now() - startTime,
      });
    } catch (err: unknown) {
      const error = err as Error;
      logger.error("Pipeline encountered critical failure", {
        jobId,
        projectId,
        error: error.message,
        stack: error.stack,
      });

      await db.updateJob(jobId, {
        status: "failed",
        current_stage: "failed",
        last_error_code: "PIPELINE_ERROR",
        last_error_message: error.message,
        finished_at: new Date().toISOString(),
      });

      await db.appendEvent({
        job_id: jobId,
        sequence_number: Date.now(),
        stage: "failed",
        status: "failed",
        message: `Analysis failed: ${error.message}`,
        occurred_at: new Date().toISOString(),
      });
    }
  }
}
