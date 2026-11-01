"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";

export function SaveResearchButton({ projectId, itemId, itemType = "report", compact = false }: { projectId: string; itemId?: string; itemType?: "report" | "finding" | "source"; compact?: boolean }) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const save = async () => {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projectId, item_type: itemType, item_id: itemId || projectId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save this item.");
      setSaved(true);
      setMessage("Saved to Saved Items");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save this item.");
    } finally {
      setBusy(false);
    }
  };

  return <span className="inline-flex flex-col items-end gap-1"><button type="button" onClick={save} disabled={busy || saved} aria-pressed={saved} className={`inline-flex items-center justify-center gap-2 rounded-xl border transition-colors disabled:cursor-default ${compact ? "p-2 text-blue-700" : "px-4 py-2.5 text-sm font-semibold"} ${saved ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}><Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />{!compact && (busy ? "Saving…" : saved ? "Saved" : "Save to Saved Items")}</button>{message && <span role="status" className="max-w-56 text-right text-[11px] text-slate-500">{message}</span>}</span>;
}
