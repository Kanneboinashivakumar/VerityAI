import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  createSupabaseAuthClient,
  REFRESH_TOKEN_COOKIE,
  sessionCookieOptions,
} from "@/lib/supabase/server-auth";

export async function POST(request: Request) {
  try {
    const { email, password, remember } = await request.json();
    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
      return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const supabase = createSupabaseAuthClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });
    if (error || !data.session) {
      return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    }

    const response = NextResponse.json({ user: { email: data.user.email } });
    response.cookies.set(
      ACCESS_TOKEN_COOKIE,
      data.session.access_token,
      sessionCookieOptions(remember === true ? data.session.expires_in : undefined),
    );
    response.cookies.set(
      REFRESH_TOKEN_COOKIE,
      data.session.refresh_token,
      sessionCookieOptions(remember === true ? 60 * 60 * 24 * 30 : undefined),
    );
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to sign in.";
    const status = message.includes("not configured") ? 503 : 500;
    return NextResponse.json({ error: status === 503 ? message : "Unable to sign in right now." }, { status });
  }
}
