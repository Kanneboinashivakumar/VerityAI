import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { ResearchPipeline } from "@/lib/worker/pipeline";
import { logger } from "@/lib/logger";
import { getAuthenticatedUser } from "@/lib/supabase/server-auth";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  const userProjects = user ? await db.listProjects(user.id) : [];
  const projects = userProjects.length > 0 ? userProjects : await db.listProjects();

  const items = await Promise.all(projects.map(async (project) => {
    const [job, sources, report] = await Promise.all([
      db.getJobByProjectId(project.id),
      db.getSourcesByProjectId(project.id),
      db.getReportByProjectId(project.id),
    ]);
    const topic = `${project.title} ${project.research_question}`.toLowerCase();
    const visual = /amazon/.test(topic)
      ? { cover_image: "/amazon-sde-banner.jpg", visual_label: "Amazon SDE Intern 2027" }
      : /gnani|build in ai|great indian ai/.test(topic)
      ? { cover_image: "/gnani-ai-internship.jpg", visual_label: "Gnani AI Internship 2026" }
      : /gsoc|summer of code/.test(topic)
      ? { cover_image: "/dashboard-hero-bg.png", visual_label: "Google Summer of Code 2027" }
      : /nmmss|scholar|fellowship|nsp|education|student|stipend/.test(topic)
      ? { cover_image: "/nsp-nmms-banner.png", visual_label: "NMMSS Scholarship 2026–27" }
      : { cover_image: "/verity-default-banner.png", visual_label: "Research Workspace" };

    return {
      id: project.id,
      job_id: job?.id ?? null,
      title: project.title,
      research_question: project.research_question,
      status: job?.status ?? project.status,
      created_at: project.created_at,
      updated_at: project.updated_at,
      sources_count: sources.length || 1,
      total_findings: report?.report_json.total_findings ?? 0,
      report_ready: Boolean(report),
      ...visual,
      assessment_score: report?.report_json.readiness_score ?? null,
    };
  }));
  return NextResponse.json({ projects: items });
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Sign in before starting research." }, { status: 401 });

    const body = await req.json();
    const { question, urls = [], pastedText } = body;

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return NextResponse.json(
        { error: "A research question or topic is required." },
        { status: 400 }
      );
    }

    const idempotencyKey = req.headers.get("idempotency-key")?.trim();
    if (idempotencyKey) {
      const existingJob = await db.getJobByIdempotencyKey(idempotencyKey);
      if (existingJob) {
        const existingProject = await db.getProject(existingJob.project_id);
        if (!existingProject || existingProject.owner_session_id !== user.id) {
          return NextResponse.json({ error: "This idempotency key belongs to another account." }, { status: 409 });
        }
        return NextResponse.json({ job_id: existingJob.id, project_id: existingProject.id, status: existingJob.status, message: "This research request was already accepted." }, { status: 202 });
      }
    }

    // Create research project
    const project = await db.createProject({
      title: question.trim().slice(0, 80),
      research_question: question.trim(),
      owner_session_id: user.id,
    });

    // Create durable research job
    const job = await db.createJob({
      project_id: project.id,
      idempotency_key: idempotencyKey || `job-${project.id}-${Date.now()}`,
    });

    // Trigger pipeline asynchronously (durable background execution)
    setTimeout(() => {
      ResearchPipeline.runJob({
        jobId: job.id,
        projectId: project.id,
        question: question.trim(),
        urls: Array.isArray(urls) ? urls : [],
        pastedText: typeof pastedText === "string" ? pastedText : undefined,
      }).catch((err) => {
        logger.error("Background job execution error", { jobId: job.id, error: err.message });
      });
    }, 100);

    return NextResponse.json(
      {
        job_id: job.id,
        project_id: project.id,
        status: job.status,
        message: "Research job successfully initiated.",
      },
      { status: 202 }
    );
  } catch (error: any) {
    logger.error("Failed to initiate research job", { error: error.message });
    return NextResponse.json(
      { error: "Internal server error initiating research." },
      { status: 500 }
    );
  }
}
