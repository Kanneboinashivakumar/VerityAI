import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  createSupabaseAuthClient,
  REFRESH_TOKEN_COOKIE,
  sessionCookieOptions,
} from "@/lib/supabase/server-auth";

const protectedPaths = [
  "/dashboard",
  "/research",
  "/documents",
  "/comparison",
  "/my-research",
  "/saved",
  "/profile",
  "/notifications",
];

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  const signInUrl = new URL("/auth/signin", request.url);
  signInUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);

  if (!accessToken && !refreshToken) {
    return NextResponse.redirect(signInUrl);
  }

  try {
    const supabase = createSupabaseAuthClient();
    if (accessToken) {
      const { data, error } = await supabase.auth.getUser(accessToken);
      if (!error && data.user) return NextResponse.next();
    }

    if (refreshToken) {
      const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
      if (!error && data.session) {
        const response = NextResponse.next();
        response.cookies.set(ACCESS_TOKEN_COOKIE, data.session.access_token, sessionCookieOptions(data.session.expires_in));
        response.cookies.set(REFRESH_TOKEN_COOKIE, data.session.refresh_token, sessionCookieOptions(60 * 60 * 24 * 30));
        return response;
      }
    }
  } catch {
    // Treat configuration and network errors as unauthenticated; the auth page shows the user next steps.
  }

  const response = NextResponse.redirect(signInUrl);
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", { path: "/", maxAge: 0 });
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/research/:path*",
    "/documents/:path*",
    "/comparison/:path*",
    "/my-research/:path*",
    "/saved/:path*",
    "/profile/:path*",
    "/notifications/:path*",
  ],
};
