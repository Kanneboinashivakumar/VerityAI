"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";
import workspaceImage from "../../../../Assets/Modern Workspace with Laptop and Books.png";
import { Brand } from "@/components/auth/Brand";

export default function SignUpPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setConfirmationSent(false);
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to create your account.");
      if (result.needsEmailConfirmation) {
        setConfirmationSent(true);
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to create your account right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-100 bg-white/95">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-6">
          <Brand />
          <Link href="/auth/signin" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Sign in</Link>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-72px)] max-w-[1440px] lg:grid-cols-2">
        <section className="relative isolate flex min-h-[430px] items-center overflow-hidden px-7 py-12 sm:px-12 lg:min-h-[calc(100vh-72px)] lg:px-16">
          <Image src={workspaceImage} alt="" fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="-z-10 object-cover object-center" />
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-white/95 via-white/75 to-white/25" aria-hidden="true" />
          <div className="relative z-10 max-w-xl space-y-7">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">AI-assisted information intelligence</div>
            <h1 className="font-serif text-5xl font-normal leading-[1.02] tracking-tight text-[#0B172A] sm:text-6xl">Research<br />with confidence.</h1>
            <p className="max-w-lg text-base leading-7 text-slate-600">Verity AI analyzes information from multiple sources, detects gaps and conflicts, and gives you a clear verification checklist so you can make informed decisions.</p>
            <ul className="space-y-4 pt-2 text-sm text-slate-700">
              {[
                "Find missing information",
                "Spot conflicting details",
                "Check outdated content",
                "Get a verified checklist",
                "Make decisions with confidence",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-700" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="flex items-center justify-center px-7 py-12 sm:px-12 lg:px-16">
          <div className="w-full max-w-xl">
            <div className="mb-8">
              <h2 className="font-serif text-4xl font-normal tracking-tight text-[#0B172A]">Create your account</h2>
              <p className="mt-2 text-sm text-slate-500">Already have an account? <Link href="/auth/signin" className="font-medium text-blue-600 hover:text-blue-700">Sign in</Link></p>
            </div>

            {confirmationSent ? (
              <div role="status" className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm leading-6 text-blue-950">
                Check your email for the confirmation link. After confirming your address, sign in to open your dashboard.
                <div className="mt-4"><Link href="/auth/signin" className="font-semibold text-blue-700">Go to sign in <ArrowRight className="inline h-4 w-4" /></Link></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-slate-800">Name</label>
                  <input id="name" name="name" type="text" autoComplete="name" placeholder="Your name" required className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-slate-800">Email</label>
                  <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-800">Password</label>
                  <div className="relative">
                    <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={8} placeholder="Create a strong password" required className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                    <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-500 hover:text-slate-800">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="text-xs leading-5 text-slate-500">Use at least 8 characters with a mix of letters, numbers, and symbols.</p>
                </div>

                {errorMessage && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</p>}

                <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B172A] px-4 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-70">
                  <span>{isSubmitting ? "Creating account…" : "Create account"}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <p className="pt-2 text-center text-xs leading-5 text-slate-500">By creating an account, you agree to our <Link href="/security" className="text-blue-600 hover:underline">Terms of Service</Link> and <Link href="/security" className="text-blue-600 hover:underline">Privacy Policy</Link>.</p>
              </form>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
