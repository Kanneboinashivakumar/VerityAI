import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { getAuthenticatedUser } from "@/lib/supabase/server-auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const { jobId } = params;
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Sign in to view this research." }, { status: 401 });
  const job = await db.getJob(jobId);
  const project = job ? await db.getProject(job.project_id) : null;
  if (!project || project.owner_session_id !== user.id) {
    return NextResponse.json({ error: "Research not found" }, { status: 404 });
  }
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let isClosed = false;

      const sendEvent = (eventData: any) => {
        if (isClosed) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(eventData)}\n\n`));
      };

      try {
        // Send initial existing events immediately on connect/reconnect
        const existingEvents = await db.getEvents(jobId);
        for (const ev of existingEvents) {
          sendEvent(ev);
        }

        // Check if job is already finished
        const job = await db.getJob(jobId);
        if (job && (job.status === "completed" || job.status === "completed_with_warnings" || job.status === "failed" || job.status === "cancelled")) {
          sendEvent({
            job_id: jobId,
            stage: job.current_stage,
            status: job.status,
            message: `Job is ${job.status}`,
            occurred_at: job.finished_at || new Date().toISOString(),
          });
          controller.close();
          isClosed = true;
          return;
        }

        // Stream loop polling DB events for updates until job completes
        let lastCount = existingEvents.length;
        const interval = setInterval(async () => {
          if (isClosed) {
            clearInterval(interval);
            return;
          }

          const currentEvents = await db.getEvents(jobId);
          if (currentEvents.length > lastCount) {
            for (let i = lastCount; i < currentEvents.length; i++) {
              sendEvent(currentEvents[i]);
            }
            lastCount = currentEvents.length;
          }

          const currentJob = await db.getJob(jobId);
          if (
            currentJob &&
            (currentJob.status === "completed" ||
              currentJob.status === "completed_with_warnings" ||
              currentJob.status === "failed" ||
              currentJob.status === "cancelled")
          ) {
            clearInterval(interval);
            sendEvent({
              job_id: jobId,
              stage: currentJob.current_stage,
              status: currentJob.status,
              message: `Job execution reached final state: ${currentJob.status}`,
              occurred_at: new Date().toISOString(),
            });
            isClosed = true;
            controller.close();
          }
        }, 800);

        req.signal.addEventListener("abort", () => {
          isClosed = true;
          clearInterval(interval);
        });
      } catch (err) {
        if (!isClosed) {
          controller.close();
          isClosed = true;
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
