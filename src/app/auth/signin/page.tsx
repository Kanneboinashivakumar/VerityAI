"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BarChart3, CheckCircle2, Eye, EyeOff, FileText, Github, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import workspaceImage from "../../../../Assets/Modern Workspace with Laptop and Books.png";
import { Brand } from "@/components/auth/Brand";
import { getBrowserAuthClient } from "@/lib/supabase/browser-auth";

export default function SignInPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oauthProvider, setOauthProvider] = useState<"google" | "github" | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
          remember: form.get("remember") === "on",
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to sign in.");

      const requestedPath = new URLSearchParams(window.location.search).get("next");
      const nextPath = requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
        ? requestedPath
        : "/dashboard";
      router.replace(nextPath);
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to sign in right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleOAuth(provider: "google" | "github") {
    setErrorMessage("");
    setOauthProvider(provider);
    try {
      const supabase = getBrowserAuthClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback?next=%2Fdashboard` },
      });
      if (error) throw error;
      if (!data.url) throw new Error("The sign-in provider could not be opened.");
      window.location.assign(data.url);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Social sign-in is unavailable.");
      setOauthProvider(null);
    }
  }

  const benefits = [
    { icon: FileText, title: "Analyze multiple sources", description: "Web pages, PDFs, and user-provided content" },
    { icon: ShieldCheck, title: "Identify gaps and conflicts", description: "See what’s missing, what’s uncertain, and what disagrees" },
    { icon: CheckCircle2, title: "Get a verification checklist", description: "Know exactly what to check next" },
    { icon: BarChart3, title: "Make better decisions", description: "With transparent evidence and source references" },
  ];

  return (
    <main className="min-h-screen bg-white text-[#0B172A] lg:grid lg:grid-cols-2">
      <section className="relative isolate flex min-h-[760px] flex-col overflow-hidden px-7 py-8 sm:px-12 lg:min-h-screen lg:px-16 lg:py-9">
        <Image src={workspaceImage} alt="" fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="-z-10 object-cover object-center" />
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-white/95 via-white/85 to-white/45" aria-hidden="true" />
        <div className="relative z-10 flex items-center justify-between gap-5">
          <Brand />
          <p className="text-right text-sm text-slate-600 sm:hidden">New here? <Link href="/auth/signup" className="font-medium text-blue-600">Sign up</Link></p>
        </div>

        <div className="relative z-10 my-auto max-w-xl space-y-7 py-12">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">AI-assisted information intelligence</div>
          <h1 className="font-serif text-5xl font-normal leading-[1.02] tracking-tight text-[#0B172A] sm:text-6xl">From scattered<br />information to<br />clear decisions.</h1>
          <p className="max-w-lg text-base leading-7 text-slate-600">Create your account to start researching with Verity AI — find gaps, detect conflicting claims, and get an evidence-backed checklist for what to verify.</p>

          <ul className="space-y-4 pt-1">
            {benefits.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50/90 text-blue-700"><Icon className="h-5 w-5" /></span>
                <span>
                  <span className="block text-sm font-semibold text-slate-900">{title}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-slate-600">{description}</span>
                </span>
              </li>
            ))}
          </ul>

          <blockquote className="rounded-2xl border border-white/70 bg-white/75 p-5 shadow-sm backdrop-blur-sm">
            <p className="text-sm italic leading-6 text-slate-600">“Verity AI helps me see the full picture — not just what’s available, but what’s missing and what I should verify.”</p>
            <footer className="mt-3 text-xs font-medium text-slate-500">— Student Researcher</footer>
          </blockquote>
        </div>
      </section>

      <section className="relative flex min-h-screen items-center justify-center px-7 py-16 sm:px-12 lg:px-16">
        <p className="absolute right-10 top-8 hidden text-sm text-slate-600 lg:block xl:right-16">
          Don&apos;t have an account? <Link href="/auth/signup" className="ml-2 font-medium text-blue-600 hover:text-blue-700">Sign up</Link>
        </p>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="font-serif text-4xl font-normal tracking-tight">Welcome back</h2>
            <p className="mt-2 text-base text-slate-500">Sign in to continue your research with Verity AI.</p>
          </div>

          <div className="space-y-3">
            <button type="button" onClick={() => void handleOAuth("google")} disabled={oauthProvider !== null} className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50 disabled:opacity-60">
              <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
                <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z" />
                <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.2A20 20 0 0 0 24 44Z" />
                <path fill="#FBBC05" d="M12.6 27.7a12 12 0 0 1 0-7.4v-5.2H5.8a20 20 0 0 0 0 17.8l6.8-5.2Z" />
                <path fill="#EA4335" d="M24 11.9c3 0 5.7 1 7.8 3.1l5.9-5.9C34.1 5.8 29.5 4 24 4A20 20 0 0 0 5.8 15.1l6.8 5.2c1.6-4.8 6.1-8.4 11.4-8.4Z" />
              </svg>
              {oauthProvider === "google" ? "Connecting…" : "Continue with Google"}
            </button>
            <button type="button" onClick={() => void handleOAuth("github")} disabled={oauthProvider !== null} className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50 disabled:opacity-60">
              <Github className="h-5 w-5" /> {oauthProvider === "github" ? "Connecting…" : "Continue with GitHub"}
            </button>
          </div>

          <div className="my-7 flex items-center gap-4 text-xs text-slate-500">
            <span className="h-px flex-1 bg-slate-200" /> OR <span className="h-px flex-1 bg-slate-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-800">Email address</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input id="email" name="email" type="email" autoComplete="email" placeholder="you@domain.com" required className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="password" className="block text-sm font-medium text-slate-800">Password</label>
                <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">Forgot password?</Link>
              </div>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" required className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-500 hover:text-slate-800">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {errorMessage && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</p>}

            <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B172A] px-4 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-70">
              <span>{isSubmitting ? "Signing in…" : "Sign in"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <label className="flex cursor-pointer items-center gap-3 pt-1 text-sm text-slate-700">
              <input type="checkbox" name="remember" defaultChecked className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              Keep me signed in
            </label>
          </form>

          <p className="mt-8 text-center text-xs leading-5 text-slate-500">By signing in, you agree to our <Link href="/security" className="text-blue-600 hover:underline">Terms of Service</Link> and <Link href="/security" className="text-blue-600 hover:underline">Privacy Policy</Link>.</p>
        </div>
      </section>
    </main>
  );
}
