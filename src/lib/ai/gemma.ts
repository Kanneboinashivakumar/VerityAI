import { AI_CONFIG } from "../config";
import { logger } from "../logger";
import { EvidenceStatus } from "../types";
import { z } from "zod";

export interface AnalysisInputSource {
  id: string;
  title: string;
  url: string;
  extracted_text: string;
  published_at?: string | null;
  updated_at?: string | null;
  retrieved_at?: string | null;
  publisher?: string;
  category?: string;
}

const prioritySchema = z.enum(["high", "medium", "low"]);
const analysisSchema = z.object({
  claims: z.array(z.object({
    claim_text: z.string().min(1),
    normalized_claim: z.string().optional().default(""),
    subject: z.string().optional().default(""),
    predicate: z.string().optional().default(""),
    value: z.string().optional().default(""),
    unit: z.string().optional(),
    time_period: z.string().optional(),
    conditions: z.string().optional(),
    category: z.string().optional().default("General"),
    status: z.enum(["CORROBORATED", "CONFLICTING", "MISSING", "POTENTIALLY_OUTDATED", "UNVERIFIED"]),
    confidence_note: z.string().optional().default(""),
    evidence: z.array(z.object({
      source_id: z.string().min(1),
      excerpt: z.string().min(1),
      page_number: z.number().int().positive().nullable().optional(),
      evidence_type: z.enum(["supports", "contradicts", "mentions"]),
    })),
  })),
  conflicts: z.array(z.object({
    claim_a_text: z.string().min(1),
    claim_b_text: z.string().min(1),
    source_a_id: z.string().min(1),
    source_b_id: z.string().min(1),
    explanation: z.string().min(1),
  })),
  information_gaps: z.array(z.object({
    question: z.string().min(1),
    why_it_matters: z.string().min(1),
    priority: prioritySchema,
    supporting_source_ids: z.array(z.string()),
  })),
  outdated_warnings: z.array(z.object({ finding: z.string().min(1), source_id: z.string().min(1), warning: z.string().min(1) })),
  unanswered_questions: z.array(z.string()),
  verification_checklist: z.array(z.object({ item: z.string().min(1), reason: z.string().min(1), priority: prioritySchema })),
  executive_summary: z.string().min(1),
  decision_readiness_score: z.number().min(0).max(100),
});

export interface AnalysisOutput {
  claims: Array<{
    claim_text: string;
    normalized_claim: string;
    subject: string;
    predicate: string;
    value: string;
    unit?: string;
    time_period?: string;
    conditions?: string;
    category: string;
    status: EvidenceStatus;
    confidence_note: string;
    evidence: Array<{
      source_id: string;
      excerpt: string;
      page_number?: number | null;
      evidence_type: "supports" | "contradicts" | "mentions";
    }>;
  }>;
  conflicts: Array<{
    claim_a_text: string;
    claim_b_text: string;
    source_a_id: string;
    source_b_id: string;
    explanation: string;
  }>;
  information_gaps: Array<{
    question: string;
    why_it_matters: string;
    priority: "high" | "medium" | "low";
    supporting_source_ids: string[];
  }>;
  outdated_warnings: Array<{
    finding: string;
    source_id: string;
    warning: string;
  }>;
  unanswered_questions: string[];
  verification_checklist: Array<{
    item: string;
    reason: string;
    priority: "high" | "medium" | "low";
  }>;
  executive_summary: string;
  decision_readiness_score: number; // 0 - 100
}

export class GemmaIntelligenceService {
  private model: string;
  private fallbackModel: string;
  private apiKey: string;

  constructor() {
    this.model = AI_CONFIG.model;
    this.fallbackModel = AI_CONFIG.fallbackModel;
    this.apiKey = process.env.GEMINI_API_KEY || "";
  }

  /**
   * Run the complete evidence analysis pipeline using Gemma 4
   */
  async analyzeEvidence(
    researchQuestion: string,
    sources: AnalysisInputSource[]
  ): Promise<AnalysisOutput> {
    const startTime = Date.now();
    logger.info("Initiating Gemma evidence analysis", {
      model: this.model,
      source_count: sources.length,
      question: researchQuestion,
    });

    if (!this.apiKey) throw new Error("Gemma analysis is not configured. Add GEMINI_API_KEY to .env.local.");
    if (sources.length === 0) throw new Error("Gemma cannot analyze this research without fetched source content.");

    try {
      const result = await this.callGemmaAPI(researchQuestion, sources, this.model);
      logger.info("Gemma analysis succeeded with primary model", {
        model: this.model,
        duration_ms: Date.now() - startTime,
      });
      return result;
    } catch (error: unknown) {
      const primaryError = error as Error;
      logger.warn("Primary Gemma model call failed; trying configured fallback model", {
        primaryModel: this.model,
        fallbackModel: this.fallbackModel,
        error: primaryError.message,
      });
      try {
        return await this.callGemmaAPI(researchQuestion, sources, this.fallbackModel);
      } catch (fallbackError: unknown) {
        logger.error("Gemma analysis failed for both configured models", {
          error: (fallbackError as Error).message,
        });
        throw new Error("The source analysis service could not complete this research. Please try again.");
      }
    }
  }

