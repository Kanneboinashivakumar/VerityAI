"use client";

import { ShieldCheck, Lock, EyeOff, Server, CheckCircle2 } from "lucide-react";

export default function SecurityPage() {
  return (

        <main className="p-8 max-w-4xl w-full mx-auto space-y-6">
          <div className="space-y-1">
            <h1 className="font-serif text-3xl font-normal text-slate-900">Security & Privacy</h1>
            <p className="text-xs text-slate-500">
              How Verity AI protects your research data, prevents SSRF attacks, and safeguards credentials.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>SSRF Protection Guard</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  All target URLs are verified against private IPv4 ranges (10.x, 172.16-31.x, 192.168.x), localhost, loopback, link-local, and cloud metadata services.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-blue-600 text-xs font-bold">
                  <Lock className="w-4 h-4" />
                  <span>Server-Side Credential Isolation</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  API keys for Google Gen AI (Gemma) and TinyFish are strictly isolated to server-side endpoints and never delivered to browser clients.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold">
                  <EyeOff className="w-4 h-4" />
                  <span>Untrusted Content Sanitization</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Web contents fetched via TinyFish are treated as untrusted text. Embedded instructions or prompt injection vectors are neutralized before model reasoning.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-purple-600 text-xs font-bold">
                  <Server className="w-4 h-4" />
                  <span>Row Level Security (RLS)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  PostgreSQL database tables and Supabase storage enforce user session boundaries to prevent cross-account research leakage.
                </p>
              </div>
            </div>
          </div>
        </main>
  );
}
