"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Shield,
  LogOut,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Bookmark,
  FileText,
  Key,
  ExternalLink,
  GraduationCap,
  Building,
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState("Shiva Kumar");
  const [headline, setHeadline] = useState("Data Science Student");
  const [institution, setInstitution] = useState("B.Tech Computer Science & Engineering");
  const [email, setEmail] = useState("shiva.kumar@example.com");
  const [researchFocus, setResearchFocus] = useState("Opportunity Verification, AI/ML Internships, Scholarships");
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((profile) => {
        if (!profile) return;
        if (profile.display_name) {
          setDisplayName(profile.display_name);
        }
        if (profile.email) {
          setEmail(profile.email);
        }
      })
      .catch(() => {});
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      router.replace("/auth/signin");
    } catch {
      router.replace("/auth/signin");
    }
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 p-8">
      {/* Top Breadcrumb & Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/dashboard" className="hover:text-slate-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">My Profile</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-normal text-slate-900">Profile &amp; Account</h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage your personal research preferences, credentials, and verification workspace.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span>{isSigningOut ? "Signing Out..." : "Sign Out"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (4 cols): User Card & Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs text-center space-y-4">
            <div className="relative mx-auto w-20 h-20">
              <div className="w-20 h-20 rounded-full bg-[#0B172A] text-white flex items-center justify-center font-serif text-2xl font-bold shadow-md">
                SK
              </div>
              <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white" title="Active">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="font-serif text-xl font-normal text-slate-900">{displayName}</h2>
              <p className="text-xs font-semibold text-blue-600">{headline}</p>
              <p className="text-xs text-slate-400">{email}</p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-1">
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Student Tier
              </span>
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Verified Researcher
              </span>
            </div>

            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-left">
              <div className="p-3 bg-slate-50 rounded-xl">
                <div className="text-[10px] text-slate-400 font-medium">Monthly Analyses</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">4 / 25 Used</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <div className="text-[10px] text-slate-400 font-medium">Verified Facts</div>
                <div className="text-sm font-bold text-emerald-700 mt-0.5">24 Claims</div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-xs font-semibold text-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out of Verity AI</span>
              </button>
            </div>
          </div>

          {/* Quick Links Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Workspace Shortcuts</h3>
            <div className="space-y-1.5 text-xs">
              <Link
                href="/my-research"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>My Past Investigations</span>
                </div>
                <span className="text-slate-400 font-bold">4</span>
              </Link>

              <Link
                href="/saved"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Bookmark className="w-4 h-4 text-slate-400" />
                  <span>Saved Findings &amp; Reports</span>
                </div>
                <span className="text-slate-400 font-bold">Saved</span>
              </Link>

              <Link
                href="/comparison"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-slate-400" />
                  <span>Research Comparison</span>
                </div>
                <span className="text-blue-600 font-semibold text-[11px]">Compare</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column (8 cols): Profile Settings Form */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSaveChanges} className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-serif text-lg font-normal text-slate-900">Personal Information</h3>
                <p className="text-xs text-slate-500 mt-0.5">Update your researcher profile and academic details.</p>
              </div>
              {saveSuccess && (
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
                  Changes saved successfully!
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Headline / Role</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Academic Program / Discipline</label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Contact Email</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Primary Research Interests</label>
              <input
                type="text"
                value={researchFocus}
                onChange={(e) => setResearchFocus(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-400">
                Helps TinySearch calibrate source discovery weighting toward your fields of study.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">Your profile information is private to your workspace.</span>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#0B172A] hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>

          {/* Connected Intelligence Services */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-normal text-slate-900">Connected Services &amp; Pipelines</h3>
            <div className="divide-y divide-slate-100">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">TinyFish Web Crawler &amp; Extractor</div>
                  <div className="text-[11px] text-slate-400">Real-time source discovery &amp; content parsing</div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active
                </span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">Google Gemma 4 Evidence Engine</div>
                  <div className="text-[11px] text-slate-400">Strict claim corroboration, conflict &amp; gap identification</div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
