"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  FileText,
  Calendar,
  ArrowRight,
  MoreVertical,
  CheckCircle2,
  Clock,
  Bookmark,
  Share2,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";

interface ResearchProjectSummary {
  id: string;
  job_id: string | null;
  title: string;
  research_question: string;
  sources_count: number;
  created_at: string;
  status: string;
  report_ready: boolean;
  cover_image: string;
  visual_label: string;
  assessment_score: number | null;
}

export default function MyResearchPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [researchProjects, setResearchProjects] = useState<ResearchProjectSummary[]>([]);
  const [loadError, setLoadError] = useState("");
  const [savedProjectIds, setSavedProjectIds] = useState<Set<string>>(new Set());
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    fetch("/api/research", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to load research.");
        setResearchProjects(result.projects || []);
      })
      .catch((error) => setLoadError(error instanceof Error ? error.message : "Unable to load research."));
    fetch("/api/saved", { cache: "no-store" }).then(async (response) => {
      if (!response.ok) return;
      const result = await response.json();
      const items = result.items || [];
      setSavedCount(items.length);
      setSavedProjectIds(new Set(items.map((item: { project_id: string }) => item.project_id)));
    }).catch(() => {});
  }, []);

  const filteredProjects = useMemo(() => researchProjects.filter((project) => {
    const completed = project.status === "completed" || project.status === "completed_with_warnings";
    if (activeTab === "progress" && (completed || project.status === "failed" || project.status === "cancelled")) return false;
    if (activeTab === "completed" && !completed) return false;
    if (activeTab === "saved" && !savedProjectIds.has(project.id)) return false;
    return `${project.title} ${project.research_question}`.toLowerCase().includes(searchQuery.toLowerCase());
  }), [activeTab, researchProjects, searchQuery, savedProjectIds]);

  const researchCounts = {
    all: researchProjects.length,
    progress: researchProjects.filter((project) => !["completed", "completed_with_warnings", "failed", "cancelled"].includes(project.status)).length,
    completed: researchProjects.filter((project) => project.status === "completed" || project.status === "completed_with_warnings").length,
  };


  return (

        <main className="p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl font-normal text-slate-900">My Research</h1>
              <p className="text-xs text-slate-500 mt-1">
                Manage your past investigations, continue your work, and organize your research.
              </p>
            </div>

            <Link
              href="/research/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>New Research</span>
            </Link>
          </div>

          {/* Sub Tabs */}
          <div className="flex items-center gap-6 border-b border-slate-200/80 text-xs font-medium">
            <button
              onClick={() => setActiveTab("all")}
              className={`pb-3 transition-colors ${
                activeTab === "all" ? "border-b-2 border-blue-600 text-blue-600 font-semibold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              All Research ({researchCounts.all})
            </button>
            <button
              onClick={() => setActiveTab("progress")}
              className={`pb-3 transition-colors ${
                activeTab === "progress" ? "border-b-2 border-blue-600 text-blue-600 font-semibold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              In Progress ({researchCounts.progress})
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`pb-3 transition-colors ${
                activeTab === "completed" ? "border-b-2 border-blue-600 text-blue-600 font-semibold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Completed ({researchCounts.completed})
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`pb-3 transition-colors ${
                activeTab === "saved" ? "border-b-2 border-blue-600 text-blue-600 font-semibold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Saved ({savedCount})
            </button>
          </div>

          {/* Search and Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search your research..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">{filteredProjects.length} investigations</span>
            </div>
          </div>

          {/* 2 Column Layout: Cards vs Stats */}
          <div className="grid grid-cols-1 items-start lg:grid-cols-12 gap-6">
            {/* Left 8 cols: Research Cards Grid */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                  <h3 className="font-serif text-xl text-slate-900">{loadError ? "Research is unavailable" : activeTab === "saved" ? "No saved research yet" : "No research matches this view"}</h3>
                  <p className="mt-2 text-sm text-slate-500">{loadError || "Start an investigation to see real sources and analysis here."}</p>
                  <Link href="/research/new" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0B172A] px-4 py-2.5 text-sm font-medium text-white">New Research <ArrowRight className="h-4 w-4" /></Link>
                </div>
              ) : filteredProjects.map((p) => (
                <div
                  key={p.id}
                  className="h-fit self-start bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs flex flex-col hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="relative flex h-28 items-end overflow-hidden bg-slate-100 p-4">
                      <img src={p.cover_image || "/hero-workspace.png"} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/10 to-transparent" />
                      <span className="relative mr-auto max-w-[70%] truncate text-[10px] font-medium text-white/90">{p.visual_label || "Research workspace"}</span>
                      <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold capitalize text-slate-700">
                        {p.status.replaceAll("_", " ")}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="font-serif text-sm font-bold text-slate-900 leading-snug line-clamp-1">
                        {p.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {p.research_question}
                      </p>

                      <div className="flex items-center gap-4 text-[10px] text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          <span>{p.sources_count} sources</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(p.created_at).toLocaleDateString()}</span>
                        </span>
                      </div>

                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t border-slate-50 mt-2 flex items-center justify-between">
                    <Link
                      href={p.report_ready ? `/research/${p.id}/report` : p.job_id ? `/research/${p.job_id}/progress` : `/research/${p.id}/report`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-blue-600"
                    >
                      <span>{p.report_ready ? "View analysis" : "Continue"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <button className="p-1 rounded hover:bg-slate-100 text-slate-400">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right 4 cols: Stats, Activity & Recommendations */}
            <div className="lg:col-span-4 space-y-6">
              {/* Research Stats */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-900">Research Stats</h3>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                    <div className="text-[10px] text-slate-500">Total Research</div>
                    <div className="text-lg font-bold text-slate-900 mt-0.5">{researchCounts.all}</div>
                  </div>
                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                    <div className="text-[10px] text-slate-500">Completed</div>
                    <div className="text-lg font-bold text-slate-900 mt-0.5">{researchCounts.completed}</div>
                  </div>
                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                    <div className="text-[10px] text-slate-500">In Progress</div>
                    <div className="text-lg font-bold text-slate-900 mt-0.5">{researchCounts.progress}</div>
                  </div>
                  <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100">
                    <div className="text-[10px] text-slate-500">Saved Items</div>
                    <div className="text-lg font-bold text-slate-900 mt-0.5">{savedCount}</div>
                  </div>
                </div>
              </div>

              {/* Recommended for You */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-slate-900">Recommended for You</h3>

                <div className="space-y-2 text-xs">
                  <Link href="/comparison" className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/70 transition-colors flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">Compare multiple opportunities</div>
                      <div className="text-[10px] text-slate-400">Analyze & compare similar programs</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>

                  <Link href="/notifications" className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/70 transition-colors flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">Set up notifications</div>
                      <div className="text-[10px] text-slate-400">Get updates when new info is available</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
  );
}
