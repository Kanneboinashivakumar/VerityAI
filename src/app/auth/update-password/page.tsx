"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Brand } from "@/components/auth/Brand";
import { getBrowserAuthClient } from "@/lib/supabase/browser-auth";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");
    if (password.length < 8 || password !== confirmPassword) {
      setErrorMessage(password.length < 8 ? "Use at least 8 characters." : "The passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    try {
      const supabase = getBrowserAuthClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("This reset link has expired. Request a new one.");

      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      const { data: { session: updatedSession } } = await supabase.auth.getSession();
      if (updatedSession) {
        const response = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken: updatedSession.access_token, refreshToken: updatedSession.refresh_token }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Your new password was saved, but the session could not be refreshed. Sign in again.");
      }
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to update your password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 text-slate-900">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <Brand className="mb-8" />
        <h1 className="font-serif text-3xl">Choose a new password</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Use at least 8 characters for your new password.</p>
        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium">New password</label>
            <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
          </div>
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium">Confirm password</label>
            <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
          </div>
          {errorMessage && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</p>}
          <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B172A] px-4 py-3.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-70">
            {isSubmitting ? "Updating…" : "Update password"}<ArrowRight className="h-4 w-4" />
          </button>
        </form>
        <p className="mt-7 text-center text-sm text-slate-500"><Link href="/auth/signin" className="font-medium text-blue-600 hover:underline">Return to sign in</Link></p>
      </section>
    </main>
  );
}
