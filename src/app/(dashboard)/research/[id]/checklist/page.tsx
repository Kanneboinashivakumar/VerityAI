"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ResearchNavTabs } from "@/components/layout/ResearchNavTabs";
import {
  Share2,
  Download,
  CheckCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  ExternalLink,
  ChevronRight,
  Filter,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { VerificationChecklistItem } from "@/lib/types";

export default function VerificationChecklistPage() {
  const params = useParams();
  const researchId = params.id as string;

  const [projectTitle, setProjectTitle] = useState("Research Investigation");
  const [items, setItems] = useState<VerificationChecklistItem[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sourcesCount, setSourcesCount] = useState(4);
  const [claimsCount, setClaimsCount] = useState(6);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/research/${researchId}/report`);
        if (res.ok) {
          const data = await res.json();
          if (data.projectTitle || data.report?.title) {
            setProjectTitle(data.projectTitle || data.report.title);
          }
          if (data.checklist && data.checklist.length > 0) {
            setItems(data.checklist);
          }
          if (data.sources) setSourcesCount(data.sources.length);
          if (data.claims) setClaimsCount(data.claims.length);
        }
      } catch (err) {
        console.error("Failed to load checklist data:", err);
      }
    }
    loadData();
  }, [researchId]);

  const toggleItem = async (itemId: string) => {
    // Optimistic UI update
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === itemId) {
          const isCurrentlyCompleted = it.status === "completed" || Boolean((it as any).completed);
          return {
            ...it,
            status: isCurrentlyCompleted ? "pending" : "completed",
            completed: !isCurrentlyCompleted,
          };
        }
        return it;
      })
    );

    try {
      await fetch(`/api/checklist/${itemId}`, { method: "PATCH" });
    } catch (e) {
      console.error("Failed to persist toggle", e);
    }
  };

  const markAllComplete = async () => {
    setItems((prev) => prev.map((it) => ({ ...it, status: "completed", completed: true })));
    for (const item of items) {
      if (item.status !== "completed") {
        fetch(`/api/checklist/${item.id}`, { method: "PATCH" }).catch(() => {});
      }
    }
  };

  const highCount = items.filter((i) => String(i.priority).toLowerCase() === "high").length;
  const medCount = items.filter((i) => String(i.priority).toLowerCase() === "medium").length;
  const lowCount = items.filter((i) => String(i.priority).toLowerCase() === "low").length;
  const completedCount = items.filter((i) => i.status === "completed" || Boolean((i as any).completed)).length;

  const filteredItems = items.filter((it) => {
    const prio = String(it.priority).toLowerCase();
    const isDone = it.status === "completed" || Boolean((it as any).completed);
    if (priorityFilter !== "ALL" && prio !== priorityFilter.toLowerCase()) return false;
    if (statusFilter === "completed" && !isDone) return false;
    if (statusFilter === "pending" && isDone) return false;
    return true;
  });

  const totalItems = Math.max(items.length, 1);
  const highPct = Math.round((highCount / totalItems) * 100);
  const medPct = Math.round((medCount / totalItems) * 100);
  const lowPct = Math.round((lowCount / totalItems) * 100);

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
            <span className="text-slate-900 font-semibold">Verification Checklist</span>
          </div>
          <h1 className="font-serif text-2xl font-normal text-slate-900">Verification Checklist</h1>
          <p className="text-xs text-slate-500">
            A prioritized list of what to verify, clarify, or gather based on the analysis.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition-colors">
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition-colors">
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
          <button
            onClick={markAllComplete}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#0B172A] hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All Complete</span>
          </button>
        </div>
      </div>

      {/* Global Research Tabs */}
      <ResearchNavTabs
        researchId={researchId}
        sourcesCount={sourcesCount}
        findingsCount={claimsCount}
      />

      <main className="p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white border border-rose-100 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <span className="text-2xl font-bold text-rose-700">{highCount}</span>
            </div>
            <div className="text-xs font-bold text-slate-800 mt-2">High Priority</div>
            <div className="text-[11px] text-slate-400">Verify critical requirements</div>
          </div>

          <div className="p-4 bg-white border border-amber-100 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span className="text-2xl font-bold text-amber-700">{medCount}</span>
            </div>
            <div className="text-xs font-bold text-slate-800 mt-2">Medium Priority</div>
            <div className="text-[11px] text-slate-400">Important to confirm</div>
          </div>

          <div className="p-4 bg-white border border-blue-100 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2 text-blue-600">
              <Info className="w-5 h-5 text-blue-500" />
              <span className="text-2xl font-bold text-blue-700">{lowCount}</span>
            </div>
            <div className="text-xs font-bold text-slate-800 mt-2">Low Priority</div>
            <div className="text-[11px] text-slate-400">Helpful context</div>
          </div>

          <div className="p-4 bg-white border border-emerald-100 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="text-2xl font-bold text-emerald-700">{completedCount}</span>
            </div>
            <div className="text-xs font-bold text-slate-800 mt-2">Completed</div>
            <div className="text-[11px] text-slate-400">Already verified</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 8 cols: Tasks list */}
          <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Verification Tasks ({filteredItems.length})
              </h3>
              <span className="text-xs text-slate-400">Priority order</span>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">No checklist items match the filter.</p>
              ) : (
                filteredItems.map((task) => {
                  const isDone = task.status === "completed" || Boolean((task as any).completed);
                  const prio = String(task.priority || "high").toLowerCase();
                  const itemTitle = task.item || (task as any).item_text || "Verify critical requirement";
                  const itemReason = task.reason || (task as any).explanation || "Action item based on factual research analysis.";

                  return (
                    <div
                      key={task.id}
                      className="py-4 flex items-start justify-between gap-4 hover:bg-slate-50/50 px-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => toggleItem(task.id)}
                          className="w-4 h-4 mt-1 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                        />
                        <div className="space-y-1">
                          <h4
                            className={`text-xs font-bold leading-tight ${
                              isDone ? "line-through text-slate-400" : "text-slate-900"
                            }`}
                          >
                            {itemTitle}
                          </h4>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            {itemReason}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                            prio === "high"
                              ? "bg-rose-50 text-rose-700"
                              : prio === "medium"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {prio}
                        </span>

                        <span
                          className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                            isDone
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {isDone ? "Completed" : "Pending"}
                        </span>

                        <button
                          onClick={() => toggleItem(task.id)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                        >
                          <span>{isDone ? "Completed" : "Verify"}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right 4 cols: Progress Donut & Filters */}
          <div className="lg:col-span-4 space-y-6">
            {/* Progress Donut */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900">Checklist Progress</h3>

              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full border-4 border-slate-100 border-t-emerald-500 border-r-emerald-500 flex items-center justify-center font-bold text-slate-900 text-xs text-center leading-tight">
                  {completedCount}/{items.length}
                  <br />
                  <span className="text-[9px] text-slate-400 font-normal">Completed</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-slate-600">{completedCount} Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-slate-600">{items.length - completedCount} Pending</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Priority Breakdown */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-3.5">
              <h3 className="text-xs font-bold text-slate-900">Priority Breakdown</h3>

              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>High Priority</span>
                    <span>{highCount}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full transition-all duration-300" style={{ width: `${highPct}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>Medium Priority</span>
                    <span>{medCount}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${medPct}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>Low Priority</span>
                    <span>{lowCount}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${lowPct}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900">Filters</h3>
                <button
                  onClick={() => {
                    setPriorityFilter("ALL");
                    setStatusFilter("ALL");
                  }}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                >
                  Clear all
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1.5">
                  <span className="font-semibold text-slate-700 text-[11px]">Priority:</span>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="pfilter"
                        checked={priorityFilter === "ALL"}
                        onChange={() => setPriorityFilter("ALL")}
                      />
                      <span>All Priorities ({items.length})</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="pfilter"
                        checked={priorityFilter === "high"}
                        onChange={() => setPriorityFilter("high")}
                      />
                      <span>High ({highCount})</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="pfilter"
                        checked={priorityFilter === "medium"}
                        onChange={() => setPriorityFilter("medium")}
                      />
                      <span>Medium ({medCount})</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="pfilter"
                        checked={priorityFilter === "low"}
                        onChange={() => setPriorityFilter("low")}
                      />
                      <span>Low ({lowCount})</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
