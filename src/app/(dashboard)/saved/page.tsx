"use client";

import { useEffect, useState } from "react";
import { Bookmark, FileText, Globe, ArrowRight, Trash2, Search, ExternalLink } from "lucide-react";
import Link from "next/link";

type SavedItem = {
  id: string;
  title: string;
  item_type: "report" | "finding" | "source";
  item_id: string;
  project_id: string;
  snippet: string;
  source_url?: string;
  saved_at: string;
};

export default function SavedItemsPage() {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [projects, setProjects] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/saved", { cache: "no-store" }),
      fetch("/api/research", { cache: "no-store" }),
    ])
      .then(async ([savedResponse, researchResponse]) => {
        const saved = await savedResponse.json();
        const research = await researchResponse.json();
        if (!savedResponse.ok) throw new Error(saved.error || "Unable to load saved items.");
        const projectMap = Object.fromEntries(
          (research.projects || []).map((project: { id: string; title: string }) => [
            project.id,
            project.title,
          ])
        );
        setItems(saved.items || []);
        setProjects(projectMap);
        setSelectedId(saved.items?.[0]?.id || "");
      })
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : "Unable to load saved items.")
      );
  }, []);

  const filtered = items.filter((item) =>
    `${item.title} ${item.snippet} ${projects[item.project_id] || ""}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );
  const selected = filtered.find((item) => item.id === selectedId) || filtered[0];

  const remove = async (id: string) => {
    const response = await fetch(`/api/saved/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const result = await response.json();
      setError(result.error || "Could not remove this item.");
      return;
    }
    const next = items.filter((item) => item.id !== id);
    setItems(next);
    setSelectedId(next[0]?.id || "");
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="font-serif text-3xl text-slate-950">Saved Items</h1>
        <p className="mt-1 text-sm text-slate-500">
          Your bookmarked findings, sources, and research reports.
        </p>
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(330px,0.8fr)]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
            <div className="relative min-w-56 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search saved items…"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-400"
              />
            </div>
            <span className="text-xs text-slate-500">{filtered.length} items</span>
          </div>
          {error ? (
            <p className="p-5 text-sm text-rose-700">{error}</p>
          ) : filtered.length ? (
            <div className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`flex w-full items-center gap-3 p-4 text-left transition-colors ${
                    selected?.id === item.id ? "bg-blue-50/70" : "hover:bg-slate-50"
                  }`}
                >
                  <span className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
                    {item.item_type === "source" ? (
                      <Globe className="h-5 w-5" />
                    ) : (
                      <FileText className="h-5 w-5" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-900">
                      {item.title}
                    </span>
                    <span className="mt-1 block truncate text-xs text-slate-500">
                      {projects[item.project_id] || "Research"}
                    </span>
                  </span>
                  <span className="hidden rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium capitalize text-slate-600 sm:inline">
                    {item.item_type}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                </button>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center">
              <Bookmark className="mx-auto h-8 w-8 text-slate-300" />
              <h2 className="mt-3 font-serif text-xl">
                {query ? "No matching items" : "No saved items yet"}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Save a report or finding from your research to keep it here.
              </p>
              <Link
                href="/my-research"
                className="mt-4 inline-flex text-sm font-semibold text-blue-700"
              >
                View your research <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          )}
        </section>
        {selected && (
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                <FileText className="h-5 w-5" />
              </div>
              <button
                onClick={() => remove(selected.id)}
                className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                aria-label="Remove saved item"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <span className="mt-4 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium capitalize text-blue-700">
              {selected.item_type}
            </span>
            <h2 className="mt-3 font-serif text-xl leading-snug">{selected.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{selected.snippet}</p>
            <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-500">
              From{" "}
              <span className="font-semibold text-slate-800">
                {projects[selected.project_id] || "Research"}
              </span>
              <span className="mt-1 block">
                Saved {new Date(selected.saved_at).toLocaleDateString()}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/research/${selected.project_id}/report`}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Open Research <ArrowRight className="h-4 w-4" />
              </Link>
              {selected.source_url && (
                <a
                  href={selected.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700"
                >
                  <ExternalLink className="h-4 w-4" />
                  Source
                </a>
              )}
            </div>
          </aside>
        )}
      </div>
    </main>
  );
}
