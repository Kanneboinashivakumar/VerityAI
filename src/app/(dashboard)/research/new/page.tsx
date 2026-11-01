"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Link as LinkIcon,
  Upload,
  FileText,
  Globe,
  ArrowRight,
  Info,
} from "lucide-react";

export default function NewResearchPage() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [urlsInput, setUrlsInput] = useState("");
  const [pastedTextInput, setPastedTextInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

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
        const uploadRes = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const docData = await uploadRes.json();
          extractedDocText = docData.extractedText || "";
        }
      }

      const combinedText = [pastedTextInput, extractedDocText].filter(Boolean).join("\n\n");

      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          urls,
          pastedText: combinedText || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create research job");
      }

      const data = await res.json();
      router.push(`/research/${data.job_id}/progress`);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <>
        <main className="p-8 max-w-4xl w-full mx-auto space-y-8">
          <div>
            <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-1">
              RESEARCH WORKSPACE
            </div>
            <h1 className="font-serif text-3xl font-normal text-slate-900">
              New Research Investigation
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Submit your inquiry and connect candidate sources. Verity AI will discover websites, extract factual claims, detect gaps, and build your verification checklist.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xs space-y-6">
            {/* Primary Question */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>Research Question or Topic</span>
                <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. What are the latest eligibility criteria, deadlines, and stipend details for Google Summer of Code 2027?"
                className="w-full text-sm text-slate-900 placeholder:text-slate-400 p-4 rounded-xl border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <p className="text-[11px] text-slate-400">
                Be as specific as possible regarding programs, dates, institutions, or criteria.
              </p>
            </div>

            {/* Optional Specific URLs */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span>Target URLs to Analyze (Optional)</span>
                </span>
                <span className="text-[11px] text-slate-400 font-normal">One URL per line</span>
              </label>
              <textarea
                rows={3}
                value={urlsInput}
                onChange={(e) => setUrlsInput(e.target.value)}
                placeholder="https://example.com/announcement&#10;https://example.org/guidelines"
                className="w-full text-xs font-mono p-3 bg-slate-50/50 rounded-xl border border-slate-200/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Upload PDF Document */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-rose-600" />
                <span>Upload PDF Document (Optional)</span>
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
              {selectedFile && (
                <div className="text-[11px] text-emerald-600 font-medium">
                  ✓ Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>

            {/* Paste Text */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-600" />
                <span>Paste Text or Notes (Optional)</span>
              </label>
              <textarea
                rows={3}
                value={pastedTextInput}
                onChange={(e) => setPastedTextInput(e.target.value)}
                placeholder="Paste relevant excerpts, circulars, or notes here..."
                className="w-full text-xs p-3 bg-slate-50/50 rounded-xl border border-slate-200/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="p-3.5 bg-blue-50/60 border border-blue-100/80 rounded-xl flex items-start gap-2.5 text-xs text-blue-800">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Even if you provide no URLs, TinyFish Search will automatically discover authoritative web sources, institutional archives, and official announcements.
              </span>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !question.trim()}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-navy-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-all"
              >
                <span>{isSubmitting ? "Launching Investigation..." : "Start Investigation"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </main>
    </>
  );
}
