"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Home,
  PlusCircle,
  FileText,
  Bookmark,
  File,
  GitCompare,
  Bell,
  User,
  Sparkles,
  HelpCircle,
  LogOut,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  // Use ref to avoid re-render on pathname change
  const [collapsed, setCollapsed] = useState(false);
  const initialized = useRef(false);

  // Read localStorage only once on mount — never re-read on navigation
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      const saved = window.localStorage.getItem("verity-sidebar-collapsed");
      if (saved === "true") setCollapsed(true);
    }
  }, []);

  const toggleSidebar = () => {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem("verity-sidebar-collapsed", String(next));
      return next;
    });
  };

  const signOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    router.replace("/auth/signin");
  };

  const navItems = [
    { label: "Home", href: "/dashboard", icon: Home },
    { label: "New Research", href: "/research/new", icon: PlusCircle },
    { label: "My Research", href: "/my-research", icon: FileText },
    { label: "Saved Items", href: "/saved", icon: Bookmark },
    { label: "Documents", href: "/documents", icon: File },
    { label: "Research Comparison", href: "/comparison", icon: GitCompare },
    { label: "Notifications", href: "/notifications", icon: Bell },
    { label: "Profile", href: "/profile", icon: User },
  ];

  return (
    <aside
      className={`${
        collapsed ? "w-[72px]" : "w-64"
      } shrink-0 bg-white border-r border-slate-200/80 flex flex-col justify-between h-screen sticky top-0 z-30 select-none transition-[width] duration-200 overflow-hidden`}
    >
      {/* Top brand */}
      <div className={collapsed ? "p-3 pt-4" : "p-6"}>
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between gap-2.5"}`}>
          {/* Logo — hidden entirely when collapsed */}
          {!collapsed && (
            <Link
              href="/dashboard"
              aria-label="Verity AI home"
              title="Verity AI"
              className="flex min-w-0 items-center group"
            >
              <Image
                src="/logo-black.png"
                alt="Verity AI"
                width={130}
                height={32}
                priority
                className="h-8 w-auto object-contain"
                style={{ maxWidth: 130 }}
              />
            </Link>
          )}

          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Nav Links */}
        <nav className={`${collapsed ? "mt-5" : "mt-8"} space-y-1`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`flex items-center ${
                  collapsed ? "justify-center px-0" : "gap-3 px-3.5"
                } py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-50/80 text-blue-600 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon
                  className={`w-[18px] h-[18px] shrink-0 ${
                    isActive ? "text-blue-600" : "text-slate-400"
                  }`}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Promo & Help */}
      <div className={`${collapsed ? "p-2" : "p-4"} space-y-4`}>
        {/* Upgrade card — hidden when collapsed */}
        {!collapsed && (
          <div className="bg-gradient-to-b from-blue-50/60 to-slate-50 border border-blue-100/80 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-amber-600 mb-1.5">
              <Sparkles className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span className="text-xs font-semibold tracking-wide text-slate-900">
                Upgrade to Pro
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              Get more research credits and advanced features.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center w-full px-3 py-1.5 bg-blue-50 hover:bg-blue-100/80 text-blue-600 border border-blue-200/60 text-xs font-medium rounded-lg transition-colors group"
            >
              <span>View Plans</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        )}

        {/* Static Links */}
        <div
          className={`${
            collapsed ? "space-y-1 pt-2" : "space-y-1 pt-2"
          } border-t border-slate-100`}
        >
          <Link
            href="/help"
            title="Help & Support"
            className={`flex items-center ${
              collapsed ? "justify-center px-0" : "gap-3 px-3.5"
            } py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors`}
          >
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
            {!collapsed && <span>Help & Support</span>}
          </Link>
          <button
            type="button"
            onClick={signOut}
            title="Sign Out"
            className={`flex w-full items-center ${
              collapsed ? "justify-center px-0" : "gap-3 px-3.5"
            } py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors`}
          >
            <LogOut className="w-4 h-4 text-slate-400 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