  /**
   * Call Google Gen AI SDK for Gemma
   */
  private async callGemmaAPI(
    researchQuestion: string,
    sources: AnalysisInputSource[],
    modelName: string
  ): Promise<AnalysisOutput> {
    // Dynamic import to support various execution environments
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: this.apiKey });

    const sourceContext = sources.map((s, idx) => `
[SOURCE ID: ${s.id}]
Title: ${s.title}
URL: ${s.url}
Published: ${s.published_at || "Unknown"}
Updated: ${s.updated_at || "Unknown"}
Retrieved: ${s.retrieved_at || "Unknown"}
Content:
${s.extracted_text.slice(0, 3000)}
---------------------------------`).join("\n");

    const prompt = `You are Verity AI, an elite Information Gap and Truth Verification intelligence system powered by Gemma.
Analyze the provided sources to answer the user's research question, extract factual claims, detect contradictions, identify missing information gaps, check for outdated data, and create an actionable verification checklist. Keep old sources when they establish historical context or show an item may be outdated. Separate source publication/update dates, retrieval dates, and the period a fact applies to. Never declare two dates a conflict unless they refer to the same process, academic year, and conditions.

User Question: "${researchQuestion}"

Available Sources:
${sourceContext}

STRICT EVIDENCE RULES:
1. ONLY make claims supported by the provided sources. Do NOT invent facts or URLs.
2. Every claim must cite the exact SOURCE ID provided above and include an exact verbatim excerpt.
3. Status MUST be one of:
   - "CORROBORATED" (supported by multiple credible sources)
   - "CONFLICTING" (disputed or inconsistent between sources)
   - "MISSING" (vital detail not found in any source)
   - "POTENTIALLY_OUTDATED" (source date or content suggests it may have changed)
   - "UNVERIFIED" (insufficient evidence)
4. Clearly distinguish missing information from contradictory information.
5. The executive summary must not introduce facts absent from fetched sources. If evidence is too thin, state that clearly.
6. Cover every dimension asked by the user. For application deadlines, eligibility, award amount, required documents, renewal conditions, and institute/district verification, provide a sourced claim or state that the detail is not confirmed by the fetched sources.
7. Do not present required documents as official requirements unless an official source explicitly lists them. If a secondary source mentions possible documents, identify them as unverified secondary information and keep the official requirement marked as unconfirmed.
8. Gap explanations must not say that a detail was mentioned unless the cited source supports that statement. When support is absent, explain that the available sources do not establish the detail.
9. Preserve source publication/update and retrieval dates separately. Do not label a previous deadline as conflicting when a later official notice supersedes it.
10. Do not add unrelated questions such as state-specific exam dates unless the user explicitly asks for them.
11. Return ONLY a single raw JSON object matching the schema below. No conversational wrapper or markdown code fence.

SCHEMA:
{
  "claims": [
    {
      "claim_text": "...",
      "normalized_claim": "...",
      "subject": "...",
      "predicate": "...",
      "value": "...",
      "category": "...",
      "status": "CORROBORATED | CONFLICTING | MISSING | POTENTIALLY_OUTDATED | UNVERIFIED",
      "confidence_note": "Explanation of certainty and evidence strength",
      "evidence": [
        {
          "source_id": "Exact ID matching input",
          "excerpt": "Verbatim quote from source",
          "evidence_type": "supports | contradicts | mentions"
        }
      ]
    }
  ],
  "conflicts": [
    {
      "claim_a_text": "...",
      "claim_b_text": "...",
      "source_a_id": "...",
      "source_b_id": "...",
      "explanation": "..."
    }
  ],
  "information_gaps": [
    {
      "question": "What required detail is missing?",
      "why_it_matters": "...",
      "priority": "high | medium | low",
      "supporting_source_ids": ["..."]
    }
  ],
  "outdated_warnings": [
    {
      "finding": "...",
      "source_id": "...",
      "warning": "..."
    }
  ],
  "unanswered_questions": ["..."],
  "verification_checklist": [
    {
      "item": "Specific action to verify",
      "reason": "Why this needs manual/official verification",
      "priority": "high | medium | low"
    }
  ],
  "executive_summary": "Thorough high-level synthesis of findings, readiness, and gaps.",
  "decision_readiness_score": 75
}`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "";
    const cleanJson = responseText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const unvalidated = JSON.parse(cleanJson);
    const validation = analysisSchema.safeParse(unvalidated);
    if (!validation.success) {
      throw new Error(`Gemma returned invalid structured analysis: ${validation.error.issues[0]?.path.join(".") || "schema mismatch"}`);
    }
    const parsed = validation.data;

    const sourceById = new Map(sources.map((source) => [source.id, source]));
    const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, " ").trim();
    parsed.claims = parsed.claims.map((claim) => ({
      ...claim,
      evidence: claim.evidence.filter((evidence) => {
        const source = sourceById.get(evidence.source_id);
        if (!source || !evidence.excerpt?.trim()) return false;
        return normalize(source.extracted_text).includes(normalize(evidence.excerpt));
      }),
    })).filter((claim) => claim.evidence.length > 0);
    parsed.conflicts = parsed.conflicts.filter((conflict) =>
      sourceById.has(conflict.source_a_id) && sourceById.has(conflict.source_b_id) &&
      parsed.claims.some((claim) => claim.claim_text === conflict.claim_a_text) &&
      parsed.claims.some((claim) => claim.claim_text === conflict.claim_b_text)
    );
    parsed.information_gaps = parsed.information_gaps.map((gap) => ({
      ...gap,
      supporting_source_ids: gap.supporting_source_ids.filter((sourceId) => sourceById.has(sourceId)),
    }));
    parsed.outdated_warnings = parsed.outdated_warnings.filter((warning) => sourceById.has(warning.source_id));

    return parsed as AnalysisOutput;
  }

}

export const gemmaService = new GemmaIntelligenceService();
