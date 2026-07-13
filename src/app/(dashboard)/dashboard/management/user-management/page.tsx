import {
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldCheck,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "User Management | Management",
  description: "Manage accounts, permissions, interns, and role assignments.",
};

interface UserManagementItem {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  iconBg: string;
}

const USER_MANAGEMENT_ITEMS: UserManagementItem[] = [
  {
    title: "Manage Users",
    description: "Add, edit, and delete user accounts.",
    href: "/dashboard/management/manage-users",
    icon: User,
    iconBg: "bg-warning/15 text-warning",
  },
  {
    title: "Manage Roles",
    description: "Create and configure user role permissions.",
    href: "/dashboard/management/manage-roles",
    icon: Shield,
    iconBg: "bg-success/15 text-success",
  },
  {
    title: "Manage Interns",
    description: "Manage intern accounts.",
    href: "/dashboard/management/manage-interns",
    icon: Users,
    iconBg: "bg-brand-blue/15 text-brand-blue",
  },
  {
    title: "Role Verification",
    description: "Verify and assign roles to users.",
    href: "/dashboard/management/role-verification",
    icon: ShieldCheck,
    iconBg: "bg-brand-purple/15 text-brand-purple",
  },
];

export default async function UserManagementPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="mt-1 text-muted-foreground">
            Manage user accounts, permissions, interns, and verify roles.
          </p>
        </div>
      </div>

      {/* Grid of Sub-Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {USER_MANAGEMENT_ITEMS.map((card) => (
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
