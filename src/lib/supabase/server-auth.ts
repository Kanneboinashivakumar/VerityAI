import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

export const ACCESS_TOKEN_COOKIE = "verity-access-token";
export const REFRESH_TOKEN_COOKIE = "verity-refresh-token";

export function createSupabaseAuthClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase authentication is not configured.");
  }

  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

const userCache = new Map<string, { user: any; expiresAt: number }>();

export async function getAuthenticatedUser(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) return null;

  // 1. Fast in-memory cache lookup
  const cached = userCache.get(accessToken);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.user;
  }

  // 2. High-speed JWT payload decode (avoids blocking 1-2s network roundtrip)
  try {
    const parts = accessToken.split(".");
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
      if (payload && payload.exp && payload.exp * 1000 > Date.now()) {
        const user = {
          id: payload.sub,
          email: payload.email,
          user_metadata: payload.user_metadata || {},
          role: payload.role,
        };
        userCache.set(accessToken, { user, expiresAt: payload.exp * 1000 });
        return user;
      }
    }
  } catch {}

  // 3. Fallback to Supabase Auth API
  try {
    const { data, error } = await createSupabaseAuthClient().auth.getUser(accessToken);
    if (!error && data.user) {
      userCache.set(accessToken, { user: data.user, expiresAt: Date.now() + 60 * 1000 });
      return data.user;
    }
  } catch {}

  return null;
}

export function sessionCookieOptions(maxAge?: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    ...(maxAge === undefined ? {} : { maxAge }),
  };
}
