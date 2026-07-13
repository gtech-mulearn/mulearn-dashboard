"use client";

import {
  ChevronRight,
  FileText,
  FlaskConical,
  GitBranch,
  Send,
  Trophy,
  Upload,
} from "lucide-react";
import Link from "next/link";

const BASE = "/dashboard/management/manage-achievements";

const HUB_CARDS = [
  {
    title: "Achievement List",
    description: "Create, edit, and delete achievements.",
    href: `${BASE}/list`,
    icon: Trophy,
    iconBg: "bg-warning/15 text-warning",
  },
  {
    title: "Rules",
    description: "Define and manage achievement unlock rules.",
    href: `${BASE}/rules`,
    icon: GitBranch,
    iconBg: "bg-success/15 text-success",
  },
  {
    title: "Simulate",
    description: "Test achievement eligibility for any user.",
    href: `${BASE}/simulate`,
    icon: FlaskConical,
    iconBg: "bg-brand-blue/15 text-brand-blue",
  },
  {
    title: "Issue / Revoke",
    description: "Manually issue or revoke achievements for users.",
    href: `${BASE}/issue`,
    icon: Send,
    iconBg: "bg-brand-purple/15 text-brand-purple",
  },
  {
    title: "Bulk Issue",
    description: "Issue achievements in bulk via CSV upload.",
    href: `${BASE}/bulk-issue`,
    icon: Upload,
    iconBg: "bg-destructive/15 text-destructive",
  },
  {
    title: "Logs & Analytics",
    description:
      "View achievement statistics, issuance history, and audit trail.",
    href: `${BASE}/logs`,
    icon: FileText,
    iconBg: "bg-slate-500/15 text-slate-600 dark:text-slate-400",
  },
] as const;

export function AchievementHub() {
  return (
    <div className="space-y-8" data-testid="achievement-hub">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Manage Achievements
        </h1>
        <p className="mt-1 text-muted-foreground">
          Configure achievements, rules, simulation, and issuance.
        </p>
      </div>

      {/* Hub cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {HUB_CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            data-testid={`hub-card-${card.title}`}
            className="group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-1 hover:ring-inset hover:ring-border"
          >
            {/* Card body */}
            <div className="flex flex-1 flex-col gap-3 p-5 pt-6">
              {/* Icon badge */}
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.iconBg} transition-transform duration-200 group-hover:scale-105`}
              >
                <card.icon className="h-5 w-5" strokeWidth={1.75} />
              </div>

              {/* Text */}
              <div className="flex-1">
                <p className="text-sm font-semibold leading-snug text-foreground">
                  {card.title}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                  {card.description}
                </p>
              </div>

              {/* Footer arrow */}
              <div className="flex items-center justify-end">
                <ChevronRight
                  className="h-4 w-4 text-muted-foreground/50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-muted-foreground"
                  strokeWidth={2}
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
