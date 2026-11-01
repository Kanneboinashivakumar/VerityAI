import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { getAuthenticatedUser } from "@/lib/supabase/server-auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const { jobId } = params;
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Sign in to manage this research." }, { status: 401 });
  const job = await db.getJob(jobId);

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  const project = await db.getProject(job.project_id);
  if (!project || project.owner_session_id !== user.id) {
    return NextResponse.json({ error: "Research not found" }, { status: 404 });
  }

  const updated = await db.updateJob(jobId, {
    cancel_requested_at: new Date().toISOString(),
    status: "cancelled",
    current_stage: "cancelled",
  });

  await db.appendEvent({
    job_id: jobId,
    sequence_number: Date.now(),
    stage: "cancelled",
    status: "cancelled",
    message: "Research cancellation requested and confirmed.",
    occurred_at: new Date().toISOString(),
  });

  return NextResponse.json({ success: true, job: updated });
}
