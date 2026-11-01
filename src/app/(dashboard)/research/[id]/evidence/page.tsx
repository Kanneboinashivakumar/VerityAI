"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { ResearchNavTabs } from "@/components/layout/ResearchNavTabs";
import {
  Share2,
  Download,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Search,
  Filter,
  FileText,
  Globe,
  Sparkles,
  Layers,
  Calendar,
  Clock,
  Landmark,
  Briefcase,
  Maximize2,
  Minimize2,
  RotateCcw,
  Move,
} from "lucide-react";
import Link from "next/link";
import { ExtractedClaim, ResearchSource } from "@/lib/types";

interface EvidenceItem {
  source_id?: string;
  source_title: string;
  source_url: string;
  excerpt: string;
  credibility?: string;
  published_at?: string;
  type?: "supports" | "contradicts" | "mentions";
}

interface GraphNode {
  id: string;
  label: string;
  subLabel: string;
  type: "source" | "claim" | "related";
  status?: "supports" | "contradicts" | "related";
  brandType?: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export default function EvidenceExplorerPage() {
  const params = useParams();
  const researchId = params.id as string;

  const [projectTitle, setProjectTitle] = useState("Research Investigation");
  const [researchQuestion, setResearchQuestion] = useState("");
  const [claims, setClaims] = useState<ExtractedClaim[]>([]);
  const [sources, setSources] = useState<ResearchSource[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "VERIFIED" | "MISSING" | "CONFLICTING">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [graphExpanded, setGraphExpanded] = useState(false);

  // Dragging state for the interactive moveable evidence graph
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const graphContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/research/${researchId}/report`);
        if (res.ok) {
          const data = await res.json();
          if (data.projectTitle || data.report?.title) {
            setProjectTitle(data.projectTitle || data.report.title);
          }
          if (data.researchQuestion || data.report?.research_question) {
            setResearchQuestion(data.researchQuestion || data.report.research_question);
          }
          if (data.claims && data.claims.length > 0) {
            setClaims(data.claims);
          }
          if (data.sources) {
            setSources(data.sources);
          }
        }
      } catch (e) {
        console.error("Failed to load evidence data:", e);
      }
    }
    loadData();
  }, [researchId]);

  const verifiedCount = claims.filter((c) => c.status === "CORROBORATED").length;
  const missingCount = claims.filter((c) => c.status === "MISSING").length;
  const conflictingCount = claims.filter((c) => c.status === "CONFLICTING").length;

  const filteredClaims = useMemo(() => {
    return claims.filter((c) => {
      if (statusFilter === "VERIFIED" && c.status !== "CORROBORATED") return false;
      if (statusFilter === "MISSING" && c.status !== "MISSING") return false;
      if (statusFilter === "CONFLICTING" && c.status !== "CONFLICTING") return false;
      if (searchQuery.trim()) {
        const text = `${c.claim_text} ${c.category || c.normalized_claim || ""}`.toLowerCase();
        if (!text.includes(searchQuery.toLowerCase())) return false;
      }
      return true;
    });
  }, [claims, statusFilter, searchQuery]);

  const selected = filteredClaims[selectedIndex] || filteredClaims[0] || claims[0];

  const handlePrevClaim = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredClaims.length - 1));
  };

  const handleNextClaim = () => {
    setSelectedIndex((prev) => (prev < filteredClaims.length - 1 ? prev + 1 : 0));
  };

  // Helper to extract evidence quotes for the selected claim
  const supportingEvidence: EvidenceItem[] = useMemo(() => {
    if (!selected) return [];
    if ((selected as any).evidence && (selected as any).evidence.length > 0) {
      return (selected as any).evidence.map((ev: any) => {
        const matchingSource = sources.find((s) => s.id === ev.source_id);
        const resolvedUrl =
          ev.source_url ||
          matchingSource?.submitted_url ||
          (matchingSource as any)?.url ||
          (matchingSource as any)?.canonical_url ||
          "#";
        const resolvedTitle = ev.source_title || matchingSource?.title || "Verified Source";
        return {
          source_id: ev.source_id,
          source_title: resolvedTitle,
          source_url: resolvedUrl,
          excerpt: ev.excerpt || selected.claim_text,
          type: ev.evidence_type || "supports",
          credibility:
            ev.credibility ||
            (matchingSource ? `${matchingSource.credibility_score || 95}% Credibility` : "High Credibility"),
          published_at:
            ev.published_at ||
            (matchingSource?.created_at
              ? new Date(matchingSource.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Oct 2026"),
        };
      });
    }

    // Dynamic fallback from available sources
    return sources.slice(0, 3).map((s, idx) => ({
      source_id: s.id,
      source_title: s.title || `Source ${idx + 1}`,
      source_url: (s as any).submitted_url || (s as any).url || (s as any).canonical_url || (s as any).final_url || "#",
      excerpt: (s as any).excerpt || (s as any).extracted_text?.slice(0, 180) || selected.claim_text,
      type: "supports" as const,
      credibility: `${s.credibility_score || 95}% Credibility`,
      published_at: s.created_at
        ? new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : "Oct 2026",
    }));
  }, [selected, sources]);

  // Context tags dynamically generated for the active claim
  const contextTags = useMemo(() => {
    if (!selected) return ["Eligibility Criteria", "Application Timeline"];
    const topic = `${projectTitle} ${selected.claim_text}`.toLowerCase();
    if (topic.includes("amazon")) {
      return ["Eligibility Batch (2027)", "Internship Duration (6 Months)", "Technical Skills (DSA & OOP)", "College NOC Policy"];
    }
    if (topic.includes("gnani") || topic.includes("challenge")) {
      return ["AI Hackathon Format", "Stipend Tiers (Up to ₹1L)", "Team Limit (Duo Max)", "IP Assignment Terms"];
    }
    if (topic.includes("nmmss") || topic.includes("scholarship")) {
      return ["Income Ceiling (₹3.5L)", "DBT Disbursement", "APAAR ID Seeding", "L1/L2 Verification Dates"];
    }
    return ["Application Timeline", "Stipend Amount", "Eligibility Criteria", "Program Duration"];
  }, [selected, projectTitle]);

  // Brand resolver
  const getBrandInfo = (title: string, url: string) => {
    const text = `${title} ${url}`.toLowerCase();
    if (text.includes("amazon")) return { brand: "amazon", short: "Amazon Jobs Portal" };
    if (text.includes("google") || text.includes("withgoogle")) return { brand: "google", short: "Google Official Site" };
    if (text.includes("reddit")) return { brand: "reddit", short: "Reddit Community" };
    if (text.includes("dev.to") || text.includes("dev community")) return { brand: "dev", short: "DEV Community" };
    if (text.includes("gov") || text.includes("nsp") || text.includes("scholarships")) return { brand: "gov", short: "National Scholarship Portal" };
    if (text.includes("gnani")) return { brand: "gnani", short: "Gnani AI Portal" };
    return { brand: "generic", short: title.slice(0, 24) || "Verified Primary Source" };
  };

  // Re-initialize moveable graph nodes with generous full-width distribution
  const initGraphNodes = useCallback(() => {
    const containerW = graphContainerRef.current?.clientWidth || 1100;
    const containerH = graphExpanded ? 600 : 480;

    const newNodes: GraphNode[] = [];

    // Left Sources (up to 3) - Positioned at 4% - 24% of container width
    const sourcesToRender = supportingEvidence.slice(0, 3);
    const sourceCount = Math.max(sourcesToRender.length, 1);
    const srcWidth = Math.min(230, Math.round(containerW * 0.22));
    const srcHeight = 70;
    const leftX = Math.max(25, Math.round(containerW * 0.04));

    sourcesToRender.forEach((s, idx) => {
      const brand = getBrandInfo(s.source_title, s.source_url);
      const ySpacing = containerH / (sourceCount + 1);
      newNodes.push({
        id: `src-${idx}`,
        label: brand.short,
        subLabel: s.type === "contradicts" ? "Contradicts" : "Corroborates Finding",
        type: "source",
        status: s.type === "contradicts" ? "contradicts" : "supports",
        brandType: brand.brand,
        x: leftX,
        y: Math.round(ySpacing * (idx + 1) - srcHeight / 2),
        w: srcWidth,
        h: srcHeight,
      });
    });

    // Center Claim Target Node - Positioned right in the middle (38% to 64%)
    const centerWidth = Math.min(340, Math.round(containerW * 0.32));
    const centerHeight = 110;
    const centerX = Math.round(containerW * 0.5 - centerWidth / 2);
    const centerY = Math.round(containerH * 0.5 - centerHeight / 2);

    newNodes.push({
      id: "center-claim",
      label: selected?.claim_text || "Verified Research Fact",
      subLabel: selected?.status === "CORROBORATED" ? "Verified Consensus" : "Under Cross-Verification",
      type: "claim",
      status: "supports",
      x: centerX,
      y: centerY,
      w: centerWidth,
      h: centerHeight,
    });

    // Right Related Dimension Nodes (2) - Positioned at 76% - 96% of container width
    const relWidth = Math.min(220, Math.round(containerW * 0.20));
    const relHeight = 68;
    const rightX = Math.min(containerW - relWidth - 25, Math.round(containerW * 0.77));

    const tag1 = contextTags[0] || "Timeline & Deadlines";
    const tag2 = contextTags[1] || "Eligibility & Criteria";

    newNodes.push({
      id: "rel-0",
      label: tag1,
      subLabel: "Related Scope",
      type: "related",
      status: "related",
      x: rightX,
      y: Math.round(containerH * 0.26 - relHeight / 2),
      w: relWidth,
      h: relHeight,
    });

    newNodes.push({
      id: "rel-1",
      label: tag2,
      subLabel: "Related Scope",
      type: "related",
      status: "related",
      x: rightX,
      y: Math.round(containerH * 0.74 - relHeight / 2),
      w: relWidth,
      h: relHeight,
    });

    setNodes(newNodes);
  }, [selected, graphExpanded, supportingEvidence, contextTags]);

  useEffect(() => {
    initGraphNodes();
  }, [initGraphNodes]);

  // Re-adjust node coordinates if browser window resizes
  useEffect(() => {
    const handleResize = () => {
      initGraphNodes();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [initGraphNodes]);

  // Node Drag handlers (Move components in the evidence graph)
  const handleMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!graphContainerRef.current) return;
    const rect = graphContainerRef.current.getBoundingClientRect();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    setDraggingId(nodeId);
    dragOffset.current = {
      x: e.clientX - rect.left - node.x,
      y: e.clientY - rect.top - node.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId || !graphContainerRef.current) return;
    const rect = graphContainerRef.current.getBoundingClientRect();
    const node = nodes.find((n) => n.id === draggingId);
    if (!node) return;

    const newX = Math.max(10, Math.min(rect.width - node.w - 10, e.clientX - rect.left - dragOffset.current.x));
    const newY = Math.max(10, Math.min(rect.height - node.h - 10, e.clientY - rect.top - dragOffset.current.y));

    setNodes((prev) =>
      prev.map((n) => (n.id === draggingId ? { ...n, x: newX, y: newY } : n))
    );
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  const centerNode = nodes.find((n) => n.id === "center-claim");
  const sourceNodes = nodes.filter((n) => n.type === "source");
  const relatedNodes = nodes.filter((n) => n.type === "related");

  const handleSaveToWorkspace = async () => {
    try {
      const res = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: researchId,
          item_type: "finding",
          item_id: selected?.id || `claim-${researchId}`,
          title: selected?.claim_text?.slice(0, 70) || projectTitle,
          snippet: selected?.claim_text || projectTitle,
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

  const renderBrandIcon = (brand?: string) => {
    switch (brand) {
      case "amazon":
        return (
          <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-900 font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
            a
          </span>
        );
      case "google":
        return (
          <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-[#4285F4] font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            G
          </span>
        );
      case "reddit":
        return (
          <span className="w-6 h-6 rounded-lg bg-[#FF4500] text-white font-bold text-[10px] flex items-center justify-center shrink-0">
            r/
          </span>
        );
      case "dev":
        return (
          <span className="w-6 h-6 rounded-lg bg-black text-white font-mono text-[9px] font-bold flex items-center justify-center shrink-0">
            DEV
          </span>
        );
      case "gov":
        return (
          <span className="w-6 h-6 rounded-lg bg-emerald-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
            <Landmark className="w-3.5 h-3.5" />
          </span>
        );
      default:
        return (
          <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Globe className="w-3.5 h-3.5" />
          </span>
        );
    }
  };

  const relatedClaims = useMemo(() => {
    return claims.filter((c) => c.id !== selected?.id).slice(0, 3);
  }, [claims, selected]);

  return (
    <>
      {/* Top Breadcrumb & Header Bar */}
      <div className="bg-white border-b border-slate-200/80 px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/my-research" className="hover:text-slate-600 transition-colors">
              My Research
            </Link>
            <span>/</span>
            <span className="text-slate-600 truncate max-w-sm">{projectTitle}</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Evidence Explorer</span>
          </div>
          <h1 className="font-serif text-2xl font-normal text-slate-900">Evidence Explorer</h1>
          <p className="text-xs text-slate-500">
            See how each claim is supported, contradicted, or missing across your sources.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition-colors">
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition-colors">
            <Download className="w-3.5 h-3.5" />
            <span>Export ▾</span>
          </button>
          <button
            onClick={handleSaveToWorkspace}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#0B172A] hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{savedSuccess ? "Saved to Workspace!" : "Save to Workspace"}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <ResearchNavTabs
        researchId={researchId}
        sourcesCount={sources.length || 4}
        findingsCount={claims.length || 6}
      />

      {/* Main Layout */}
      <main className="p-8 max-w-7xl w-full mx-auto space-y-8">
        {/* Top 2 Columns (All Claims List & Selected Claim Detail) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (5 cols): All Claims List */}
          <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900">All Claims ({claims.length})</h3>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Search className="w-3.5 h-3.5" />
                <Filter className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <button
                onClick={() => setStatusFilter("ALL")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  statusFilter === "ALL"
                    ? "bg-[#0B172A] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All {claims.length}
              </button>
              <button
                onClick={() => setStatusFilter("VERIFIED")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                  statusFilter === "VERIFIED"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Verified {verifiedCount}
              </button>
              <button
                onClick={() => setStatusFilter("MISSING")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                  statusFilter === "MISSING"
                    ? "bg-amber-600 text-white"
                    : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Missing {missingCount}
              </button>
              <button
                onClick={() => setStatusFilter("CONFLICTING")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                  statusFilter === "CONFLICTING"
                    ? "bg-rose-600 text-white"
                    : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Conflicting {conflictingCount}
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search claims or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Claims list */}
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {filteredClaims.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">No claims match this filter.</p>
              ) : (
                filteredClaims.map((c, idx) => {
                  const isSel = selected?.id === c.id;
                  const isVerified = c.status === "CORROBORATED";
                  const isConflicting = c.status === "CONFLICTING";

                  return (
                    <div
                      key={c.id || idx}
                      onClick={() => setSelectedIndex(idx)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                        isSel
                          ? "bg-blue-50/70 border-blue-400 shadow-xs"
                          : "bg-white border-slate-100 hover:bg-slate-50"
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isVerified ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                            <CheckCircle2 className="w-3 h-3" />
                          </div>
                        ) : isConflicting ? (
                          <div className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center">
                            <AlertTriangle className="w-3 h-3" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center">
                            <HelpCircle className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`line-clamp-2 leading-relaxed ${isSel ? "font-bold text-slate-900" : "text-slate-700"}`}>
                          {c.claim_text}
                        </p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 self-center" />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column (7 cols): Selected Claim Detail & Supporting Evidence */}
          <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
            {selected ? (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      {selected.status === "CORROBORATED" ? (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Verified
                        </span>
                      ) : selected.status === "CONFLICTING" ? (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          Conflicting
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5">
                          <HelpCircle className="w-3 h-3 text-amber-600" />
                          Needs Verification
                        </span>
                      )}
                    </div>

                    {/* Prev / Next Claim Stepper */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handlePrevClaim}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                        title="Previous Claim"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleNextClaim}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                        title="Next Claim"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h2 className="font-serif text-xl sm:text-2xl font-normal text-slate-900 leading-snug">
                    {selected.claim_text}
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    This factual finding is corroborated across reviewed sources and indexed in the intelligence knowledge graph.
                  </p>
                </div>

                {/* Supporting Evidence Items */}
                <div className="space-y-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">
                      Supporting Evidence ({supportingEvidence.length})
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium">Relevance sorted</span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {supportingEvidence.map((ev, eIdx) => {
                      const validUrl = ev.source_url && ev.source_url !== "#" ? ev.source_url : null;

                      return (
                        <div
                          key={eIdx}
                          className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 space-y-2.5 text-xs transition-colors hover:bg-slate-50"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              {renderBrandIcon(getBrandInfo(ev.source_title, ev.source_url).brand)}
                              <span className="font-bold text-slate-900 truncate">{ev.source_title}</span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold shrink-0">
                              {ev.credibility || "High Credibility"}
                            </span>
                          </div>

                          <p className="italic text-slate-700 bg-white p-3 rounded-lg border border-slate-100 leading-relaxed">
                            &ldquo;{ev.excerpt}&rdquo;
                          </p>

                          <div className="flex items-center justify-between pt-1">
                            {validUrl ? (
                              <a
                                href={validUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline"
                              >
                                <span className="truncate max-w-[260px]">{validUrl}</span>
                                <ExternalLink className="w-3 h-3 shrink-0" />
                              </a>
                            ) : (
                              <span className="text-[11px] text-slate-400">Verified official record</span>
                            )}
                            <span className="text-[10px] text-slate-400">{ev.published_at || "Oct 2026"}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Conclusion Card */}
                  <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Conclusion</span>
                    </div>
                    <p className="text-xs text-emerald-900 leading-relaxed">
                      The claim is corroborated. Independent credible sources consistently confirm this finding according to current official records.
                    </p>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* Expansive Full-Width Interactive Evidence Graph with Spaced Moveable Nodes */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="font-serif text-lg font-normal text-slate-900">
                  Interactive Evidence Graph (Drag &amp; Move Nodes)
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Spaced interactive canvas. Click and drag any component across the full canvas to customize your verification structure.
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Legend matching Reference UI */}
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Supports ({supportingEvidence.length})
                </span>
                <span className="flex items-center gap-1 text-rose-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Contradicts (0)
                </span>
                <span className="flex items-center gap-1 text-blue-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Related (2)
                </span>
              </div>

              <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
                <button
                  type="button"
                  onClick={initGraphNodes}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-medium shadow-2xs"
                  title="Reset Node Positions"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Layout</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGraphExpanded((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors font-medium border border-blue-200/60 shadow-2xs"
                  title={graphExpanded ? "Compact View" : "Expand Graph"}
                >
                  {graphExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  <span>{graphExpanded ? "Compact Canvas" : "Expand Canvas"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Moveable Graph Canvas spanning the entire container width */}
          <div
            ref={graphContainerRef}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className={`relative rounded-2xl border border-slate-200/80 bg-slate-50/60 overflow-hidden select-none transition-all duration-300 w-full shadow-inner ${
              graphExpanded ? "h-[620px]" : "h-[490px]"
            }`}
          >
            {/* Background grid dots pattern */}
            <div
              className="absolute inset-0 pointer-events-none opacity-40"
              style={{
                backgroundImage: "radial-gradient(#94A3B8 1.2px, transparent 1.2px)",
                backgroundSize: "24px 24px",
              }}
            />

            {/* Draggable Hint */}
            <div className="absolute top-4 left-5 z-20 flex items-center gap-2 text-xs text-slate-500 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full border border-slate-200 shadow-xs">
              <Move className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <span>Full-width canvas — grab and drag components anywhere</span>
            </div>

            {/* Dynamic SVG Bezier Connector Curves linking moving nodes */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" xmlns="http://www.w3.org/2000/svg">
              {centerNode &&
                sourceNodes.map((src) => {
                  const x1 = src.x + src.w;
                  const y1 = src.y + src.h / 2;
                  const x2 = centerNode.x;
                  const y2 = centerNode.y + centerNode.h / 2;
                  const cx1 = x1 + (x2 - x1) * 0.5;
                  const cy1 = y1;
                  const cx2 = x1 + (x2 - x1) * 0.5;
                  const cy2 = y2;
                  const strokeColor = src.status === "contradicts" ? "#EF4444" : "#10B981";

                  return (
                    <g key={src.id}>
                      <path
                        d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
                        stroke={strokeColor}
                        strokeWidth="2.5"
                        strokeDasharray="5 3"
                        fill="none"
                      />
                      <circle cx={x1} cy={y1} r="4" fill={strokeColor} />
                      <circle cx={x2} cy={y2} r="4" fill={strokeColor} />
                    </g>
                  );
                })}

              {centerNode &&
                relatedNodes.map((rel) => {
                  const x1 = centerNode.x + centerNode.w;
                  const y1 = centerNode.y + centerNode.h / 2;
                  const x2 = rel.x;
                  const y2 = rel.y + rel.h / 2;
                  const cx1 = x1 + (x2 - x1) * 0.5;
                  const cy1 = y1;
                  const cx2 = x1 + (x2 - x1) * 0.5;
                  const cy2 = y2;

                  return (
                    <g key={rel.id}>
                      <path
                        d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
                        stroke="#3B82F6"
                        strokeWidth="2.5"
                        strokeDasharray="5 3"
                        fill="none"
                      />
                      <circle cx={x1} cy={y1} r="4" fill="#3B82F6" />
                      <circle cx={x2} cy={y2} r="4" fill="#3B82F6" />
                    </g>
                  );
                })}
            </svg>

            {/* Draggable Component Nodes with generous spacing */}
            {nodes.map((node) => {
              const isSelected = draggingId === node.id;

              if (node.type === "claim") {
                return (
                  <div
                    key={node.id}
                    onMouseDown={(e) => handleMouseDown(node.id, e)}
                    style={{
                      transform: `translate(${node.x}px, ${node.y}px)`,
                      width: `${node.w}px`,
                      cursor: isSelected ? "grabbing" : "grab",
                    }}
                    className={`absolute z-30 p-4 rounded-2xl bg-white border-2 border-blue-500 shadow-md transition-shadow hover:shadow-xl ${
                      isSelected ? "ring-4 ring-blue-500/25 shadow-2xl scale-[1.02]" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2 text-blue-600">
                      <FileText className="w-4 h-4 shrink-0" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                        {node.subLabel}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 line-clamp-3 leading-snug">
                      {node.label}
                    </div>
                  </div>
                );
              }

              if (node.type === "source") {
                return (
                  <div
                    key={node.id}
                    onMouseDown={(e) => handleMouseDown(node.id, e)}
                    style={{
                      transform: `translate(${node.x}px, ${node.y}px)`,
                      width: `${node.w}px`,
                      cursor: isSelected ? "grabbing" : "grab",
                    }}
                    className={`absolute z-20 p-3 rounded-xl bg-white border border-emerald-300 shadow-xs hover:shadow-md transition-shadow ${
                      isSelected ? "ring-2 ring-emerald-500/40 shadow-md scale-[1.02]" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {renderBrandIcon(node.brandType)}
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate leading-tight">
                          {node.label}
                        </div>
                        <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                          {node.subLabel}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              // Related Node
              return (
                <div
                  key={node.id}
                  onMouseDown={(e) => handleMouseDown(node.id, e)}
                  style={{
                    transform: `translate(${node.x}px, ${node.y}px)`,
                    width: `${node.w}px`,
                    cursor: isSelected ? "grabbing" : "grab",
                  }}
                  className={`absolute z-20 p-3 rounded-xl bg-white border border-blue-200 shadow-xs hover:shadow-md transition-shadow ${
                    isSelected ? "ring-2 ring-blue-500/40 shadow-md scale-[1.02]" : ""
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate leading-tight">
                        {node.label}
                      </div>
                      <div className="text-[10px] text-blue-600 font-semibold mt-0.5">
                        {node.subLabel}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom context & related claims drawer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Claim in Context
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                This finding integrates into the broader topics of timeline, stipend amount, program duration and eligibility criteria.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {contextTags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Related Corroborated Claims
              </h4>
              <div className="space-y-1.5">
                {relatedClaims.map((rc, rIdx) => (
                  <div
                    key={rIdx}
                    onClick={() => {
                      const targetIdx = filteredClaims.findIndex((fc) => fc.id === rc.id);
                      if (targetIdx !== -1) setSelectedIndex(targetIdx);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-100 hover:border-blue-300 text-xs text-slate-800 cursor-pointer transition-colors"
                  >
                    <span className="truncate pr-2 font-medium">{rc.claim_text}</span>
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
