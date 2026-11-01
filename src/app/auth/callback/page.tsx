"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Brand } from "@/components/auth/Brand";
import { getBrowserAuthClient } from "@/lib/supabase/browser-auth";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function finishSignIn() {
      try {
        const supabase = getBrowserAuthClient();
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!data.session) throw new Error("The sign-in link has expired. Please try again.");

        const response = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
          }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to verify your session.");

        const requestedPath = new URLSearchParams(window.location.search).get("next");
        const nextPath = requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
          ? requestedPath
          : "/dashboard";
        if (!active) return;
        router.replace(nextPath);
        router.refresh();
      } catch (error) {
        if (!active) return;
        setErrorMessage(error instanceof Error ? error.message : "Unable to complete sign-in.");
      }
    }

    void finishSignIn();
    return () => { active = false; };
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <Brand className="mb-7 justify-center" />
        {errorMessage ? (
          <>
            <h1 className="font-serif text-2xl text-slate-900">Sign-in link expired</h1>
            <p role="alert" className="mt-3 text-sm leading-6 text-slate-600">{errorMessage}</p>
            <Link href="/auth/signin" className="mt-6 inline-flex font-semibold text-blue-600 hover:text-blue-700">Return to sign in</Link>
          </>
        ) : (
          <>
            <h1 className="font-serif text-2xl text-slate-900">Finishing sign in</h1>
            <p className="mt-3 text-sm text-slate-600">Please wait while we verify your account.</p>
          </>
        )}
      </div>
    </main>
  );
}
