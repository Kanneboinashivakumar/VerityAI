"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Link as LinkIcon,
  Upload,
  FileText,
  Globe,
  ArrowRight,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";

interface ResearchSummary {
  id: string;
  job_id: string | null;
  title: string;
  research_question: string;
  status: string;
  created_at: string;
  sources_count: number;
  report_ready: boolean;
}

interface SavedSummary {
  id: string;
  title: string;
  item_type: string;
  project_id: string;
  saved_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("SHIVA KUMAR");
  const [question, setQuestion] = useState("");
  const [activeSourceType, setActiveSourceType] = useState<"urls" | "upload" | "text" | "discover">("discover");
  const [urlsInput, setUrlsInput] = useState("");
  const [pastedTextInput, setPastedTextInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const idempotencyKey = useRef<string | null>(null);
  const [researches, setResearches] = useState<ResearchSummary[]>([]);
  const [researchError, setResearchError] = useState("");
  const [savedItems, setSavedItems] = useState<SavedSummary[]>([]);

  // Load user profile
  useEffect(() => {
    fetch("/api/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((profile) => {
        if (!profile) return;
        const name = profile.display_name || "SHIVA KUMAR";
        setUserName(name.toLowerCase().includes("shiva") ? "SHIVA KUMAR" : name);
      })
      .catch(() => {});
  }, []);

