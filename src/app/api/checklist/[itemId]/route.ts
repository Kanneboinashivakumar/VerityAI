import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { getAuthenticatedUser } from "@/lib/supabase/server-auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { itemId: string } }
) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Sign in to update this checklist." }, { status: 401 });
  const { itemId } = params;
  const existing = await db.getChecklistItem(itemId);
  const project = existing ? await db.getProject(existing.project_id) : null;
  if (!existing || !project || project.owner_session_id !== user.id) {
    return NextResponse.json({ error: "Checklist item not found" }, { status: 404 });
  }
  const updated = await db.toggleChecklistItem(itemId);

  if (!updated) {
    return NextResponse.json({ error: "Checklist item not found" }, { status: 404 });
  }

  return NextResponse.json({ item: updated });
}
