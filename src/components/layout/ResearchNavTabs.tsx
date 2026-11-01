"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Layers,
  Network,
  CheckSquare,
  Globe,
  StickyNote,
} from "lucide-react";

interface ResearchNavTabsProps {
  researchId: string;
  sourcesCount?: number;
  findingsCount?: number;
  checklistCount?: number;
}

export function ResearchNavTabs({
  researchId,
  sourcesCount = 0,
  findingsCount = 0,
}: ResearchNavTabsProps) {
  const pathname = usePathname();

  const tabs = [
    {
      label: "Overview",
      href: `/research/${researchId}/report`,
      icon: FileText,
    },
    {
      label: `Detailed Findings`,
      href: `/research/${researchId}/findings`,
      icon: Layers,
    },
    {
      label: "Evidence Explorer",
      href: `/research/${researchId}/evidence`,
      icon: Network,
    },
    {
      label: "Verification Checklist",
      href: `/research/${researchId}/checklist`,
      icon: CheckSquare,
    },
    {
      label: `Sources (${sourcesCount})`,
      href: `/research/${researchId}/sources`,
      icon: Globe,
    },
    {
      label: "Notes",
      href: `/research/${researchId}/report#notes`,
      icon: StickyNote,
    },
  ];

  return (
    <div className="border-b border-slate-200/80 bg-white px-8">
      <div className="flex space-x-8 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 py-3.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? "border-blue-600 text-blue-600 font-semibold"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${
                  isActive ? "text-blue-600" : "text-slate-400"
                }`}
              />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
