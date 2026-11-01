"use client";

import { useState } from "react";
import {
  FileText,
  GitCompare,
  ArrowRight,
  Download,
  Bookmark,
  ExternalLink,
  ChevronDown,
  Plus,
  Minus,
  Edit3,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  X,
  Layers,
  BarChart2,
  Check,
} from "lucide-react";

interface ComparisonPreset {
  id: string;
  name: string;
  doc1: {
    title: string;
    filename: string;
    meta: string;
    sections: { heading: string; content: React.ReactNode }[];
  };
  doc2: {
    title: string;
    filename: string;
    meta: string;
    sections: { heading: string; content: React.ReactNode }[];
  };
  metrics: {
    additions: number;
    removals: number;
    modifications: number;
    total: number;
  };
  keyChanges: {
    title: string;
    description: string;
    type: "added" | "modified" | "removed";
  }[];
  potentialImpact: string;
}

const PRESETS: Record<string, ComparisonPreset> = {
  amazon: {
    id: "amazon",
    name: "Amazon SDE: Summer TA vs Jan 2027 6-Month",
    doc1: {
      title: "Amazon SDE-I Intern (Posting #10541345)",
      filename: "Amazon SDE-I Intern TA.html",
      meta: "amazon.jobs • University Talent Acquisition",
      sections: [
        {
          heading: "1. Internship Cohort & Duration",
          content: (
            <p className="text-xs text-slate-700 leading-relaxed">
              Standard university intern cohort with an expected duration of{" "}
              <span className="bg-rose-100 text-rose-800 line-through px-1.5 py-0.5 rounded font-medium">
                2 to 3 months (Summer term)
              </span>
              . Open to Bachelor&apos;s or Master&apos;s degree students in Computer Science or related STEM disciplines.
            </p>
          ),
        },
        {
          heading: "2. Graduation Batch & Eligibility",
          content: (
            <p className="text-xs text-slate-700 leading-relaxed">
              Candidate must be currently enrolled in an accredited degree program with graduation expected in{" "}
              <span className="bg-rose-100 text-rose-800 line-through px-1.5 py-0.5 rounded font-medium">
                2026 or 2027
              </span>
              . Must return to degree program upon internship completion.
            </p>
          ),
        },
        {
          heading: "3. Technical Skill Requirements",
          content: (
            <p className="text-xs text-slate-700 leading-relaxed">
              Proficiency in at least one modern object-oriented programming language such as Java, C++, C#, or Python. Core understanding of Data Structures and Algorithms.
            </p>
          ),
        },
      ],
    },
    doc2: {
      title: "Amazon SDE Intern Jan 2027 (Posting #10517894)",
      filename: "Amazon SDE Intern Jan 2027 6-Month.html",
      meta: "amazon.jobs • 6-Month Cohort India",
      sections: [
        {
          heading: "1. Internship Cohort & Duration",
          content: (
            <p className="text-xs text-slate-700 leading-relaxed">
              Specialized university intern cohort requiring a{" "}
              <span className="bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded">
                full-time 6-month commitment from January 2027 to June 2027
              </span>
              . Requires official college NOC for full-time participation.
            </p>
          ),
        },
        {
          heading: "2. Graduation Batch & Eligibility",
          content: (
            <p className="text-xs text-slate-700 leading-relaxed">
              Strictly restricted to students graduating in the{" "}
              <span className="bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded">
                2027 batch (final year of engineering / MCA)
              </span>
              . 7.0+ CGPA or equivalent without active backlogs.
            </p>
          ),
        },
        {
          heading: "3. Technical Skill Requirements",
          content: (
            <p className="text-xs text-slate-700 leading-relaxed">
              Proficiency in Java, C++, or Python, alongside strong grasp of DSA, Object-Oriented Design, and familiarity with{" "}
              <span className="bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded">
                cloud architectures, distributed systems, and AWS foundation services
              </span>
              .
            </p>
          ),
        },
      ],
    },
    metrics: {
      additions: 4,
      removals: 2,
      modifications: 6,
      total: 10,
    },
    keyChanges: [
      {
        title: "Internship Duration extended to 6 Months",
        description: "Jan 2027 to Jun 2027 full-time commitment replaces summer 2-month format.",
        type: "added",
      },
      {
        title: "2027 Batch requirement strictly enforced",
        description: "Eligibility is narrowed strictly to 2027 graduates requiring formal college NOC.",
        type: "added",
      },
      {
        title: "AWS Cloud & Distributed Systems priority",
        description: "Job posting #10517894 explicitly emphasizes cloud and distributed systems aptitude.",
        type: "modified",
      },
    ],
    potentialImpact:
      "Applicants aiming for the Jan 2027 cohort must secure academic NOC for 6-month full-time internship in India and demonstrate readiness in both algorithmic problem solving and AWS cloud fundamentals.",
  },

  gsoc: {
    id: "gsoc",
    name: "GSoC 2026 vs 2027 Guidelines",
    doc1: {
      title: "GSoC 2026 Program Guidelines",
      filename: "GSoC 2026 Program Guidelines.pdf",
      meta: "Uploaded Oct 18, 2026 • 1.8 MB",
      sections: [
        {
          heading: "3. Eligibility",
          content: (
            <p className="text-xs text-slate-700 leading-relaxed">
              To be eligible for Google Summer of Code 2026, you must be{" "}
              <span className="bg-rose-100 text-rose-800 line-through px-1.5 py-0.5 rounded font-medium">
                at least 18 years old
              </span>{" "}
              and be a student enrolled in a degree program or be a recent graduate.
            </p>
          ),
        },
        {
          heading: "4. Stipend",
          content: (
            <p className="text-xs text-slate-700 leading-relaxed">
              Selected contributors will receive a stipend ranging from{" "}
              <span className="bg-rose-100 text-rose-800 line-through px-1.5 py-0.5 rounded font-medium">
                $5,000 to $5,500 USD
              </span>
              , depending on the project and organization.
            </p>
          ),
        },
        {
          heading: "5. Program Timeline",
          content: (
            <div className="space-y-1 text-xs text-slate-700 leading-relaxed">
              <p>• Applications open: March 1, 2026</p>
              <p>
                • Application deadline:{" "}
                <span className="bg-rose-100 text-rose-800 line-through px-1.5 py-0.5 rounded font-medium">
                  March 31, 2026
                </span>
              </p>
              <p>• Contributor selection: April – May 2026</p>
              <p>• Coding period: June – August 2026</p>
            </div>
          ),
        },
        {
          heading: "6. Participating Organizations",
          content: (
            <p className="text-xs text-slate-700 leading-relaxed">
              A list of participating organizations will be published on the official website.
            </p>
          ),
        },
      ],
    },
    doc2: {
      title: "GSoC 2027 Program Guidelines",
      filename: "GSoC 2027 Program Guidelines.pdf",
      meta: "Uploaded Oct 20, 2026 • 2.4 MB",
      sections: [
        {
          heading: "3. Eligibility",
          content: (
            <p className="text-xs text-slate-700 leading-relaxed">
              To be eligible for Google Summer of Code 2027, you must be at least 18 years old and be a student enrolled in
              a degree program,{" "}
              <span className="bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded">
                a recent graduate, or currently in a gap year.
              </span>
            </p>
          ),
        },
        {
          heading: "4. Stipend",
          content: (
            <p className="text-xs text-slate-700 leading-relaxed">
              Selected contributors will receive a stipend ranging from{" "}
              <span className="bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded">
                $5,500 to $6,000 USD
              </span>
              , depending on the project and organization.
            </p>
          ),
        },
        {
          heading: "5. Program Timeline",
          content: (
            <div className="space-y-1 text-xs text-slate-700 leading-relaxed">
              <p>
                • Applications open:{" "}
                <span className="bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded">
                  March 8, 2027
                </span>
              </p>
              <p>
                • Application deadline:{" "}
                <span className="bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded">
                  April 8, 2027
                </span>
              </p>
              <p>• Contributor selection: April – May 2027</p>
              <p>• Coding period: June – August 2027</p>
            </div>
          ),
        },
        {
          heading: "6. Participating Organizations",
          content: (
            <p className="text-xs text-slate-700 leading-relaxed">
              An updated list of participating organizations will be published on the official website,{" "}
              <span className="bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded">
                with more focus on AI/ML and open-source infrastructure projects.
              </span>
            </p>
          ),
        },
      ],
    },
    metrics: {
      additions: 5,
      removals: 4,
      modifications: 8,
      total: 12,
    },
    keyChanges: [
      {
        title: "Eligibility expanded",
        description: "Gap year students are now eligible in 2027.",
        type: "added",
      },
      {
        title: "Stipend range increased",
        description: "$5,500 – $6,000 in 2027 (was $5,000 – $5,500).",
        type: "added",
      },
      {
        title: "Updated timeline",
        description: "Application dates moved to March 8 – April 8, 2027.",
        type: "added",
      },
      {
        title: "Additional focus areas",
        description: "More emphasis on AI/ML and infrastructure projects.",
        type: "modified",
      },
      {
        title: "Application deadline changed",
        description: "March 31, 2026 → April 8, 2027.",
        type: "modified",
      },
    ],
    potentialImpact:
      "The 2027 guidelines show a broader eligibility criteria, higher stipend range, and a slight delay in the application timeline, indicating a more inclusive and expanded program.",
  },
  gnani: {
    id: "gnani",
    name: "Gnani AI 2026: Official Portal vs Terms & Blog",
    doc1: {
      title: "Gnani AI Official Internship Announcement",
      filename: "Gnani AI Internship Portal Page.html",
      meta: "Fetched Nov 1, 2026 • Live URL",
      sections: [
        {
          heading: "1. Programme Overview & Offers",
          content: (
            <p className="text-xs text-slate-700 leading-relaxed">
              Gnani AI announces the Great Indian AI Internship Challenge offering{" "}
              <span className="bg-rose-100 text-rose-800 line-through px-1.5 py-0.5 rounded font-medium">
                100 paid internships
              </span>{" "}
              with stipends up to ₹1 Lakh/month for engineering students across India.
            </p>
          ),
        },
        {
          heading: "2. Submission Process",
          content: (
            <p className="text-xs text-slate-700 leading-relaxed">
              Candidates must submit AI project code and models via{" "}
              <span className="bg-rose-100 text-rose-800 line-through px-1.5 py-0.5 rounded font-medium">
                the registration form link
              </span>
              . Selection will be based on prototype quality and presentation.
            </p>
          ),
        },
        {
          heading: "3. Eligibility & Individual / Team Rules",
          content: (
            <p className="text-xs text-slate-700 leading-relaxed">
              Open to pre-final and final-year B.Tech / M.Tech / MCA students. Submissions are individual.
            </p>
          ),
        },
      ],
    },
    doc2: {
      title: "Gnani AI Terms, Blog & Registration Form",
      filename: "Gnani AI Terms & Registration.html",
      meta: "Fetched Nov 1, 2026 • Live URL",
      sections: [
        {
          heading: "1. Programme Overview & Offers",
          content: (
            <p className="text-xs text-slate-700 leading-relaxed">
              The internship offers top performers stipends up to ₹1,00,000/month,{" "}
              <span className="bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded">
                conditional on final technical review, IP assignment, and code audit by Gnani AI mentors.
              </span>
            </p>
          ),
        },
        {
          heading: "2. Submission Process",
          content: (
            <p className="text-xs text-slate-700 leading-relaxed">
              Candidates must register using the official Google Form.{" "}
              <span className="bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded">
                GitHub repository links and working demo videos must be submitted by the deadline.
              </span>
            </p>
          ),
        },
        {
          heading: "3. Eligibility & Individual / Team Rules",
          content: (
            <p className="text-xs text-slate-700 leading-relaxed">
              Open to pre-final and final-year students.{" "}
              <span className="bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded">
                Team submissions up to 3 members are permitted if explicitly registered together.
              </span>
            </p>
          ),
        },
      ],
    },
    metrics: {
      additions: 4,
      removals: 2,
      modifications: 5,
      total: 9,
    },
    keyChanges: [
      {
        title: "Conditional offer terms clarified",
        description: "Stipend up to ₹1L is subject to code evaluation and IP assignment.",
        type: "added",
      },
      {
        title: "Team participation allowed",
        description: "Teams of up to 3 members permitted per updated registration rules.",
        type: "added",
      },
      {
        title: "GitHub repo & demo video required",
        description: "Submissions must include public repository link and walkthrough video.",
        type: "added",
      },
      {
        title: "Evaluation stages detailed",
        description: "Shortlisting involves automated code analysis followed by technical interview.",
        type: "modified",
      },
    ],
    potentialImpact:
      "Clarified participation rules enable collaborative team entries, but introduce stricter IP assignment and code verification checkpoints before stipend disbursement.",
  },
  nmmss: {
    id: "nmmss",
    name: "NMMSS Scheme: 2025–26 vs 2026–27 Guidelines",
    doc1: {
      title: "NMMSS Operational Guidelines 2025–26",
      filename: "NMMSS Scheme Guidelines 2025-26.pdf",
      meta: "Ministry of Education • 1.2 MB",
      sections: [
        {
          heading: "1. Income Ceiling & Eligibility",
          content: (
            <p className="text-xs text-slate-700 leading-relaxed">
              Parents&apos; total annual income from all sources must not exceed{" "}
              <span className="bg-rose-100 text-rose-800 line-through px-1.5 py-0.5 rounded font-medium">
                ₹3,50,000 per annum
              </span>
              . Students studying in Navodaya, Kendriya Vidyalayas, and residential schools are not eligible.
            </p>
          ),
        },
        {
          heading: "2. Scholarship Amount & Renewal",
          content: (
            <p className="text-xs text-slate-700 leading-relaxed">
              Scholarship amount is ₹12,000 per annum (₹1,000 per month). Continued disbursement in classes X, XI, and XII
              requires minimum 55% marks (50% for SC/ST) in previous academic examinations.
            </p>
          ),
        },
        {
          heading: "3. Verification Timelines",
          content: (
            <p className="text-xs text-slate-700 leading-relaxed">
              State-level examination held in November. Verification through NSP portal Institute level (L1) closes on{" "}
              <span className="bg-rose-100 text-rose-800 line-through px-1.5 py-0.5 rounded font-medium">
                November 15
              </span>
              , District level (L2) closes on{" "}
              <span className="bg-rose-100 text-rose-800 line-through px-1.5 py-0.5 rounded font-medium">
                November 30
              </span>
              .
            </p>
          ),
        },
      ],
    },
    doc2: {
      title: "NMMSS Operational Guidelines 2026–27",
      filename: "NMMSS Scheme Guidelines 2026-27.pdf",
      meta: "Ministry of Education • 1.5 MB",
      sections: [
        {
          heading: "1. Income Ceiling & Eligibility",
          content: (
            <p className="text-xs text-slate-700 leading-relaxed">
              Parents&apos; total annual income from all sources must not exceed ₹3,50,000 per annum.{" "}
              <span className="bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded">
                Aadhaar-seeded bank account and APAAR / One Nation One Student ID are now mandatory.
              </span>
            </p>
          ),
        },
        {
          heading: "2. Scholarship Amount & Renewal",
          content: (
            <p className="text-xs text-slate-700 leading-relaxed">
              Scholarship amount is ₹12,000 per annum.{" "}
              <span className="bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded">
                Direct Benefit Transfer (DBT) is executed via PFMS Aadhaar payment bridge without intermediary delays.
              </span>
            </p>
          ),
        },
        {
          heading: "3. Verification Timelines",
          content: (
            <p className="text-xs text-slate-700 leading-relaxed">
              State-level examination held in November. Verification through NSP portal Institute level (L1) deadline
              extended to{" "}
              <span className="bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded">
                December 15, 2026
              </span>
              , District level (L2) closes on{" "}
              <span className="bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded">
                December 31, 2026
              </span>
              .
            </p>
          ),
        },
      ],
    },
    metrics: {
      additions: 3,
      removals: 2,
      modifications: 4,
      total: 7,
    },
    keyChanges: [
      {
        title: "APAAR ID & Aadhaar seeding mandatory",
        description: "Applicants must provide APAAR ID for automated student verification.",
        type: "added",
      },
      {
        title: "Direct DBT via PFMS bridge",
        description: "Payment disbursement streamlined through national Aadhaar payment bridge.",
        type: "added",
      },
      {
        title: "L1 & L2 verification extended",
        description: "Deadlines shifted to Dec 15 (L1) and Dec 31 (L2) to prevent student exclusion.",
        type: "modified",
      },
    ],
    potentialImpact:
      "Stricter digital identity requirements ensure transparent disbursement, while extended verification windows accommodate state examination result delays.",
  },
};

