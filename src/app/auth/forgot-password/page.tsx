"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Brand } from "@/components/auth/Brand";

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email") }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to send a reset link.");
      setSent(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to send a reset link.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 text-slate-900">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <Brand className="mb-8" />
        <h1 className="font-serif text-3xl">Reset your password</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Enter your account email and we’ll send you a secure reset link.</p>

        {sent ? (
          <p role="status" className="mt-7 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900">If an account exists for that address, a password reset link is on its way.</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">Email address</label>
              <input id="email" name="email" type="email" autoComplete="email" required className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
            </div>
            {errorMessage && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</p>}
            <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B172A] px-4 py-3.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-70">
              {isSubmitting ? "Sending…" : "Send reset link"}<ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        <p className="mt-7 text-center text-sm text-slate-500"><Link href="/auth/signin" className="font-medium text-blue-600 hover:underline">Return to sign in</Link></p>
      </section>
    </main>
  );
}
