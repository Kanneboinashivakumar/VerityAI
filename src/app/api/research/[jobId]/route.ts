import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { getAuthenticatedUser } from "@/lib/supabase/server-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const { jobId } = params;
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Sign in to view this research." }, { status: 401 });
  const job = await db.getJob(jobId);

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const project = await db.getProject(job.project_id);
  if (!project || project.owner_session_id !== user.id) {
    return NextResponse.json({ error: "Research not found" }, { status: 404 });
  }
  const sources = await db.getSourcesByProjectId(job.project_id);
  const claims = await db.getClaimsByProjectId(job.project_id);
  const report = await db.getReportByProjectId(job.project_id);

  return NextResponse.json({
    job,
    project,
    sources_count: sources.length,
    successful_sources_count: sources.filter((source) => source.fetch_status === "success").length,
    failed_sources_count: sources.filter((source) => source.fetch_status !== "success").length,
    source_categories: sources.reduce<Record<string, number>>((counts, source) => {
      const category = source.category || "Other";
      counts[category] = (counts[category] || 0) + 1;
      return counts;
    }, {}),
    claims_count: claims.length,
    has_report: !!report,
  });
}
