import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  createSupabaseAuthClient,
  REFRESH_TOKEN_COOKIE,
  sessionCookieOptions,
} from "@/lib/supabase/server-auth";

export async function POST(request: Request) {
  try {
    const { accessToken, refreshToken } = await request.json();
    if (typeof accessToken !== "string" || typeof refreshToken !== "string") {
      return NextResponse.json({ error: "A valid session is required." }, { status: 400 });
    }

    const supabase = createSupabaseAuthClient();
    const { data, error } = await supabase.auth.getUser(accessToken);
    if (error || !data.user) {
      return NextResponse.json({ error: "The sign-in session could not be verified." }, { status: 401 });
    }

    const response = NextResponse.json({ signedIn: true });
    response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, sessionCookieOptions(60 * 60));
    response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, sessionCookieOptions(60 * 60 * 24 * 30));
    return response;
  } catch {
    return NextResponse.json({ error: "Unable to complete sign-in right now." }, { status: 500 });
  }
}
