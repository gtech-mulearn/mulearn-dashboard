import {
  Building,
  Building2,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Link as LinkIcon,
  type LucideIcon,
  RefreshCw,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { hasAnyRole } from "@/lib/auth/permissions";
import {
  ADMIN_ROLES,
  FELLOW_MANAGEMENT_ROLES,
  MANAGEMENT_ROLES,
} from "@/lib/auth/roles";
import { requireAuth } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Organization Hub | Management",
  description:
    "Configure profiles, affiliations, departments, transfers, and verifications.",
};

interface OrgItem {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  iconBg: string;
  roles: readonly string[];
}

const ORG_ITEMS: OrgItem[] = [
  {
    title: "Manage Organizations",
    description: "Create and manage organization profiles.",
    href: "/dashboard/management/organizations/list",
    icon: Building,
    iconBg: "bg-warning/15 text-warning",
    roles: ADMIN_ROLES,
  },
  {
    title: "Organization Affiliation",
    description: "Manage user affiliations with organizations.",
    href: "/dashboard/management/organizations/affiliation",
    icon: LinkIcon,
    iconBg: "bg-success/15 text-success",
    roles: MANAGEMENT_ROLES,
  },
  {
    title: "Organization Departments",
    description: "Manage organizational departments and structure.",
    href: "/dashboard/management/organizations/departments",
    icon: Building2,
    iconBg: "bg-brand-blue/15 text-brand-blue",
    roles: FELLOW_MANAGEMENT_ROLES,
  },
  {
    title: "Organization Transfer",
    description: "Handle ownership transfers between organizations.",
    href: "/dashboard/management/organizations/transfer",
    icon: RefreshCw,
    iconBg: "bg-brand-purple/15 text-brand-purple",
    roles: ADMIN_ROLES,
  },
  {
    title: "Organization Verification",
    description: "Verify legitimacy of registered organizations.",
    href: "/dashboard/management/organizations/verify",
    icon: CheckCircle,
    iconBg: "bg-destructive/15 text-destructive",
    roles: FELLOW_MANAGEMENT_ROLES,
  },
];

export default async function OrganizationHubPage() {
  const user = await requireAuth();

  const visibleItems = ORG_ITEMS.filter((item) =>
    hasAnyRole(user.roles, item.roles),
  );

  if (visibleItems.length === 0) {
    redirect("/dashboard/management?unauthorized=true");
  }

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
            Organization Hub
          </h1>
          <p className="mt-1 text-muted-foreground">
            Configure organization profiles, affiliations, departments,
            transfers, and verifications.
          </p>
        </div>
      </div>

      {/* Grid of Sub-Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleItems.map((card) => (
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
