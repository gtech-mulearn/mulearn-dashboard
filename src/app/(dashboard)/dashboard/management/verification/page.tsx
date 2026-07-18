import {
  Briefcase,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  GraduationCap,
  type LucideIcon,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Verification Portal | Management",
  description: "Centralized panel for all pending approvals & verifications.",
};

interface VerificationItem {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  iconBg: string;
}

const VERIFICATION_ITEMS: VerificationItem[] = [
  {
    title: "Role Verification",
    description: "Verify and assign roles to users.",
    href: "/dashboard/management/role-verification",
    icon: ShieldCheck,
    iconBg: "bg-warning/15 text-warning",
  },
  {
    title: "Session Verification",
    description: "Approve or reject mentor-submitted sessions.",
    href: "/dashboard/management/session-verification",
    icon: CalendarCheck,
    iconBg: "bg-success/15 text-success",
  },
  {
    title: "Task Verification",
    description: "Review, approve, and verify pending tasks.",
    href: "/dashboard/management/tasks/task-verification",
    icon: ClipboardCheck,
    iconBg: "bg-brand-blue/15 text-brand-blue",
  },
  {
    title: "Organization Verification",
    description: "Verify legitimacy of registered organizations.",
    href: "/dashboard/management/organizations/verify",
    icon: GraduationCap,
    iconBg: "bg-brand-purple/15 text-brand-purple",
  },
  {
    title: "Company Verification",
    description: "Review and verify company registration requests.",
    href: "/dashboard/management/manage-companies",
    icon: Briefcase,
    iconBg: "bg-destructive/15 text-destructive",
  },
  {
    title: "Mentor Verification",
    description: "Review and verify mentor applications.",
    href: "/dashboard/management/mentor-verification",
    icon: UserCheck,
    iconBg: "bg-slate-500/15 text-slate-600 dark:text-slate-400",
  },
];

export default async function VerificationPortalPage() {
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
            Verification Portal
          </h1>
          <p className="mt-1 text-muted-foreground">
            Centralized panel for all pending approvals & verifications.
          </p>
        </div>
      </div>

      {/* Grid of Sub-Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {VERIFICATION_ITEMS.map((card) => (
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
