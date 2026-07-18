import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
  Settings2,
  Ticket,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "System & Configurations | Management",
  description: "Configure point distribution, system diagnostics, and types.",
};

interface SystemItem {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  iconBg: string;
}

const SYSTEM_ITEMS: SystemItem[] = [
  {
    title: "Karma Voucher",
    description: "Manage karma point vouchers and distribution.",
    href: "/dashboard/management/karma-voucher",
    icon: Ticket,
    iconBg: "bg-warning/15 text-warning",
  },
  {
    title: "Error Log",
    description: "View and manage system error reports.",
    href: "/dashboard/management/error-log",
    icon: AlertTriangle,
    iconBg: "bg-destructive/15 text-destructive",
  },
  {
    title: "Dynamic Type",
    description: "Configure dynamic content types.",
    href: "/dashboard/management/dynamic-type",
    icon: Settings2,
    iconBg: "bg-brand-blue/15 text-brand-blue",
  },
];

export default async function SystemPage() {
  await requireRole([ROLES.ADMIN]);

  return (
    <div className="space-y-8 py-6">
      {/* Breadcrumb Header */}
      <div className="space-y-4">
        <Link
          href="/dashboard/management"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Management
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            System & Configurations
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage point distribution, error reports, and dynamic categories.
          </p>
        </div>
      </div>

      {/* Grid of Sub-Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SYSTEM_ITEMS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-1 hover:ring-inset hover:ring-border"
          >
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