export default function ComparisonPage() {
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>("gsoc");
  const [activeTab, setActiveTab] = useState<"key-changes" | "side-by-side" | "summary" | "implications">("key-changes");
  const [savedNotification, setSavedNotification] = useState(false);
  const [isComparing, setIsComparing] = useState(false);

  const preset = PRESETS[selectedPresetKey] || PRESETS.gsoc;

  const handleTriggerCompare = () => {
    setIsComparing(true);
    setTimeout(() => {
      setIsComparing(false);
    }, 400);
  };

  const handleSaveComparison = () => {
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  const handleExportReport = () => {
    const reportText = `VERITY AI - RESEARCH COMPARISON REPORT
Preset: ${preset.name}
Generated: ${new Date().toLocaleDateString("en-US")}

DOCUMENT 1: ${preset.doc1.title} (${preset.doc1.filename})
DOCUMENT 2: ${preset.doc2.title} (${preset.doc2.filename})

METRICS:
- Additions: ${preset.metrics.additions}
- Removals: ${preset.metrics.removals}
- Modifications: ${preset.metrics.modifications}
- Total Changes: ${preset.metrics.total}

KEY CHANGES:
${preset.keyChanges.map((c) => `[${c.type.toUpperCase()}] ${c.title}: ${c.description}`).join("\n")}

POTENTIAL IMPACT:
${preset.potentialImpact}
`;

    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `verity-comparison-${selectedPresetKey}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-8">
      {/* Toast Notification */}
      {savedNotification && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs text-white shadow-lg animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>Comparison saved to your workspace!</span>
        </div>
      )}

      {/* Top Header matching reference image 2 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl font-normal text-slate-900">Research Comparison</h1>
          <p className="text-xs text-slate-500">
            Compare two documents, research results, or sources to identify what&apos;s changed.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveComparison}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
          >
            <Bookmark className="h-4 w-4 text-slate-400" />
            <span>Save Comparison</span>
          </button>

          <button
            type="button"
            onClick={handleExportReport}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export Report</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-80" />
          </button>
        </div>
      </div>

      {/* Select Items to Compare Section matching Image 2 */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Select Items to Compare</h2>
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[11px] mr-1">Presets:</span>
            {Object.entries(PRESETS).map(([key, val]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedPresetKey(key)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  selectedPresetKey === key
                    ? "bg-blue-50 text-blue-700 border border-blue-200 font-semibold"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"
                }`}
              >
                {val.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Doc 1 Selector */}
          <div className="lg:col-span-5 space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-500">Document / Research 1</label>
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">{preset.doc1.filename}</div>
                  <div className="text-[10px] text-slate-400">{preset.doc1.meta}</div>
                </div>
              </div>
              <button type="button" aria-label="Clear document 1" className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Doc 2 Selector */}
          <div className="lg:col-span-5 space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-500">Document / Research 2</label>
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">{preset.doc2.filename}</div>
                  <div className="text-[10px] text-slate-400">{preset.doc2.meta}</div>
                </div>
              </div>
              <button type="button" aria-label="Clear document 2" className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Blue Compare Button on Right */}
          <div className="lg:col-span-2 pt-5 flex items-center">
            <button
              type="button"
              onClick={handleTriggerCompare}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all"
            >
              <GitCompare className={`w-4 h-4 ${isComparing ? "animate-spin" : ""}`} />
              <span>{isComparing ? "Comparing..." : "Compare"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs matching Image 2 */}
      <div className="flex items-center gap-6 border-b border-slate-200/80 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("key-changes")}
          className={`flex items-center gap-2 pb-3 font-semibold transition-colors border-b-2 ${
            activeTab === "key-changes"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Key Changes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("side-by-side")}
          className={`flex items-center gap-2 pb-3 font-semibold transition-colors border-b-2 ${
            activeTab === "side-by-side"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Side by Side View</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("summary")}
          className={`flex items-center gap-2 pb-3 font-semibold transition-colors border-b-2 ${
            activeTab === "summary"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Summary</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("implications")}
          className={`flex items-center gap-2 pb-3 font-semibold transition-colors border-b-2 ${
            activeTab === "implications"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          <span>Implications</span>
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === "key-changes" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Doc 1 Left Card (4.25 cols) */}
          <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-slate-900 truncate">{preset.doc1.title}</h3>
                  <p className="text-[10px] text-slate-400">{preset.doc1.meta}</p>
                </div>
              </div>
              <button type="button" aria-label="Open document 1" className="text-slate-400 hover:text-slate-600 p-1">
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-5">
              {preset.doc1.sections.map((sec, idx) => (
                <div key={idx} className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-900">{sec.heading}</h4>
                  {sec.content}
                </div>
              ))}
            </div>
          </div>

          {/* Doc 2 Middle Card (4.25 cols) */}
          <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-slate-900 truncate">{preset.doc2.title}</h3>
                  <p className="text-[10px] text-slate-400">{preset.doc2.meta}</p>
                </div>
              </div>
              <button type="button" aria-label="Open document 2" className="text-slate-400 hover:text-slate-600 p-1">
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-5">
              {preset.doc2.sections.map((sec, idx) => (
                <div key={idx} className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-900">{sec.heading}</h4>
                  {sec.content}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Comparison Summary & Insights (3.5 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Comparison Summary 2x2 Grid matching Image 2 */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-600" />
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Comparison Summary</h3>
                  <p className="text-[10px] text-slate-400">Key differences between the two documents.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Additions */}
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="text-base font-bold text-slate-900 leading-none">{preset.metrics.additions}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Additions</div>
                  </div>
                </div>

                {/* Removals */}
                <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
                    <Minus className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="text-base font-bold text-slate-900 leading-none">{preset.metrics.removals}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Removals</div>
                  </div>
                </div>

                {/* Modifications */}
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <Edit3 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-base font-bold text-slate-900 leading-none">{preset.metrics.modifications}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Modifications</div>
                  </div>
                </div>

                {/* Total Changes */}
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-base font-bold text-slate-900 leading-none">{preset.metrics.total}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Total Changes</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Changes List matching Image 2 */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900">Key Changes</h3>
                <span className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer">
                  View All &rarr;
                </span>
              </div>

              <div className="space-y-3 divide-y divide-slate-50">
                {preset.keyChanges.map((item, idx) => (
                  <div key={idx} className="pt-3 first:pt-0 flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {item.type === "added" ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                          <Edit3 className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-semibold text-slate-900 truncate">{item.title}</h4>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 uppercase tracking-wider ${
                            item.type === "added"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {item.type === "added" ? "Added" : "Modified"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Potential Impact Card matching Image 2 */}
            <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <Lightbulb className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-bold text-blue-950">Potential Impact</h4>
              </div>
              <p className="text-xs text-blue-900/90 leading-relaxed">{preset.potentialImpact}</p>
            </div>
          </div>
        </div>
      )}

      {/* Side by Side View Tab */}
      {activeTab === "side-by-side" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <div className="space-y-4 pr-4 border-r border-slate-100">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Base Document: {preset.doc1.title}</span>
            </div>
            {preset.doc1.sections.map((sec, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-2">
                <div className="text-xs font-bold text-slate-800">{sec.heading}</div>
                {sec.content}
              </div>
            ))}
          </div>

          <div className="space-y-4 pl-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Updated Document: {preset.doc2.title}</span>
            </div>
            {preset.doc2.sections.map((sec, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-2">
                <div className="text-xs font-bold text-slate-800">{sec.heading}</div>
                {sec.content}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Tab */}
      {activeTab === "summary" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="space-y-1">
            <h3 className="font-serif text-xl font-normal text-slate-900">Comprehensive Change Log</h3>
            <p className="text-xs text-slate-500">
              Categorized structural modifications identified across both source versions.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-700">
                <tr>
                  <th className="p-3 font-bold rounded-l-lg">Category</th>
                  <th className="p-3 font-bold">Base Version</th>
                  <th className="p-3 font-bold">New Version</th>
                  <th className="p-3 font-bold rounded-r-lg">Significance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3 font-semibold text-slate-900">Eligibility Scope</td>
                  <td className="p-3 text-rose-700">Degree students & recent graduates only</td>
                  <td className="p-3 text-emerald-700">Enrolled students, recent grads, and gap-year contributors</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[10px]">High Impact</span></td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900">Financial Terms</td>
                  <td className="p-3 text-rose-700">$5,000 – $5,500 USD</td>
                  <td className="p-3 text-emerald-700">$5,500 – $6,000 USD (+10% bump)</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[10px]">Positive</span></td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900">Application Deadlines</td>
                  <td className="p-3 text-slate-600">March 31</td>
                  <td className="p-3 text-blue-700">April 8 (8 days extension)</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[10px]">Moderate</span></td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900">Strategic Alignment</td>
                  <td className="p-3 text-slate-600">General open-source organizations</td>
                  <td className="p-3 text-emerald-700">Specialized emphasis on AI/ML and infrastructure</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold text-[10px]">Strategic</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Implications Tab */}
      {activeTab === "implications" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="space-y-1">
            <h3 className="font-serif text-xl font-normal text-slate-900">Strategic Implications & Recommendations</h3>
            <p className="text-xs text-slate-500">
              Guidance for contributors and institutions preparing for this revised cycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>For Applicants</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Take advantage of the expanded gap-year eligibility if currently between degree programs. Align portfolio
                projects with AI/ML or systems infrastructure to match the elevated program priorities.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Verification Checklist</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Confirm the revised April 8 submission cutoff against local timezone conversions. Note that organization
                project ideas lists typically launch 3 weeks before contributor proposals open.
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}