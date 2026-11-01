"use client";

import { useState } from "react";
import { Upload, FileText, Download, Trash2, Eye, Search } from "lucide-react";

export default function DocumentsLibraryPage() {
  const [documents] = useState<Array<{ id: string; filename: string; size: string; pages: number; uploadedAt: string; status: string }>>([]);

  return (

        <main className="p-8 max-w-7xl w-full mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl font-normal text-slate-900">Documents Library</h1>
              <p className="text-xs text-slate-500 mt-1">
                Manage uploaded PDF reports, policy files, and extracted document intelligence.
              </p>
            </div>

            <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Upload PDF Document</span>
              <input type="file" accept=".pdf" className="hidden" />
            </label>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="divide-y divide-slate-100">
              {documents.length === 0 ? <div className="py-12 text-center"><FileText className="mx-auto h-8 w-8 text-slate-300" /><h2 className="mt-3 font-serif text-xl">No documents uploaded</h2><p className="mt-2 text-sm text-slate-500">Your uploaded documents will appear here after upload and processing.</p></div> : documents.map((doc) => (
                <div key={doc.id} className="py-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{doc.filename}</h4>
                      <p className="text-[11px] text-slate-400">
                        {doc.size} • {doc.pages} pages • Uploaded {doc.uploadedAt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                      {doc.status}
                    </span>
                    <button className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
  );
}
