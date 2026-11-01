import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { getAuthenticatedUser } from "@/lib/supabase/server-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const { jobId } = params;
  const user = await getAuthenticatedUser(req);
  const job = await db.getJob(jobId);
  const projectId = job ? job.project_id : jobId;
  const project = await db.getProject(projectId);

  if (!project) {
    return NextResponse.json({ error: "Research not found" }, { status: 404 });
  }

  const sources = await db.getSourcesByProjectId(projectId);
  return NextResponse.json({
    sources,
    projectTitle: project.title,
    researchQuestion: project.research_question,
  });
}
