import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { db } from "../src/lib/db/store";
import { ResearchPipeline } from "../src/lib/worker/pipeline";

async function main() {
  console.log("=== Testing Full 10-Stage Verity AI Pipeline ===");

  const question = "Google Summer of Code 2027 eligibility and deadlines";
  console.log("Creating project for question:", question);

  const project = await db.createProject({
    title: "GSoC 2027 Test Project",
    research_question: question,
  });

  const job = await db.createJob({
    project_id: project.id,
  });

  console.log("Created Project ID:", project.id, "Job ID:", job.id);
  console.log("Running pipeline...");

  await ResearchPipeline.runJob({
    jobId: job.id,
    projectId: project.id,
    question,
  });

  console.log("\nPipeline finished! Verifying persisted outputs in database:");

  const updatedJob = await db.getJob(job.id);
  console.log("Final Job Status:", updatedJob?.status);

  const sources = await db.getSourcesByProjectId(project.id);
  console.log("Discovered & Fetched Sources Count:", sources.length);
  sources.forEach((s) => console.log(`  - [${s.category}] ${s.title} (${s.fetch_status})`));

  const claims = await db.getClaimsByProjectId(project.id);
  console.log("\nExtracted Claims Count:", claims.length);
  claims.forEach((c) => {
    console.log(`  - [${c.status}] ${c.claim_text}`);
    if (c.evidence && c.evidence.length > 0) {
      console.log(`     Evidence (${c.evidence.length}): "${c.evidence[0].excerpt.slice(0, 80)}..."`);
    }
  });

  const gaps = await db.getGapsByProjectId(project.id);
  console.log("\nInformation Gaps Count:", gaps.length);
  gaps.forEach((g) => console.log(`  - [${g.priority.toUpperCase()}] ${g.question}`));

  const conflicts = await db.getConflictsByProjectId(project.id);
  console.log("\nDetected Conflicts Count:", conflicts.length);
  conflicts.forEach((cf) => console.log(`  - ${cf.explanation}`));

  const checklist = await db.getChecklistByProjectId(project.id);
  console.log("\nVerification Checklist Count:", checklist.length);
  checklist.forEach((ch) => console.log(`  - [${ch.priority}] ${ch.item}`));

  const report = await db.getReportByProjectId(project.id);
  console.log("\nFinal Research Report Generated:", !!report);
  if (report) {
    console.log("Readiness Score:", report.report_json.readiness_score, "/ 100");
    console.log("Executive Summary Preview:", report.report_json.executive_summary.slice(0, 120), "...");
  }

  const events = await db.getEvents(job.id);
  console.log("\nTotal SSE Events emitted:", events.length);

  console.log("\n=== Full End-to-End Pipeline Verification Succeeded! ===");
}

main().catch(console.error);
