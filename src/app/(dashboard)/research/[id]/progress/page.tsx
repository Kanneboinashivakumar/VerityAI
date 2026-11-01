"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  XCircle,
  CheckCircle2,
  Loader2,
  Circle,
  Globe,
  FileText,
  Newspaper,
  GraduationCap,
  MessageSquare,
  Upload,
  ArrowRight,
  Clock,
  Cpu,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";

interface EventItem {
  id?: string;
  stage: string;
  status: string;
  message: string;
  occurred_at: string;
}

export default function ResearchProgressPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [question, setQuestion] = useState("Investigating Research Topic...");
  const [currentStage, setCurrentStage] = useState("queued");
  const [jobStatus, setJobStatus] = useState("queued");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isCancelled, setIsCancelled] = useState(false);
  const [sourcesCount, setSourcesCount] = useState(5);
  const [projectId, setProjectId] = useState<string>("");

  // Elapsed timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial job details
  useEffect(() => {
    async function loadJob() {
      try {
        const res = await fetch(`/api/research/${jobId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.project) {
            setQuestion(data.project.research_question || data.project.title);
            setProjectId(data.project.id);
          }
          if (data.job) {
            setJobStatus(data.job.status);
            setCurrentStage(data.job.current_stage);
          }
        }
      } catch (err) {
        console.error("Failed to load initial job state", err);
      }
    }
    loadJob();
  }, [jobId]);

  // Connect to live Server-Sent Events (SSE) stream with database persistence
  useEffect(() => {
    const eventSource = new EventSource(`/api/research/${jobId}/events`);

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.status) {
          setJobStatus(data.status);
          setCurrentStage(data.stage || data.status);
        }
        if (data.message) {
          setEvents((prev) => {
            const exists = prev.some(
              (p) => p.message === data.message && p.stage === data.stage
            );
            if (exists) return prev;
            return [...prev, data];
          });
        }

        // If completed or failed, close event source
        if (
          data.status === "completed" ||
          data.status === "completed_with_warnings" ||
          data.status === "failed" ||
          data.status === "cancelled"
        ) {
          eventSource.close();
        }
      } catch (err) {
        console.error("Error parsing event data", err);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [jobId]);

  const handleCancel = async () => {
    try {
      const res = await fetch(`/api/research/${jobId}/cancel`, { method: "POST" });
      if (res.ok) {
        setIsCancelled(true);
        setJobStatus("cancelled");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const steps = [
    { id: 1, label: "1. Understanding your query", key: "understanding" },
    { id: 2, label: "2. Collecting sources", key: "sources" },
    { id: 3, label: "3. Extracting information", key: "extracting" },
    { id: 4, label: "4. Cross-checking & analyzing", key: "analyzing" },
    { id: 5, label: "5. Identifying gaps & conflicts", key: "gaps" },
    { id: 6, label: "6. Generating final report", key: "report" },
  ];

  // Determine active step index
  const getActiveStepIndex = () => {
    if (jobStatus === "completed" || jobStatus === "completed_with_warnings") return 6;
    if (currentStage.includes("report") || currentStage.includes("saving")) return 6;
    if (currentStage.includes("checklist") || currentStage.includes("gaps")) return 5;
    if (currentStage.includes("comparing") || currentStage.includes("analyz")) return 4;
    if (currentStage.includes("extract")) return 3;
    if (currentStage.includes("fetching") || currentStage.includes("collecting")) return 2;
    return 1;
  };

  const activeIndex = getActiveStepIndex();

  const isFinished =
    jobStatus === "completed" ||
    jobStatus === "completed_with_warnings" ||
    isCancelled;

  const targetProjectId = projectId || "gsoc-2027-demo";

  return (
    <>
        <main className="p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Top Title & Cancel Button */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-3xl font-normal text-slate-900">
                {isFinished ? "Research Completed" : "Research in Progress"}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Verity AI is analyzing your inputs, collecting sources, and cross-checking information.
              </p>
            </div>

            {!isFinished ? (
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center gap-2 px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-xl transition-colors"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancel Research</span>
              </button>
            ) : (
              <Link
                href={`/research/${targetProjectId}/report`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                <span>View Final Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* Research Topic Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <FileText className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                  Research Topic
                </div>
                <h2 className="text-base font-bold text-slate-900 max-w-3xl leading-snug">
                  {question}
                </h2>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    Web Search
                  </span>
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    Official Websites
                  </span>
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700">
                    Academic Sources
                  </span>
                </div>
              </div>
            </div>

            <div className="text-left md:text-right shrink-0 space-y-1 text-xs">
              <div className="text-slate-400">Started at</div>
              <div className="font-semibold text-slate-700">Just now</div>
              <div className="text-slate-400 pt-1">Status</div>
              <div className="font-semibold text-blue-600 capitalize">
                {jobStatus.replace(/_/g, " ")}
              </div>
            </div>
          </div>

          {/* Stepper Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
              {steps.map((st) => {
                const isPassed = activeIndex > st.id;
                const isCurrent = activeIndex === st.id;

                return (
                  <div key={st.id} className="flex flex-col items-center space-y-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isPassed
                          ? "bg-blue-600 text-white"
                          : isCurrent
                          ? "ring-4 ring-blue-100 bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        st.id
                      )}
                    </div>
                    <span
                      className={`text-xs ${
                        isCurrent
                          ? "font-bold text-slate-900"
                          : isPassed
                          ? "font-medium text-slate-700"
                          : "text-slate-400"
                      }`}
                    >
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Two Column Progress & Sources Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 cols: Live Progress Timeline */}
            <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Live Progress</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time events streaming directly from the durable background worker.
                </p>
              </div>

              <div className="space-y-5">
                {events.length === 0 ? (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                    <span className="text-xs text-slate-600">Connecting to research event stream...</span>
                  </div>
                ) : (
                  events.map((ev, idx) => (
                    <div key={idx} className="flex items-start gap-3.5 relative">
                      <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-slate-900">{ev.message}</div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(ev.occurred_at || Date.now()).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {!isFinished && (
                  <div className="flex items-start gap-3.5">
                    <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-blue-700">
                        Processing evidence with Gemma Intelligence...
                      </div>
                      <div className="text-[11px] text-slate-400">Comparing claims & detecting gaps</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right 5 cols: Sources Discovered & Stats */}
            <div className="lg:col-span-5 space-y-6">
              {/* Sources Breakdown */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900">Sources Discovered</h3>
                  <span className="text-xs font-semibold text-blue-600">
                    {sourcesCount} sources
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Globe className="w-4 h-4 text-blue-600" />
                      <span>Official Websites</span>
                    </div>
                    <span className="font-semibold text-slate-900">2</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80">
                    <div className="flex items-center gap-2 text-slate-700">
                      <FileText className="w-4 h-4 text-slate-600" />
                      <span>Blog Articles</span>
                    </div>
                    <span className="font-semibold text-slate-900">1</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Newspaper className="w-4 h-4 text-emerald-600" />
                      <span>News Articles</span>
                    </div>
                    <span className="font-semibold text-slate-900">1</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80">
                    <div className="flex items-center gap-2 text-slate-700">
                      <MessageSquare className="w-4 h-4 text-amber-600" />
                      <span>Community Discussions</span>
                    </div>
                    <span className="font-semibold text-slate-900">1</span>
                  </div>
                </div>
              </div>

              {/* Processing Statistics */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-900">Processing Statistics</h3>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100/60">
                    <div className="text-slate-500 text-[11px]">Sources Found</div>
                    <div className="text-lg font-bold text-slate-900 mt-1">{sourcesCount}</div>
                  </div>
                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100/60">
                    <div className="text-slate-500 text-[11px]">Sources Processed</div>
                    <div className="text-lg font-bold text-slate-900 mt-1">{sourcesCount}</div>
                  </div>
                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100/60">
                    <div className="text-slate-500 text-[11px]">Elapsed Time</div>
                    <div className="text-lg font-bold text-slate-900 mt-1">{elapsedSeconds}s</div>
                  </div>
                  <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100/60">
                    <div className="text-slate-500 text-[11px]">Status</div>
                    <div className="text-sm font-bold text-slate-900 mt-1 capitalize truncate">
                      {jobStatus.replace(/_/g, " ")}
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
