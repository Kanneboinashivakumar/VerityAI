import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  createSupabaseAuthClient,
  REFRESH_TOKEN_COOKIE,
  sessionCookieOptions,
} from "@/lib/supabase/server-auth";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    if (
      typeof name !== "string" || !name.trim() ||
      typeof email !== "string" || !email ||
      typeof password !== "string" || password.length < 8
    ) {
      return NextResponse.json({ error: "Enter your name and email, and use a password with at least 8 characters." }, { status: 400 });
    }

    const supabase = createSupabaseAuthClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name.trim() } },
    });
    if (error) {
      if (/fetch failed|network|failed to fetch/i.test(error.message)) {
        return NextResponse.json(
          { error: "We couldn't reach the account service. Check your connection and try again." },
          { status: 503 },
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const response = NextResponse.json({ needsEmailConfirmation: !data.session });
    if (data.session) {
      response.cookies.set(ACCESS_TOKEN_COOKIE, data.session.access_token, sessionCookieOptions(data.session.expires_in));
      response.cookies.set(REFRESH_TOKEN_COOKIE, data.session.refresh_token, sessionCookieOptions(60 * 60 * 24 * 30));
    }
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create your account.";
    const isServiceUnavailable = /not configured|fetch failed|network|failed to fetch/i.test(message);
    const status = isServiceUnavailable ? 503 : 500;
    const responseMessage = message.includes("not configured")
      ? message
      : isServiceUnavailable
        ? "We couldn't reach the account service. Check your connection and try again."
        : "Unable to create your account right now.";
    return NextResponse.json({ error: responseMessage }, { status });
  }
}
