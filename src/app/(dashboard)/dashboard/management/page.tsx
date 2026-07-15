import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Building,
  Building2,
  CalendarCheck,
  CheckCircle,
  GraduationCap,
  Link as LinkIcon,
  ListTodo,
  type LucideIcon,
  MapPin,
  Megaphone,
  PlusSquare,
  RefreshCw,
  Settings2,
  Shield,
  ShieldCheck,
  Ticket,
  Trophy,
  Type,
  Upload,
  User,
  Users,
  Wrench,
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
    title: "Manage Users",
    description: "Add, edit, and delete user accounts.",
    path: "/dashboard/management/manage-users",
    color: "bg-chart-1/10 text-chart-1",
  },
  {
    icon: ShieldCheck,
    title: "Role Verification",
    description: "Verify and assign roles to users.",
    path: "/dashboard/management/role-verification",
    color: "bg-chart-2/10 text-chart-2",
  },
  {
    icon: Shield,
    title: "Manage Roles",
    description: "Create and configure user role permissions.",
    path: "/dashboard/management/manage-roles",
    color: "bg-chart-3/10 text-chart-3",
  },
  {
    icon: Trophy,
    title: "Manage Achievements",
    description: "Create, edit, and configure user achievements.",
    path: "/dashboard/management/manage-achievements",
    color: "bg-chart-4/10 text-chart-4",
  },
  {
    icon: CalendarCheck,
    title: "Session Verification",
    description: "Approve or reject mentor-submitted sessions.",
    path: "/dashboard/management/session-verification",
    color: "bg-chart-3/10 text-chart-3",
  },
  {
    icon: Users,
    title: "Manage Interns",
    description: "Manage intern accounts.",
    path: "/dashboard/management/manage-interns",
    color: "bg-chart-5/10 text-chart-5",
  },
  {
    icon: Briefcase,
    title: "Manage Companies",
    description: "Review and verify company registration requests.",
    path: "/dashboard/management/manage-companies",
    color: "bg-chart-1/10 text-chart-1",
  },
  {
    icon: ListTodo,
    title: "Tasks",
    description: "Manage tasks.",
    path: "/dashboard/management/tasks",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: PlusSquare,
    title: "Task Create",
    description: "Verify and create tasks based on interest groups.",
    path: "/dashboard/management/tasks/create",
    color: "bg-chart-1/10 text-chart-1",
  },
  {
    icon: ShieldCheck,
    title: "Task Verification",
    description: "Review, approve, and verify pending tasks.",
    path: "/dashboard/management/tasks/task-verification",
    color: "bg-chart-2/10 text-chart-2",
  },
  {
    icon: Type,
    title: "Task Type",
    description: "Manage Task Types.",
    path: "/dashboard/management/tasks/task-type",
    color: "bg-chart-2/10 text-chart-2",
  },
  {
    icon: Upload,
    title: "Tasks Bulk Import",
    description: "Bulk-import tasks via CSV.",
    path: "/dashboard/management/tasks/bulk-import",
    color: "bg-chart-3/10 text-chart-3",
  },
  {
    icon: Building,
    title: "Organization",
    description: "Create and manage organization profiles.",
    path: "/dashboard/management/organizations",
    color: "bg-chart-1/10 text-chart-1",
  },
  {
    icon: LinkIcon,
    title: "Organization Affiliation",
    description: "Manage user affiliations with organizations.",
    path: "/dashboard/management/organizations/affiliation",
    color: "bg-chart-4/10 text-chart-4",
  },
  {
    icon: Building2,
    title: "Organization Departments",
    description: "Manage organizational departments and structure.",
    path: "/dashboard/management/organizations/departments",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: RefreshCw,
    title: "Organization Transfer",
    description: "Handle ownership transfers between organizations.",
    path: "/dashboard/management/organizations/transfer",
    color: "bg-chart-5/10 text-chart-5",
  },
  {
    icon: CheckCircle,
    title: "Organization Verification",
    description: "Verify legitimacy of registered organizations.",
    path: "/dashboard/management/organizations/verify",
    color: "bg-chart-2/10 text-chart-2",
  },
  {
    icon: Users,
    title: "Community: Interest Groups",
    description: "Manage user interest groups and categories.",
    path: "/dashboard/management/manage-interest-groups",
    color: "bg-chart-3/10 text-chart-3",
  },
  {
    icon: GraduationCap,
    title: "Community: College Levels",
    description: "Manage educational levels and institutions.",
    path: "/dashboard/management/college-levels",
    color: "bg-chart-5/10 text-chart-5",
  },
  {
    icon: MapPin,
    title: "Community: Locations",
    description: "Manage geographical locations for events and users.",
    path: "/dashboard/management/manage-locations",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Megaphone,
    title: "Community: Channels",
    description: "Configure communication channels.",
    path: "/dashboard/management/channels",
    color: "bg-chart-1/10 text-chart-1",
  },
  {
    icon: Wrench,
    title: "Community: Discord Moderation",
    description: "Moderate and manage Discord integration.",
    path: "/dashboard/management/discord-moderation",
    color: "bg-chart-2/10 text-chart-2",
  },
  {
    icon: Ticket,
    title: "System: Karma Voucher",
    description: "Manage karma point vouchers and distribution.",
    path: "/dashboard/management/karma-voucher",
    color: "bg-chart-3/10 text-chart-3",
  },
  {
    icon: AlertTriangle,
    title: "System: Error Log",
    description: "View and manage system error reports.",
    path: "/dashboard/management/error-log",
    color: "bg-chart-4/10 text-chart-4",
  },
  {
    icon: Settings2,
    title: "System: Dynamic Type",
    description: "Configure dynamic content types.",
    path: "/dashboard/management/dynamic-type",
    color: "bg-chart-5/10 text-chart-5",
  },
  // {
  //   icon: Bell,
  //   title: "Notifications",
  //   description: "Create and manage broadcast notifications for users.",
  //   path: "/dashboard/management/notifications",
  //   color: "bg-chart-1/10 text-chart-1",
  // },
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
