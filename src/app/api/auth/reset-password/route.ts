import { NextResponse } from "next/server";
import { APP_CONFIG } from "@/lib/config";
import { createSupabaseAuthClient } from "@/lib/supabase/server-auth";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (typeof email !== "string" || !email.trim()) {
      return NextResponse.json({ error: "Enter your email address." }, { status: 400 });
    }

    const supabase = createSupabaseAuthClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${APP_CONFIG.appUrl}/auth/callback?next=%2Fauth%2Fupdate-password`,
    });
    if (error) {
      return NextResponse.json({ error: "Unable to send a reset link right now. Please try again shortly." }, { status: 429 });
    }

    return NextResponse.json({ sent: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send a reset link.";
    const status = message.includes("not configured") ? 503 : 500;
    return NextResponse.json({ error: status === 503 ? message : "Unable to send a reset link right now." }, { status });
  }
}