  // Real-time auto-refresh research
  useEffect(() => {
    let active = true;
    const refreshResearch = async () => {
      try {
        const response = await fetch("/api/research", { cache: "no-store" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to load your research.");
        if (active) {
          setResearches(result.projects || []);
          setResearchError("");
        }
      } catch (error) {
        if (active) setResearchError(error instanceof Error ? error.message : "Unable to load your research.");
      }
    };
    void refreshResearch();
    const interval = window.setInterval(refreshResearch, 3000);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void refreshResearch();
    };
    window.addEventListener("focus", refreshResearch);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshResearch);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  // Load saved items
  useEffect(() => {
    fetch("/api/saved", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : { items: [] }))
      .then((result) => setSavedItems((result.items || []).slice(0, 4)))
      .catch(() => {});
  }, []);

  // Compute live statistics for activity donut
  const totalAnalyses = researches.length;
  const completedCount = researches.filter(
    (item) => item.status === "completed" || item.status === "completed_with_warnings"
  ).length;
  const inProgressCount = researches.filter(
    (item) => !["completed", "completed_with_warnings", "failed", "cancelled"].includes(item.status)
  ).length;
  const needReviewCount = researches.filter(
    (item) => item.status === "completed_with_warnings" || item.status === "active"
  ).length;
  const savedCount = savedItems.length;

  const totalForDonut = Math.max(totalAnalyses, 1);
  const completedPct = totalAnalyses > 0 ? (completedCount / totalForDonut) * 100 : 0;
  const inProgressPct = totalAnalyses > 0 ? (inProgressCount / totalForDonut) * 100 : 0;
  const needReviewPct = totalAnalyses > 0 ? (needReviewCount / totalForDonut) * 100 : 0;

  const handleStartAnalysis = async () => {
    if (!question.trim()) return;
    setResearchError("");
    setIsSubmitting(true);

    try {
      const urls = urlsInput
        .split("\n")
        .map((u) => u.trim())
        .filter(Boolean);

      let extractedDocText = "";
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadRes = await fetch("/api/documents/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "Unable to extract text from the PDF.");
        extractedDocText = uploadData.extractedText || "";
      }

      if (!idempotencyKey.current) idempotencyKey.current = crypto.randomUUID();

      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey.current },
        body: JSON.stringify({
          question: question.trim(),
          urls,
          pastedText: [pastedTextInput.trim(), extractedDocText].filter(Boolean).join("\n\n") || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start research.");
      router.push(`/research/${data.job_id}/progress`);
    } catch (err) {
      setResearchError(err instanceof Error ? err.message : "Failed to start research.");
      setIsSubmitting(false);
    }
  };

  const recentResearches = researches.slice(0, 6).map((item) => {
    const isComplete = item.status === "completed" || item.status === "completed_with_warnings";
    const isFailed = item.status === "failed";
    const isInProgress = !isComplete && !isFailed && item.status !== "cancelled";
    return {
      ...item,
      subtitle: item.research_question,
      date: new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      statusLabel: isComplete ? "Completed" : isFailed ? "Failed" : isInProgress ? "In Progress" : item.status.replaceAll("_", " "),
      statusColor: isComplete
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : isFailed
        ? "bg-rose-50 text-rose-700 border-rose-200"
        : isInProgress
        ? "bg-blue-50 text-blue-700 border-blue-200"
        : "bg-amber-50 text-amber-700 border-amber-200",
    };
  });

  return (
    <main className="p-8 max-w-7xl w-full mx-auto space-y-8">
      {/* Welcome Banner matching sample 3rd image with full uncropped Image 2 as background */}
      <div className="relative overflow-hidden rounded-2xl min-h-[220px] sm:min-h-[250px] lg:min-h-[275px] flex items-center p-6 sm:p-10 mb-8 border border-slate-100/80 shadow-xs bg-slate-50">
        {/* Full uncropped Image 2 background */}
        <img
          src="/dashboard-hero-bg.png"
          alt="Verity AI research workspace"
          className="absolute inset-0 h-full w-full object-cover object-[center_right] pointer-events-none"
        />

        {/* Smooth white gradient overlay across the left for crisp text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 via-35% sm:via-white/90 sm:via-42% to-transparent to-65% pointer-events-none" />

        {/* Text content matching Image 3 */}
        <div className="max-w-xl space-y-2 relative z-10">
          <div className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
            WELCOME BACK, {userName.toUpperCase()} 👋
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-slate-900 leading-tight">
            Turn information into confidence.
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg">
            Ask a question, add your sources, and let Verity AI analyze, find gaps, detect conflicts, and give you an evidence-backed understanding of what&apos;s true.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Cols: New Investigation Card */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Start a new investigation</h2>
                <p className="text-xs text-slate-500">What would you like to research or verify today?</p>
              </div>
            </div>

            {/* Primary Query Input */}
            <div className="space-y-2">
              <textarea
                rows={2}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter a research question, topic, or goal..."
                className="w-full text-sm text-slate-900 placeholder:text-slate-400 p-4 rounded-xl border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
              />
              <div className="text-[11px] text-slate-400">
                e.g., &ldquo;Is this scholarship genuine?&rdquo;, &ldquo;Compare these job requirements&rdquo;, &ldquo;Check this policy update&rdquo;
              </div>
            </div>

            {/* Source Selection Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setActiveSourceType("urls")}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  activeSourceType === "urls"
                    ? "border-blue-500 bg-blue-50/50 shadow-xs"
                    : "border-slate-200/80 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-900">Add URLs</div>
                <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">Analyze website links</div>
              </button>

              <button
                type="button"
                onClick={() => setActiveSourceType("upload")}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  activeSourceType === "upload"
                    ? "border-rose-500 bg-rose-50/50 shadow-xs"
                    : "border-slate-200/80 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mb-2">
                  <Upload className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-900">Upload documents</div>
                <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">PDFs, reports, DOCX files</div>
              </button>

              <button
                type="button"
                onClick={() => setActiveSourceType("text")}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  activeSourceType === "text"
                    ? "border-purple-500 bg-purple-50/50 shadow-xs"
                    : "border-slate-200/80 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-900">Paste text</div>
                <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">Articles, notices, announcements</div>
              </button>

              <button
                type="button"
                onClick={() => setActiveSourceType("discover")}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  activeSourceType === "discover"
                    ? "border-emerald-500 bg-emerald-50/50 shadow-xs"
                    : "border-slate-200/80 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-900">Discover sources</div>
                <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">Search the web for info</div>
              </button>
            </div>

            {/* Sub-inputs based on source selection */}
            {activeSourceType === "urls" && (
              <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <label className="text-[11px] font-semibold text-slate-700">Enter URLs (one per line):</label>
                <textarea
                  rows={2}
                  value={urlsInput}
                  onChange={(e) => setUrlsInput(e.target.value)}
                  placeholder="https://example.org/guidelines&#10;https://example.org/policy"
                  className="w-full text-xs p-2.5 bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}

            {activeSourceType === "text" && (
              <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <label className="text-[11px] font-semibold text-slate-700">Paste text content:</label>
                <textarea
                  rows={3}
                  value={pastedTextInput}
                  onChange={(e) => setPastedTextInput(e.target.value)}
                  placeholder="Paste guidelines, contract excerpts, or article text here..."
                  className="w-full text-xs p-2.5 bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}

            {activeSourceType === "upload" && (
              <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-2 bg-slate-50/50">
                <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                <label className="block text-xs text-slate-600 font-medium" htmlFor="dashboard-pdf">
                  Upload PDF document for verification
                </label>
                <input
                  id="dashboard-pdf"
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                  className="mx-auto max-w-full text-xs"
                />
                {selectedFile && <p className="text-xs text-emerald-700">Selected: {selectedFile.name}</p>}
                <p className="text-[11px] text-slate-400">PDFs up to 25MB supported</p>
              </div>
            )}

            {researchError && (
              <p role="alert" className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {researchError}
              </p>
            )}

            {/* Bottom Trigger bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-[10px]">
                  +
                </span>
                <span>You can combine multiple source types in one investigation.</span>
              </div>

              <button
                type="button"
                disabled={isSubmitting || !question.trim()}
                onClick={handleStartAnalysis}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0B172A] hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-all w-full sm:w-auto justify-center"
              >
                <span>{isSubmitting ? "Starting..." : "Analyze"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Recent Research Table matching approved design */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Recent Research</h3>
              <Link href="/my-research" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {recentResearches.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">
                  {researchError || "Your investigations will appear here after your first analysis."}
                </p>
              ) : (
                recentResearches.map((item) => (
                  <div
                    key={item.id}
                    className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/50 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{item.title}</h4>
                        <p className="text-[11px] text-slate-400 truncate">{item.subtitle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-[11px] text-slate-500 hidden sm:block">
                        {item.sources_count} sources
                      </div>
                      <div className="text-[11px] text-slate-400 hidden sm:block">
                        {item.date}
                      </div>
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${item.statusColor}`}>
                        {item.statusLabel}
                      </span>
                      <Link
                        href={
                          item.report_ready
                            ? `/research/${item.id}/report`
                            : item.job_id
                            ? `/research/${item.job_id}/progress`
                            : `/research/${item.id}/report`
                        }
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-blue-600"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Activity Donut, Quick Tips, Saved Items */}
        <div className="lg:col-span-4 space-y-6">
          {/* Research Activity Donut Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900">Your Research Activity</h3>
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <span>This month</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Donut graphic */}
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {completedPct > 0 && (
                    <path
                      className="text-emerald-500"
                      strokeDasharray={`${completedPct}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  )}
                  {inProgressPct > 0 && (
                    <path
                      className="text-blue-500"
                      strokeDashoffset={`-${completedPct}`}
                      strokeDasharray={`${inProgressPct}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  )}
                  {needReviewPct > 0 && (
                    <path
                      className="text-amber-500"
                      strokeDashoffset={`-${completedPct + inProgressPct}`}
                      strokeDasharray={`${needReviewPct}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  )}
                </svg>
                <div className="absolute text-center">
                  <div className="text-xl font-bold text-slate-900 leading-none">{totalAnalyses}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">Analyses</div>
                </div>
              </div>

              {/* Breakdown legends matching reference design */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-slate-800 font-semibold">{completedCount}</span>
                  <span className="text-slate-500">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-slate-800 font-semibold">{inProgressCount}</span>
                  <span className="text-slate-500">In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-slate-800 font-semibold">{needReviewCount}</span>
                  <span className="text-slate-500">Need Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                  <span className="text-slate-800 font-semibold">{savedCount}</span>
                  <span className="text-slate-500">Saved</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-amber-600">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-slate-900">Quick Tips</h3>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group">
                <span>Be specific in your research question</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group">
                <span>Add multiple sources for better results</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group">
                <span>Upload official documents for verification</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group">
                <span>Check for conflicting information</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>

          {/* Saved Items */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900">Saved Items</h3>
              <Link href="/saved" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {savedItems.length ? (
              <div className="divide-y divide-slate-100">
                {savedItems.map((item) => (
                  <Link
                    href={`/research/${item.project_id}/report`}
                    key={item.id}
                    className="flex items-center gap-2 py-2.5 hover:bg-slate-50"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-blue-600" />
                    <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-700">
                      {item.title}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-xs text-slate-500">
                Saved findings and reports will appear here after you save them.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
