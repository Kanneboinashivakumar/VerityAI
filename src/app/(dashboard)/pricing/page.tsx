"use client";

import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Brand } from "@/components/auth/Brand";

export default function PricingPage() {
  const plans = [
    {
      name: "Starter / Hackathon",
      price: "$0",
      period: "forever",
      description: "Ideal for student research, scholarship verification, and individual fact-checking.",
      features: [
        "10 Real-time investigations / month",
        "TinyFish live website discovery & fetch",
        "Gemma 4 claim extraction & gap analysis",
        "Document uploads up to 25MB",
        "Evidence graph & checklist export",
      ],
      current: true,
      btnText: "Current Plan",
    },
    {
      name: "Pro Researcher",
      price: "$19",
      period: "per month",
      description: "For deep research workflows, policy analysts, journalists, and power users.",
      features: [
        "Unlimited investigations",
        "TinyFish Deep Crawl & Agent search",
        "Priority Gemma 4 31B reasoning",
        "Full PDF OCR & multimodal extraction",
        "Export to PDF, Markdown, and Slides",
        "Dedicated background job queues",
      ],
      current: false,
      btnText: "Upgrade to Pro",
      popular: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0B172A]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-6">
          <Brand />
          <nav aria-label="Main navigation" className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
            <Link href="/" className="hover:text-slate-950">Home</Link>
            <Link href="/#how-it-works" className="hover:text-slate-950">How it works</Link>
            <Link href="/#use-cases" className="hover:text-slate-950">Use cases</Link>
            <span aria-current="page" className="font-medium text-blue-700">Pricing</span>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/signin" className="hidden rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:inline-flex">Sign in</Link>
            <Link href="/auth/signup" className="inline-flex items-center gap-2 rounded-xl bg-[#0B172A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1120px] px-6 py-16 sm:py-20">
        <div className="mb-12 text-center">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Straightforward plans</div>
          <h1 className="font-serif text-4xl font-normal tracking-tight sm:text-5xl">Pricing and plans</h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">Choose the research intelligence plan tailored to your decision verification needs.</p>
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {plans.map((plan) => (
            <article key={plan.name} className={`relative flex flex-col justify-between rounded-3xl border bg-white p-7 shadow-sm sm:p-8 ${plan.popular ? "border-blue-500 ring-1 ring-blue-200" : "border-slate-200"}`}>
              {plan.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white">Most Popular</span>}
              <div>
                <h2 className="text-lg font-semibold">{plan.name}</h2>
                <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-600">{plan.description}</p>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="font-serif text-5xl">{plan.price}</span>
                  <span className="text-sm text-slate-500">/{plan.period}</span>
                </div>
                <ul className="mt-7 space-y-3 border-t border-slate-100 pt-6 text-sm text-slate-700">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-8">
                <button disabled={plan.current} className={`w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${plan.current ? "cursor-default bg-slate-100 text-slate-500" : "bg-[#0B172A] text-white hover:bg-slate-800"}`}>
                  {plan.btnText}
                </button>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-slate-500">Need help choosing? <Link href="/help" className="font-medium text-blue-700 hover:underline">Contact our team</Link></p>
      </main>
    </div>
  );
}
