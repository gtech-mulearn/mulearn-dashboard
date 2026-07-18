import {
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileSpreadsheet,
  ListTodo,
  type LucideIcon,
  PlusSquare,
  Type,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Task Hub | Management",
  description:
    "Configure task lists, creation, types, bulk imports, and verifications.",
};

interface TaskItem {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  iconBg: string;
}

const TASK_ITEMS: TaskItem[] = [
  {
    title: "Tasks List",
    description: "View, edit, and manage tasks.",
    href: "/dashboard/management/tasks/list",
    icon: ListTodo,
    iconBg: "bg-warning/15 text-warning",
  },
  {
    title: "Task Create",
    description: "Verify and create tasks based on interest groups.",
    href: "/dashboard/management/tasks/create",
    icon: PlusSquare,
    iconBg: "bg-success/15 text-success",
  },
  {
    title: "Task Type",
    description: "Manage Task Types.",
    href: "/dashboard/management/tasks/task-type",
    icon: Type,
    iconBg: "bg-brand-blue/15 text-brand-blue",
  },
  {
    title: "Tasks Bulk Import",
    description: "Bulk-import tasks via CSV.",
    href: "/dashboard/management/tasks/bulk-import",
    icon: FileSpreadsheet,
    iconBg: "bg-brand-purple/15 text-brand-purple",
  },
  {
    title: "Task Verification",
    description: "Review, approve, and verify pending tasks.",
    href: "/dashboard/management/tasks/task-verification",
    icon: ClipboardCheck,
    iconBg: "bg-destructive/15 text-destructive",
  },
];

export default async function TaskHubPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Task Hub</h1>
          <p className="mt-1 text-muted-foreground">
            Configure tasks, templates, verifications, and csv uploads.
          </p>
        </div>
      </div>

      {/* Grid of Sub-Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TASK_ITEMS.map((card) => (
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
