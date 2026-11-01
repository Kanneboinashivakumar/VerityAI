import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { getAuthenticatedUser } from "@/lib/supabase/server-auth";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  const userId = user?.id || request.cookies.get("verity-session-id")?.value || "19b78994-16b1-49c8-b3e6-192468a24e5f";
  const items = await db.listSavedItems(userId);
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  const userId = user?.id || request.cookies.get("verity-session-id")?.value || "19b78994-16b1-49c8-b3e6-192468a24e5f";
  const body = await request.json().catch(() => null);
  const { project_id, item_type } = body || {};
  let item_id = body?.item_id;

  if (typeof project_id !== "string" || !["report", "finding", "source"].includes(item_type)) {
    return NextResponse.json({ error: "Choose a valid report, finding, or source to save." }, { status: 400 });
  }

  const project = await db.getProject(project_id);
  if (!project) return NextResponse.json({ error: "Research not found." }, { status: 404 });

  if (!item_id || typeof item_id !== "string") {
    item_id = item_type === "report" ? `rep-${project_id}` : `saved-${Date.now()}`;
  }

  let title = body.title || project.title;
  let snippet = body.snippet || project.research_question;
  let source_url: string | undefined = body.source_url;

  if (item_type === "report") {
    const report = await db.getReportByProjectId(project_id);
    title = body.title || `${project.title} — Research report`;
    snippet = body.snippet || report?.report_json?.executive_summary || project.research_question;
  } else if (item_type === "finding") {
    const claims = await db.getClaimsByProjectId(project_id);
    const claim = claims.find((item) => item.id === item_id);
    title = body.title || claim?.claim_text || project.title;
    snippet = body.snippet || claim?.confidence_note || claim?.claim_text || "Verified finding.";
  } else {
    const sources = await db.getSourcesByProjectId(project_id);
    const source = sources.find((item) => item.id === item_id);
    title = body.title || source?.title || source?.publisher || source?.submitted_url || project.title;
    snippet = body.snippet || source?.extracted_text?.slice(0, 240) || "Source saved for this research.";
    source_url = body.source_url || source?.submitted_url;
  }

  const item = await db.addSavedItem({
    owner_session_id: userId,
    project_id,
    item_type,
    item_id,
    title,
    snippet,
    source_url,
  });

  return NextResponse.json({ item, success: true }, { status: 201 });
}
