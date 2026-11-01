"use client";

import Link from "next/link";
import Image from "next/image";
import workspaceHero from "../../Assets/Verity AI Research Workspace.png";
import ctaBackdrop from "../../Assets/Moody Blue Office Workspace.png";
import {
  FileText,
  ShieldCheck,
  Search,
  Clock,
  CheckSquare,
  Network,
  Globe,
  Scan,
  GraduationCap,
  Briefcase,
  Building,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function LandingPage() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Header / Navbar */}
      <header className="border-b border-slate-100 bg-white/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-[1440px] mx-auto px-6 h-[60px] flex items-center justify-between">
          {/* Official Black Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo-black.png"
              alt="Verity AI"
              width={140}
              height={38}
              priority
              className="w-[128px] h-auto object-contain"
            />
          </Link>

          {/* Navigation Links with exact active indicator */}
          <nav className="hidden md:flex items-center space-x-9 text-sm font-medium text-slate-600">
            <div className="relative py-2">
              <Link href="/" className="text-slate-900 font-semibold">Home</Link>
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />
            </div>
            <Link href="#how-it-works" className="hover:text-slate-900 transition-colors">How it works</Link>
            <Link href="#use-cases" className="hover:text-slate-900 transition-colors">Use cases</Link>
            <Link href="/pricing" className="hover:text-slate-900 transition-colors">Pricing</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link
              href="/auth/signin"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2 bg-slate-100/70 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl shadow-xs transition-colors"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative isolate overflow-hidden py-10 lg:py-12 px-6 min-h-[clamp(440px,50vw,800px)] flex items-center">
        <Image
          src={workspaceHero}
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover object-right"
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-white/95 via-white/55 to-transparent" aria-hidden="true" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full max-w-[1440px] mx-auto">
          {/* Left Column Content */}
          <div className="lg:col-span-6 space-y-5 z-10">
            <div className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase">
              AI-ASSISTED INFORMATION INTELLIGENCE
            </div>

            <h1 className="font-serif text-5xl sm:text-6xl font-normal tracking-tight text-slate-950 leading-[1.12]">
              Verify before <br />
              <span className="italic">you decide.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg">
              Verity AI analyzes information from multiple sources, identifies gaps, conflicting claims, outdated details, and unanswered questions — and gives you a clear, evidence-backed checklist to verify what matters.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-navy-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl shadow-md transition-all group"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center px-6 py-3.5 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 text-sm font-semibold rounded-xl shadow-xs transition-colors"
              >
                See How It Works
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-5 pt-4 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-slate-800" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-slate-800" />
                <span>Start for free</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-slate-800" />
                <span>Built for real-world decisions</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-4 border-y border-slate-100 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-0">
          <div className="p-4 rounded-xl text-center space-y-2 lg:border-r lg:border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Multi-Source Analysis</h3>
            <p className="text-[11px] text-slate-500 leading-snug">Web pages, PDFs, and user-provided content</p>
          </div>

          <div className="p-4 rounded-xl text-center space-y-2 lg:border-r lg:border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Detects Conflicts</h3>
            <p className="text-[11px] text-slate-500 leading-snug">Finds contradictory information across sources</p>
          </div>

          <div className="p-4 rounded-xl text-center space-y-2 lg:border-r lg:border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Identifies Gaps</h3>
            <p className="text-[11px] text-slate-500 leading-snug">Highlights missing details and what to verify</p>
          </div>

          <div className="p-4 rounded-xl text-center space-y-2 lg:border-r lg:border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Checks Freshness</h3>
            <p className="text-[11px] text-slate-500 leading-snug">Flags outdated information</p>
          </div>

          <div className="p-4 rounded-xl text-center space-y-2 lg:border-r lg:border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Actionable Checklist</h3>
            <p className="text-[11px] text-slate-500 leading-snug">Prioritized next steps with source references</p>
          </div>

          <div className="p-4 rounded-xl text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Network className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Evidence Graph</h3>
            <p className="text-[11px] text-slate-500 leading-snug">Visualize claims and supporting sources</p>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-10 px-6 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-6 space-y-4">
            <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
              THE PROBLEM
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-slate-900 leading-snug">
              Important information is scattered, incomplete and often conflicting.
            </h2>
          </div>
          <div className="lg:col-span-6 space-y-4 text-sm text-slate-600 leading-relaxed pt-2">
            <p>
              Whether you are exploring a scholarship, comparing job opportunities, researching a policy, or making any important decision, you have to check multiple websites, documents and sources. Information may be outdated, different sources may provide conflicting details, and key questions often remain unanswered.
            </p>
            <p>
              Verity AI helps you see the full picture — not just what&apos;s available, but what&apos;s missing and what to verify.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-10 px-6 max-w-[1440px] mx-auto border-t border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-3">
            <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
              HOW IT WORKS
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-slate-900">
              From scattered information to a clear decision path.
            </h2>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl relative">
            <div className="text-slate-400 font-mono text-xs font-semibold mb-4">01</div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">Add your topic</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enter a question, paste URLs, or upload documents.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl relative">
            <div className="text-slate-400 font-mono text-xs font-semibold mb-4">02</div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Scan className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">We analyze sources</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Verity AI extracts and organizes key information from multiple sources.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl relative">
            <div className="text-slate-400 font-mono text-xs font-semibold mb-4">03</div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">Find gaps & conflicts</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Detects missing information, contradictory claims and outdated details.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl relative">
            <div className="text-slate-400 font-mono text-xs font-semibold mb-4">04</div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">Get verification checklist</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Receive a clear, prioritized list of what to verify next, with evidence and sources.
            </p>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-10 px-6 max-w-[1440px] mx-auto border-t border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-3">
            <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
              USE CASES
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-slate-900">
              Useful for many real-world decisions.
            </h2>
          </div>
          <Link href="/dashboard" className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700">
            <span>Explore all use cases</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-slate-50/60 border border-slate-100 rounded-2xl hover:bg-white hover:border-slate-200 hover:shadow-xs transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center mb-4">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Students</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Scholarships, internships, college admissions</p>
          </div>

          <div className="p-6 bg-slate-50/60 border border-slate-100 rounded-2xl hover:bg-white hover:border-slate-200 hover:shadow-xs transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center mb-4">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Job Seekers</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Company research, job roles, policies</p>
          </div>

          <div className="p-6 bg-slate-50/60 border border-slate-100 rounded-2xl hover:bg-white hover:border-slate-200 hover:shadow-xs transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center mb-4">
              <Building className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Public Services</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Government schemes, benefits, eligibility</p>
          </div>

          <div className="p-6 bg-slate-50/60 border border-slate-100 rounded-2xl hover:bg-white hover:border-slate-200 hover:shadow-xs transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Researchers</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Academic and professional research</p>
          </div>
        </div>
      </section>

      {/* CTA Banner Section matching exact screenshot */}
      <section className="py-6 px-6 max-w-[1440px] mx-auto">
        <div
          className="rounded-3xl p-10 sm:p-14 text-white relative overflow-hidden shadow-2xl bg-cover bg-center border border-slate-800"
          style={{ backgroundImage: `url('${ctaBackdrop.src}')` }}
        >
          {/* Subtle gradient overlay to ensure perfect readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-navy-900/95 via-navy-900/80 to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <div className="text-[11px] font-semibold text-slate-300 tracking-wider uppercase">
                TURN INFORMATION INTO CONFIDENCE
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal leading-tight text-white">
                Start verifying what matters.
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Identify gaps, check conflicting information, and make better decisions with Verity AI.
              </p>
            </div>

            <div className="flex flex-col items-start sm:items-center gap-3 shrink-0">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-white hover:bg-slate-100 text-slate-900 text-sm font-semibold rounded-xl shadow-lg transition-colors"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <span className="text-xs text-slate-300 font-medium">
                No credit card required • Start for free
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Complete Approved Footer matching reference image */}
      <footer className="border-t border-slate-100 bg-white pt-16 pb-12 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
            {/* Brand Column (3 cols) */}
            <div className="lg:col-span-3 space-y-4">
              <Link href="/">
                <Image
                  src="/logo-black.png"
                  alt="Verity AI"
                  width={150}
                  height={40}
                  className="w-[140px] h-auto object-contain"
                />
              </Link>

              <p className="text-xs text-slate-500 leading-relaxed">
                <span className="font-semibold text-slate-700">Verity AI helps</span> you discover what&apos;s known, what&apos;s uncertain, and what still needs to be verified — so you can make informed decisions with confidence.
              </p>

              {/* Social Icons */}
              <div className="flex items-center gap-4 pt-2 text-slate-800">
                <Link href="https://github.com" target="_blank" className="hover:text-blue-600 transition-colors">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                </Link>
                <Link href="https://linkedin.com" target="_blank" className="hover:text-blue-600 transition-colors">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </Link>
                <Link href="https://x.com" target="_blank" className="hover:text-blue-600 transition-colors">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </Link>
                <Link href="https://youtube.com" target="_blank" className="hover:text-blue-600 transition-colors">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Product (2 cols) */}
            <div className="lg:col-span-2 space-y-3 lg:border-l lg:border-slate-100 lg:pl-8">
              <h4 className="text-xs font-bold text-slate-900">Product</h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li><Link href="/" className="hover:text-slate-900 transition-colors">Home</Link></li>
                <li><Link href="#how-it-works" className="hover:text-slate-900 transition-colors">How it works</Link></li>
                <li><Link href="#use-cases" className="hover:text-slate-900 transition-colors">Use cases</Link></li>
                <li><Link href="/pricing" className="hover:text-slate-900 transition-colors">Pricing</Link></li>
                <li><Link href="/dashboard" className="hover:text-slate-900 transition-colors">Features</Link></li>
                <li><Link href="/help" className="hover:text-slate-900 transition-colors">FAQ</Link></li>
              </ul>
            </div>

            {/* Use Cases (2 cols) */}
            <div className="lg:col-span-2 space-y-3 lg:border-l lg:border-slate-100 lg:pl-8">
              <h4 className="text-xs font-bold text-slate-900">Use Cases</h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li><Link href="/dashboard" className="hover:text-slate-900 transition-colors">Students</Link></li>
                <li><Link href="/dashboard" className="hover:text-slate-900 transition-colors">Job Seekers</Link></li>
                <li><Link href="/dashboard" className="hover:text-slate-900 transition-colors">Public Services</Link></li>
                <li><Link href="/dashboard" className="hover:text-slate-900 transition-colors">Researchers</Link></li>
                <li><Link href="/dashboard" className="hover:text-slate-900 transition-colors">Policy Analysis</Link></li>
                <li><Link href="/dashboard" className="hover:text-slate-900 transition-colors">Product Research</Link></li>
              </ul>
            </div>

            {/* Company (2 cols) */}
            <div className="lg:col-span-2 space-y-3 lg:border-l lg:border-slate-100 lg:pl-8">
              <h4 className="text-xs font-bold text-slate-900">Company</h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li><Link href="/help" className="hover:text-slate-900 transition-colors">About Us</Link></li>
                <li><Link href="/help" className="hover:text-slate-900 transition-colors">Our Mission</Link></li>
                <li><Link href="/help" className="hover:text-slate-900 transition-colors">Blog</Link></li>
                <li><Link href="/help" className="hover:text-slate-900 transition-colors">Careers</Link></li>
                <li><Link href="/help" className="hover:text-slate-900 transition-colors">Contact Us</Link></li>
              </ul>
            </div>

            {/* Stay Updated (3 cols) */}
            <div className="lg:col-span-3 space-y-3 lg:border-l lg:border-slate-100 lg:pl-8">
              <h4 className="text-xs font-bold text-slate-900">Stay Updated</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Get the latest updates, tips, and new features from Verity AI.
              </p>

              <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="w-9 h-9 rounded-xl bg-navy-900 hover:bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
              <p className="text-[10px] text-slate-400">We respect your privacy. No spam, ever.</p>
            </div>
          </div>

          {/* Subfooter */}
          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div>
              © 2026 Verity AI. All rights reserved.
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <Link href="/security" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
              <span>|</span>
              <Link href="/security" className="hover:text-slate-600 transition-colors">Terms of Service</Link>
              <span>|</span>
              <Link href="/security" className="hover:text-slate-600 transition-colors">Cookie Policy</Link>
              <span>|</span>
              <Link href="/security" className="hover:text-slate-600 transition-colors">Security</Link>
              <span>|</span>
              <Link href="/help" className="hover:text-slate-600 transition-colors">Sitemap</Link>
            </div>

            {/* Back to top button */}
            <button
              onClick={scrollToTop}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              title="Back to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
