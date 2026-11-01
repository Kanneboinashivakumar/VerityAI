"use client";

import { useState } from "react";
import {
  Search,
  BookOpen,
  FileSearch,
  UploadCloud,
  Bookmark,
  GitCompare,
  Settings,
  ShieldCheck,
  CreditCard,
  Wrench,
  MessageSquare,
  Clock,
  Mail,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ExternalLink,
  Video,
  FileText,
  Users,
  Lightbulb,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [contactSuccess, setContactSuccess] = useState(false);

  const popularTags = [
    "research credits",
    "upload document",
    "verify information",
    "export report",
    "account settings",
  ];

  const helpTopics = [
    {
      title: "Getting Started",
      description: "Learn the basics of Verity AI and start your first research.",
      icon: BookOpen,
      color: "text-blue-600 bg-blue-50",
    },
    {
      title: "Research & Analysis",
      description: "How to create research, set parameters, and understand results.",
      icon: FileSearch,
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      title: "Documents & Uploads",
      description: "Upload, manage and analyze your own documents.",
      icon: UploadCloud,
      color: "text-blue-600 bg-blue-50",
    },
    {
      title: "Saved Items",
      description: "Manage your saved findings, sources and reports.",
      icon: Bookmark,
      color: "text-amber-600 bg-amber-50",
    },
    {
      title: "Research Comparison",
      description: "Compare documents and track changes over time.",
      icon: GitCompare,
      color: "text-purple-600 bg-purple-50",
    },
    {
      title: "Account & Settings",
      description: "Manage your profile, subscription and preferences.",
      icon: Settings,
      color: "text-slate-600 bg-slate-50",
    },
    {
      title: "Privacy & Security",
      description: "Learn how your data is protected and managed.",
      icon: ShieldCheck,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      title: "Billing & Subscriptions",
      description: "Manage your plan, payments and research credits.",
      icon: CreditCard,
      color: "text-sky-600 bg-sky-50",
    },
    {
      title: "Troubleshooting",
      description: "Common issues and their solutions.",
      icon: Wrench,
      color: "text-rose-600 bg-rose-50",
    },
  ];

  const faqs = [
    {
      q: "What are research credits and how do they work?",
      a: "Each research credit powers a complete end-to-end multi-source investigation: web crawling via TinyFish, deep content parsing, factual claim extraction, and contradiction analysis using Google Gemma. Credits renew on the 1st of each calendar month.",
    },
    {
      q: "How accurate is the information provided by Verity AI?",
      a: "Verity AI operates on a strict zero-hallucination policy. It only extracts and reports facts backed by verbatim citations from discovered or uploaded sources. Discrepancies between sources are explicitly flagged as contradictions or information gaps rather than guessed.",
    },
    {
      q: "Can I upload my own documents (PDF, images, etc.)?",
      a: "Yes! Verity AI supports PDF, plain text, and markdown files up to 25MB. Uploaded documents are parsed locally into text and cross-verified against live web sources or other documents.",
    },
    {
      q: "What types of sources does Verity AI search?",
      a: "Verity AI searches official institutional websites, government portals, accredited universities, company careers portals, regulatory filings, and recognized news media via TinyFish web search.",
    },
    {
      q: "How do I export a research report?",
      a: "From the Research Overview or Evidence Explorer page, click the 'Export Report' button in the top right to download a formatted Markdown (.md) or summary report ready for sharing.",
    },
    {
      q: "Can I compare two different documents?",
      a: "Yes. Use the Research Comparison tab from the sidebar to perform side-by-side comparative diffs, track additions, removals, and timeline changes between document versions.",
    },
    {
      q: "Is there a student discount?",
      a: "Yes! All verified students receive 25 free monthly research credits and full access to the Evidence Graph and Comparison Dashboard.",
    },
    {
      q: "How is my data stored and used?",
      a: "Your research queries and uploaded documents are strictly private to your account. We never sell your data or use your private research to train public foundation models.",
    },
  ];

  const popularGuides = [
    {
      title: "How to conduct your first research",
      time: "5 min read",
      desc: "A complete step-by-step guide to formulation, crawling, and review.",
    },
    {
      title: "Uploading and analyzing documents",
      time: "4 min read",
      desc: "Supported file types, best practices, and OCR parsing tips.",
    },
    {
      title: "Using research comparison",
      time: "6 min read",
      desc: "Track changes between policy or opportunity documents.",
    },
    {
      title: "Exporting and sharing reports",
      time: "3 min read",
      desc: "Generate PDF, Markdown or DOCX synthesis reports.",
    },
  ];

  const additionalResources = [
    {
      title: "Video Tutorials",
      desc: "Watch step-by-step walkthrough videos",
      icon: Video,
      href: "#",
    },
    {
      title: "User Documentation",
      desc: "Detailed API and platform references",
      icon: FileText,
      href: "#",
    },
    {
      title: "Community Forum",
      desc: "Ask questions and share findings with peers",
      icon: Users,
      href: "#",
    },
    {
      title: "Feature Requests",
      desc: "Suggest enhancements for the platform",
      icon: Lightbulb,
      href: "#",
    },
    {
      title: "Report an Issue",
      desc: "Help our team resolve bugs quickly",
      icon: AlertCircle,
      href: "#",
    },
  ];

  return (
    <main className="p-8 max-w-7xl w-full mx-auto space-y-8">
      {/* Header & Search Bar matching Reference Image 4 */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl font-normal text-slate-900">Help &amp; Support</h1>
          <p className="text-xs text-slate-500">
            Get help, find answers, and learn how to make the most of Verity AI.
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for help articles, guides, or questions..."
                className="w-full text-xs pl-10 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <button
              type="button"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors shrink-0 w-full sm:w-auto"
            >
              Search
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px] font-medium mr-1">Popular searches:</span>
            {popularTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60 text-[11px] font-medium transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 8 Cols: Browse Help Topics */}
        <div className="lg:col-span-8 space-y-8">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Browse Help Topics
            </h2>
            <p className="text-xs text-slate-500 -mt-2">
              Find step-by-step guides and resources.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {helpTopics.map((topic, idx) => {
                const Icon = topic.icon;
                return (
                  <div
                    key={idx}
                    className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${topic.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {topic.title}
                        </h3>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {topic.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Frequently Asked Questions */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="font-serif text-lg font-normal text-slate-900">
                Frequently Asked Questions
              </h2>
              <span className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer">
                View All FAQs &rarr;
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="py-3">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-900 hover:text-blue-600 transition-colors py-1"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <p className="text-xs text-slate-600 leading-relaxed pt-2 pb-1 pr-6">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Quick Support, Status & Additional Resources */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Support Card matching Reference Image 4 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Quick Support</h3>
                <p className="text-[11px] text-slate-400">Need immediate help? We are here.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setContactSuccess(true);
                setTimeout(() => setContactSuccess(false), 3000);
              }}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              {contactSuccess ? "Message Sent!" : "Contact Support"}
            </button>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] font-medium text-slate-700">support@verityai.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px]">Response time: Within 24 hours</span>
              </div>
              <div className="flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px]">Support Hours: Mon – Fri, 9:00 AM – 6:00 PM IST</span>
              </div>
            </div>
          </div>

          {/* System Status Card matching Reference Image 4 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-xs font-bold text-slate-900">System Status</h3>
            </div>
            <div className="text-xs font-bold text-emerald-700">All Systems Operational</div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Verity AI is running smoothly. All features, crawlers and AI evidence pipelines are working as expected.
            </p>
            <div className="pt-1">
              <Link
                href="/api/health/live"
                target="_blank"
                className="text-[11px] font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                <span>View Status Page</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Popular Guides Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Popular Guides</h3>
              <span className="text-[11px] text-blue-600 font-semibold cursor-pointer">View All</span>
            </div>

            <div className="space-y-2">
              {popularGuides.map((guide, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span className="truncate pr-2">{guide.title}</span>
                    <span className="text-[10px] text-slate-400 shrink-0 font-normal">{guide.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">{guide.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Resources List matching Reference Image 4 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Additional Resources</h3>
            <div className="space-y-2">
              {additionalResources.map((res, idx) => {
                const Icon = res.icon;
                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate transition-colors">
                          {res.title}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">{res.desc}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 transition-colors shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
