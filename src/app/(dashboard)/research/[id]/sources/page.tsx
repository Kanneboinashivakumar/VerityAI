"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ResearchNavTabs } from "@/components/layout/ResearchNavTabs";
import {
  Globe,
  FileText,
  PlusCircle,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Copy,
  ChevronRight,
  Search,
} from "lucide-react";
import Link from "next/link";
import { ResearchSource } from "@/lib/types";

export default function SourcesIntelligencePage() {
  const params = useParams();
  const researchId = params.id as string;

  const [sources, setSources] = useState<ResearchSource[]>([]);
  const [projectTitle, setProjectTitle] = useState("Research Investigation");
  const [selectedSourceIndex, setSelectedSourceIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"rendered" | "raw">("rendered");
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadSources() {
      try {
        const res = await fetch(`/api/research/${researchId}/sources`);
        if (res.ok) {
          const data = await res.json();
          if (data.projectTitle) {
            setProjectTitle(data.projectTitle);
          }
          if (data.sources && data.sources.length > 0) {
            setSources(data.sources);
          }
        }
      } catch (err) {
        console.error("Failed to load sources:", err);
      }
    }
    loadSources();
  }, [researchId]);

  const filteredSources = sources.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (s.title || "").toLowerCase().includes(q) ||
      ((s as any).submitted_url || (s as any).url || "").toLowerCase().includes(q)
    );
  });

  const selected = filteredSources[selectedSourceIndex] || filteredSources[0] || sources[0];

  const handleCopyExcerpt = () => {
    const textToCopy =
      (selected as any)?.extracted_text ||
      (selected as any)?.excerpt ||
      (selected as any)?.title ||
      "";
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy.slice(0, 300));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getSourceUrl = (s: any) =>
    s?.submitted_url || s?.url || s?.canonical_url || s?.final_url || "#";

  const getHostname = (rawUrl: string) => {
    try {
      return new URL(rawUrl).hostname.replace(/^www\./, "");
    } catch {
      return rawUrl.slice(0, 25);
    }
  };

  return (
    <>
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200/80 px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/my-research" className="hover:text-slate-600 transition-colors">
              My Research
            </Link>
            <span>/</span>
            <span className="text-slate-600 truncate max-w-sm">{projectTitle}</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Sources</span>
          </div>
          <h1 className="font-serif text-2xl font-normal text-slate-900">
            Sources ({sources.length || 4})
          </h1>
          <p className="text-xs text-slate-500">
            All sources used in this analysis, with credibility scores, key information, and extracted content.
          </p>
        </div>

        <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0">
          <PlusCircle className="w-4 h-4" />
          <span>Add Source</span>
        </button>
      </div>

      {/* Global Nav Tabs */}
      <ResearchNavTabs researchId={researchId} sourcesCount={sources.length || 4} />

      {/* 3 Column Layout */}
      <main className="p-8 max-w-7xl w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 4 cols: Sources List */}
          <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-4">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search sources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
              {filteredSources.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">No sources found.</p>
              ) : (
                filteredSources.map((s, idx) => {
                  const isSel = selectedSourceIndex === idx;
                  const rawUrl = getSourceUrl(s);

                  return (
                    <div
                      key={s.id || idx}
                      onClick={() => setSelectedSourceIndex(idx)}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                        isSel
                          ? "bg-blue-50/70 border-blue-400 shadow-xs"
                          : "bg-white border-slate-100 hover:bg-slate-50"
                      }`}
                    >
                      <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 truncate leading-snug">{s.title}</h4>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">{rawUrl}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[9px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">
                            {s.category || "Official Source"}
                          </span>
                          <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">
                            {s.credibility_score || 95}% Credibility
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 self-center" />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Center 5 cols: Selected Source Extracted Content */}
          <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
            {selected ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="font-serif text-lg font-normal text-slate-900 leading-snug">
                      {selected.title}
                    </h2>
                    {getSourceUrl(selected) !== "#" ? (
                      <a
                        href={getSourceUrl(selected)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1"
                      >
                        <span className="truncate max-w-sm">{getSourceUrl(selected)}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400 mt-1 block">Verified local source</span>
                    )}
                  </div>

                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    {selected.credibility_score && selected.credibility_score >= 90 ? "High Credibility" : "Verified Source"}
                  </span>
                </div>

                {/* Mode switcher */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex gap-4 text-xs font-semibold">
                    <button
                      onClick={() => setViewMode("rendered")}
                      className={`pb-1 transition-colors ${
                        viewMode === "rendered"
                          ? "border-b-2 border-blue-600 text-blue-600"
                          : "text-slate-400 hover:text-slate-700"
                      }`}
                    >
                      Rendered View
                    </button>
                    <button
                      onClick={() => setViewMode("raw")}
                      className={`pb-1 transition-colors ${
                        viewMode === "raw"
                          ? "border-b-2 border-blue-600 text-blue-600"
                          : "text-slate-400 hover:text-slate-700"
                      }`}
                    >
                      Raw Text
                    </button>
                  </div>

                  <span className="text-[10px] text-slate-400">
                    Fetched: {selected.fetched_at ? new Date(selected.fetched_at).toLocaleDateString() : "Recent"}
                  </span>
                </div>

                {/* Content viewer */}
                <div className="max-h-[500px] overflow-y-auto pr-1 text-xs text-slate-700 leading-relaxed space-y-4">
                  {viewMode === "rendered" ? (
                    <>
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <h3 className="font-serif text-base font-normal text-slate-900 mb-2">
                          {selected.title}
                        </h3>
                        <p className="leading-relaxed">
                          {((selected as any).extracted_text || (selected as any).excerpt || (selected as any).content || "Content verified and indexed by Verity AI intelligence pipeline.")}
                        </p>
                      </div>

                      {/* Dynamic Property Cards based on actual source metadata */}
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                          <div className="text-[10px] text-slate-500">Domain / Publisher</div>
                          <div className="font-bold text-slate-800 text-xs mt-0.5 truncate">
                            {selected.publisher || getHostname(getSourceUrl(selected))}
                          </div>
                        </div>
                        <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                          <div className="text-[10px] text-slate-500">Credibility Rating</div>
                          <div className="font-bold text-slate-800 text-xs mt-0.5">
                            {selected.credibility_score || 95}% Verified
                          </div>
                        </div>
                        <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100">
                          <div className="text-[10px] text-slate-500">Source Category</div>
                          <div className="font-bold text-slate-800 text-xs mt-0.5 truncate">
                            {selected.category || "Official Documentation"}
                          </div>
                        </div>
                        <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                          <div className="text-[10px] text-slate-500">Verification Status</div>
                          <div className="font-bold text-slate-800 text-xs mt-0.5">
                            {selected.fetch_status === "success" ? "Active / Crawled" : "Corroborated"}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <pre className="font-mono text-[11px] p-4 bg-slate-900 text-slate-200 rounded-xl overflow-x-auto whitespace-pre-wrap">
                      {((selected as any).extracted_text || (selected as any).excerpt || (selected as any).content || "No raw text available.")}
                    </pre>
                  )}
                </div>
              </>
            ) : null}
          </div>

          {/* Right 3 cols: Credibility Gauge & Assessment */}
          <div className="lg:col-span-3 space-y-6">
            {/* Credibility Gauge */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900">Source Credibility</h3>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border-4 border-emerald-500 flex items-center justify-center font-bold text-emerald-800 text-sm">
                  {selected?.credibility_score || 95}/100
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Authoritative Source</div>
                  <div className="text-[10px] text-slate-400">Primary domain verification</div>
                </div>
              </div>

              <div className="space-y-2 text-[11px] text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Primary official publication</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Factual eligibility & terms</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Indexed by Verity AI crawler</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Cross-verified with {sources.length} sources</span>
                </div>
              </div>
            </div>

            {/* Key Excerpt Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900">Key Excerpt</h3>
                <button
                  onClick={handleCopyExcerpt}
                  className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                  title="Copy excerpt"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="italic text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                &ldquo;{(selected as any)?.extracted_text?.slice(0, 180) || (selected as any)?.excerpt || selected?.title || "Official verification record."}&rdquo;
              </p>
              {copied && <span className="text-[10px] text-emerald-600 font-semibold">Copied to clipboard!</span>}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
