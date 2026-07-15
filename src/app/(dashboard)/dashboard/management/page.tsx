import {
  ArrowRight,
  Building,
  ListTodo,
  type LucideIcon,
  Settings2,
  ShieldCheck,
  Trophy,
  User,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Management",
  description:
    "Manage users, organizations, community settings, and system configurations.",
};

interface ManagementItem {
  icon: LucideIcon;
  title: string;
  description: string;
  path: string;
  color?: string;
}

const MANAGEMENT_ITEMS: ManagementItem[] = [
  {
    icon: User,
    title: "User Management",
    description:
      "Manage users, role permissions, interns, and role verification.",
    path: "/dashboard/management/user-management",
    color: "bg-chart-1/10 text-chart-1",
  },
  {
    icon: ShieldCheck,
    title: "Verification Portal",
    description: "Verify roles, tasks, sessions, orgs, companies, and mentors.",
    path: "/dashboard/management/verification",
    color: "bg-chart-2/10 text-chart-2",
  },
  {
    icon: Trophy,
    title: "Manage Achievements",
    description:
      "Configure achievements, rules, simulation, logs, and manual/bulk operations.",
    path: "/dashboard/management/manage-achievements",
    color: "bg-chart-4/10 text-chart-4",
  },
  {
    icon: ListTodo,
    title: "Task Hub",
    description:
      "Manage task lists, create tasks, types, imports, and verification.",
    path: "/dashboard/management/tasks",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Building,
    title: "Organization Hub",
    description:
      "Manage organizations, affiliations, departments, transfers, and verifications.",
    path: "/dashboard/management/organizations",
    color: "bg-chart-1/10 text-chart-1",
  },
  {
    icon: Users,
    title: "Community Settings",
    description:
      "Configure interest groups, college levels, locations, channels, and Discord moderation.",
    path: "/dashboard/management/community",
    color: "bg-chart-3/10 text-chart-3",
  },
  {
    icon: Settings2,
    title: "System & Configurations",
    description:
      "Manage karma point vouchers, error log reports, and dynamic types.",
    path: "/dashboard/management/system",
    color: "bg-chart-5/10 text-chart-5",
  },
];

export default async function ManagementPage() {
  await requireRole([ROLES.ADMIN]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Management</h1>
        <p className="text-muted-foreground">
          Manage users, organizations, community settings, and system
          configurations.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {MANAGEMENT_ITEMS.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className="group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:ring-2 hover:ring-primary/20"
          >
            <div className="space-y-4">
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-lg transition-colors group-hover:bg-primary group-hover:text-primary-foreground",
                  item.color || "bg-primary/10 text-primary",
                )}
              >
                <item.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold tracking-tight">{item.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
              <span>Open Module</span>
              <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
