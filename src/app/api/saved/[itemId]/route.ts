import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { getAuthenticatedUser } from "@/lib/supabase/server-auth";

export async function DELETE(request: NextRequest, { params }: { params: { itemId: string } }) {
  const user = await getAuthenticatedUser(request);
  const userId = user?.id || request.cookies.get("verity-session-id")?.value || "19b78994-16b1-49c8-b3e6-192468a24e5f";
  const removed = await db.removeSavedItem(params.itemId, userId);
  return removed ? NextResponse.json({ success: true }) : NextResponse.json({ error: "Saved item not found." }, { status: 404 });
}
