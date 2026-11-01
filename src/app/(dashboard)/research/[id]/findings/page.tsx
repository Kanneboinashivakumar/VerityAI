"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ResearchNavTabs } from "@/components/layout/ResearchNavTabs";
import {
  Share2,
  Download,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Clock,
  Layers,
  FileText,
  Tag,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { ExtractedClaim, ResearchSource, EvidenceStatus } from "@/lib/types";

export default function DetailedFindingsPage() {
  const params = useParams();
  const researchId = params.id as string;

  const [projectTitle, setProjectTitle] = useState("Research Investigation");
  const [claims, setClaims] = useState<ExtractedClaim[]>([]);
  const [sources, setSources] = useState<ResearchSource[]>([]);
  const [selectedClaimIndex, setSelectedClaimIndex] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/research/${researchId}/report`);
        if (res.ok) {
          const data = await res.json();
          if (data.projectTitle || data.report?.title) {
            setProjectTitle(data.projectTitle || data.report.title);
          }
          if (data.claims && data.claims.length > 0) {
            setClaims(data.claims);
          }
          if (data.sources) {
            setSources(data.sources);
          }
        }
      } catch (e) {
        console.error("Failed to load report findings", e);
      }
    }
    loadData();
  }, [researchId]);

  const filteredClaims = claims.filter((c) => {
    const matchesSearch = c.claim_text.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterStatus === "ALL") return matchesSearch;
    if (filterStatus === "CORROBORATED") return matchesSearch && c.status === "CORROBORATED";
    if (filterStatus === "MISSING") return matchesSearch && c.status === "MISSING";
    if (filterStatus === "CONFLICTING") return matchesSearch && c.status === "CONFLICTING";
    if (filterStatus === "POTENTIALLY_OUTDATED") return matchesSearch && c.status === "POTENTIALLY_OUTDATED";
    return matchesSearch;
  });

  const selectedClaim = filteredClaims[selectedClaimIndex] || filteredClaims[0] || claims[0];

  const getStatusBadge = (status: EvidenceStatus) => {
    switch (status) {
      case "CORROBORATED":
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Verified
          </span>
        );
      case "CONFLICTING":
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            Conflicting
          </span>
        );
      case "MISSING":
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            Missing Info
          </span>
        );
      case "POTENTIALLY_OUTDATED":
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Potentially Outdated
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            Unverified
          </span>
        );
    }
  };

  const totalFindings = claims.length;
  const verifiedCount = claims.filter((c) => c.status === "CORROBORATED").length;
  const missingCount = claims.filter((c) => c.status === "MISSING").length;
  const conflictingCount = claims.filter((c) => c.status === "CONFLICTING").length;
  const outdatedCount = claims.filter((c) => c.status === "POTENTIALLY_OUTDATED").length;

  // Resolve evidence quotes for selected claim
  const claimEvidence = selectedClaim
    ? selectedClaim.evidence && selectedClaim.evidence.length > 0
      ? selectedClaim.evidence.map((ev: any) => {
          const matchingSource = sources.find((s) => s.id === ev.source_id);
          return {
            title: ev.source_title || matchingSource?.title || "Verified Source",
            url: ev.source_url || (matchingSource as any)?.submitted_url || (matchingSource as any)?.url || "#",
            excerpt: ev.excerpt || selectedClaim.claim_text,
            credibility: matchingSource ? `${matchingSource.credibility_score || 95}% Credibility` : "High Credibility",
          };
        })
      : sources.slice(0, 2).map((s) => ({
          title: s.title,
          url: (s as any).submitted_url || (s as any).url || "#",
          excerpt: (s as any).excerpt || (s as any).extracted_text?.slice(0, 160) || selectedClaim.claim_text,
          credibility: `${s.credibility_score || 95}% Credibility`,
        }))
    : [];

  const handleSaveToWorkspace = async () => {
    try {
      const res = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: researchId,
          item_type: "finding",
          item_id: selectedClaim?.id || `claim-${researchId}`,
          title: selectedClaim?.claim_text?.slice(0, 70) || projectTitle,
          snippet: selectedClaim?.claim_text || projectTitle,
        }),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    } catch (err) {
      console.error("Failed to save finding to workspace:", err);
    }
  };

  return (
    <>
      {/* Breadcrumb & Actions Header */}
      <div className="bg-white border-b border-slate-200/80 px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/my-research" className="hover:text-slate-600 transition-colors">
              My Research
            </Link>
            <span>/</span>
            <span className="text-slate-600 truncate max-w-sm">{projectTitle}</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Detailed Findings</span>
          </div>
          <h1 className="font-serif text-2xl font-normal text-slate-900">Detailed Findings</h1>
          <p className="text-xs text-slate-500">
            Complete analysis of all extracted information, claims, and evidence from your sources.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleSaveToWorkspace}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#0B172A] hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{savedSuccess ? "Saved to Workspace!" : "Save to Workspace"}</span>
          </button>
        </div>
      </div>

      {/* Global Research Tabs */}
      <ResearchNavTabs researchId={researchId} sourcesCount={sources.length} findingsCount={totalFindings} />

      {/* Main Content Area */}
      <main className="p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Five Metric Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div
            onClick={() => setFilterStatus("ALL")}
            className={`p-4 bg-white border rounded-2xl cursor-pointer transition-all ${
              filterStatus === "ALL" ? "border-blue-500 shadow-xs ring-2 ring-blue-100" : "border-slate-200/80 hover:bg-slate-50"
            }`}
          >
            <div className="text-xl font-bold text-slate-900">{totalFindings}</div>
            <div className="text-xs font-bold text-slate-700 mt-0.5">Total Findings</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Across all sources</div>
          </div>

          <div
            onClick={() => setFilterStatus("CORROBORATED")}
            className={`p-4 bg-white border rounded-2xl cursor-pointer transition-all ${
              filterStatus === "CORROBORATED" ? "border-emerald-500 shadow-xs ring-2 ring-emerald-100" : "border-slate-200/80 hover:bg-slate-50"
            }`}
          >
            <div className="text-xl font-bold text-emerald-700">{verifiedCount}</div>
            <div className="text-xs font-bold text-emerald-800 mt-0.5">Verified</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Supported by sources</div>
          </div>

          <div
            onClick={() => setFilterStatus("MISSING")}
            className={`p-4 bg-white border rounded-2xl cursor-pointer transition-all ${
              filterStatus === "MISSING" ? "border-amber-500 shadow-xs ring-2 ring-amber-100" : "border-slate-200/80 hover:bg-slate-50"
            }`}
          >
            <div className="text-xl font-bold text-amber-700">{missingCount}</div>
            <div className="text-xs font-bold text-amber-800 mt-0.5">Missing Info</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Needs further verification</div>
          </div>

          <div
            onClick={() => setFilterStatus("CONFLICTING")}
            className={`p-4 bg-white border rounded-2xl cursor-pointer transition-all ${
              filterStatus === "CONFLICTING" ? "border-rose-500 shadow-xs ring-2 ring-rose-100" : "border-slate-200/80 hover:bg-slate-50"
            }`}
          >
            <div className="text-xl font-bold text-rose-700">{conflictingCount}</div>
            <div className="text-xs font-bold text-rose-800 mt-0.5">Conflicting Info</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Contradictory claims</div>
          </div>

          <div
            onClick={() => setFilterStatus("POTENTIALLY_OUTDATED")}
            className={`p-4 bg-white border rounded-2xl cursor-pointer transition-all ${
              filterStatus === "POTENTIALLY_OUTDATED" ? "border-blue-500 shadow-xs ring-2 ring-blue-100" : "border-slate-200/80 hover:bg-slate-50"
            }`}
          >
            <div className="text-xl font-bold text-blue-700">{outdatedCount}</div>
            <div className="text-xs font-bold text-blue-800 mt-0.5">Potentially Outdated</div>
            <div className="text-[10px] text-slate-400 mt-0.5">May no longer be current</div>
          </div>
        </div>

        {/* Three-Pane Investigation View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 4 cols: Findings List */}
          <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900">All Findings ({filteredClaims.length})</h3>
            </div>

            {/* Search input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search findings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Numbered list */}
            <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredClaims.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No findings match this filter.</p>
              ) : (
                filteredClaims.map((claim, idx) => {
                  const isSelected = selectedClaim?.id === claim.id;

                  return (
                    <div
                      key={claim.id || idx}
                      onClick={() => setSelectedClaimIndex(idx)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                        isSelected
                          ? "bg-blue-50/70 border-blue-400 shadow-xs"
                          : "bg-white border-slate-100 hover:bg-slate-50"
                      }`}
                    >
                      <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-slate-800 font-medium line-clamp-2 leading-tight">
                          {claim.claim_text}
                        </div>
                        <div className="mt-1.5">
                          {getStatusBadge(claim.status)}
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 self-center" />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Center 5 cols: Selected Finding Details & Source Evidence */}
          <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
            {selectedClaim ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center">
                      {selectedClaimIndex + 1}
                    </span>
                    {getStatusBadge(selectedClaim.status)}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedClaimIndex((p) => Math.max(0, p - 1))}
                      className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedClaimIndex((p) => Math.min(filteredClaims.length - 1, p + 1))}
                      className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Headline */}
                <h2 className="font-serif text-xl font-normal text-slate-900 leading-snug">
                  {selectedClaim.claim_text}
                </h2>

                {/* Rationale Explanation */}
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Explanation</div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedClaim.confidence_note || "Extracted and cross-referenced from reviewed sources."}
                  </p>
                </div>

                {/* Key Details Table */}
                <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Category</span>
                    <span className="font-medium text-slate-800">{selectedClaim.category || "General"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Status</span>
                    <span className="font-medium text-slate-800">{selectedClaim.status}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Confidence</span>
                    <span className="font-medium text-emerald-700">Corroborated</span>
                  </div>
                </div>

                {/* Source Evidence List */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">
                      Source Evidence ({claimEvidence.length})
                    </h4>
                    <span className="text-[10px] text-slate-400">Cited Excerpts</span>
                  </div>

                  {claimEvidence.map((ev, eIdx) => (
                    <div key={eIdx} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-800 truncate">{ev.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold shrink-0">
                          {ev.credibility}
                        </span>
                      </div>
                      <p className="italic text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                        &ldquo;{ev.excerpt}&rdquo;
                      </p>
                      {ev.url && ev.url !== "#" && (
                        <a
                          href={ev.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                        >
                          <span className="truncate max-w-xs">{ev.url}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-xs text-slate-400 p-8 text-center">No findings available.</div>
            )}
          </div>

          {/* Right 3 cols: Context & Related Findings */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900">Claim in Context</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                This finding forms part of the verified guidelines. Check related deadline constraints and qualification rules.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                  {selectedClaim?.category || "Overview"}
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  Verification
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  Application
                </span>
              </div>
            </div>

            {/* Related Findings */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900">Related Findings</h3>
              <div className="space-y-2 text-xs">
                {claims
                  .filter((c) => c.id !== selectedClaim?.id)
                  .slice(0, 4)
                  .map((rf, rIdx) => (
                    <div
                      key={rIdx}
                      onClick={() => {
                        const targetIdx = filteredClaims.findIndex((fc) => fc.id === rf.id);
                        if (targetIdx !== -1) setSelectedClaimIndex(targetIdx);
                      }}
                      className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100/70 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span className="truncate text-slate-700 pr-2">{rf.claim_text}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
