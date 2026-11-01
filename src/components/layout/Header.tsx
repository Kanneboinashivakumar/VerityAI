"use client";

import { useEffect, useState } from "react";
import { Search, Bell, ChevronDown } from "lucide-react";
import Link from "next/link";

export function Header() {
  const [displayName, setDisplayName] = useState("Account");
  const [email, setEmail] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((profile) => {
        if (!profile) return;
        setDisplayName(profile.display_name || profile.email?.split("@")[0] || "Account");
        setEmail(profile.email || "");
      })
      .catch(() => {});

    const fetchNotifs = () => {
      fetch("/api/notifications")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && typeof data.unreadCount === "number") {
            setUnreadCount(data.unreadCount);
          }
        })
        .catch(() => {});
    };

    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, []);

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white px-8">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search your research, sources, or past analyses..."
          className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 py-2.5 pl-10 pr-16 text-xs text-slate-800 placeholder:text-slate-400 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
          Ctrl K
        </kbd>
      </div>

      <div className="ml-4 flex items-center gap-4">
        <Link
          href="/notifications"
          aria-label="Notifications"
          className="relative rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
          )}
        </Link>

        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-xl py-1 pl-2 pr-2 transition-colors hover:bg-slate-50"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-medium text-white">
            {initial}
          </div>
          <div className="hidden text-left sm:block">
            <div className="text-xs font-semibold leading-tight text-slate-900">{displayName}</div>
            <div className="max-w-36 truncate text-[11px] leading-tight text-slate-400">{email}</div>
          </div>
          <ChevronDown className="ml-0.5 h-3.5 w-3.5 text-slate-400" />
        </Link>
      </div>
    </header>
  );
}
