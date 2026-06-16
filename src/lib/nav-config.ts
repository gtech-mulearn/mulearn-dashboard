/**
 * Navigation Configuration
 *
 * 📍 src/lib/nav-config.ts
 *
 * Single source of truth for all sidebar navigation items.
 * Each item declares its visibility rules via `permission` or `roles`.
 * Items without either are visible to all authenticated users.
 *
 * To add a new nav item:
 *   1. Add an entry here with the appropriate section and permission/roles
 *   2. Done — the sidebar picks it up automatically
 */

import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Briefcase,
  Calendar,
  CalendarDays,
  ClipboardCheck,
  FileText,
  Folder,
  Globe,
  GraduationCap,
  Home,
  LayoutDashboard,
  LineChart,
  Link,
  Map as MapIcon,
  MapPin,
  Rocket,
  Search,
  Settings,
  Shield,
  Trophy,
  User,
  UserCheck,
  Users,
} from "lucide-react";
import type { Permission } from "@/lib/auth/permissions";
import {
  CAMPUS_MANAGEMENT_ROLES,
  DISTRICT_ROLES,
  IG_ROLES,
  MANAGEMENT_ROLES,
  ROLES,
  ZONAL_ROLES,
} from "@/lib/auth/roles";

// ─── Types ──────────────────────────────────────────────────

export type NavSection = "main" | "management" | "bottom";

export interface NavItem {
  /** Unique identifier for the item */
  id: string;
  /** Display label */
  title: string;
  /** Route path */
  href: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Section this item belongs to */
  section: NavSection;
  /**
   * Permission key from PERMISSIONS map.
   * If set, item is only visible to users who satisfy this permission.
   */
  permission?: Permission;
  /**
   * Direct role check (fallback when no single permission fits).
   * If set, item is visible to users who have any of these roles.
   */
  roles?: readonly string[];
  /**
   * Dynamic check for roles that can't be expressed as static strings
   * (e.g. "{igCode} IGLead"). Evaluated after `roles` check fails.
   */
  dynamicCheck?: (userRoles: readonly string[]) => boolean;
  /**
   * Optional override for the actual link destination.
   * Use when the link needs query params but active-state matching
   * should use the bare pathname (href).
   */
  linkHref?: string;
}

// ─── Navigation Items ───────────────────────────────────────

export const NAV_ITEMS: readonly NavItem[] = [
  // ── Main Section (all authenticated users) ────────────────
  {
    id: "home",
    title: "Home",
    href: "/dashboard",
    icon: Home,
    section: "main",
  },
  {
    id: "profile",
    title: "Profile",
    href: "/dashboard/profile",
    icon: User,
    section: "main",
  },
  {
    id: "mujourney",
    title: "μJourney",
    href: "/dashboard/mujourney",
    icon: MapIcon,
    section: "main",
    dynamicCheck: (roles) => !roles.some((r) => r === ROLES.COMPANY),
  },
  {
    id: "interest-groups",
    title: "Interest Groups",
    href: "/dashboard/interest-groups",
    icon: Users,
    section: "main",
  },
  {
    id: "learning-circle",
    title: "Learning Circle",
    href: "/dashboard/learning-circle",
    icon: BookOpen,
    section: "main",
    dynamicCheck: (roles) => !roles.some((r) => r === ROLES.COMPANY),
  },
  {
    id: "search",
    title: "Search",
    href: "/dashboard/search",
    icon: Search,
    section: "main",
  },
  {
    id: "projects",
    title: "Projects",
    href: "/dashboard/projects",
    icon: Folder,
    section: "main",
  },
  {
    id: "events",
    title: "Events",
    href: "/dashboard/events",
    icon: Calendar,
    section: "main",
  },
  {
    id: "leaderboard",
    title: "Leaderboard",
    href: "/dashboard/leaderboard",
    icon: Trophy,
    section: "main",
  },
  {
    id: "muverse",
    title: "µVerse",
    href: "/dashboard/muverse",
    icon: Rocket,
    section: "main",
  },
  {
    id: "jobs",
    title: "Jobs",
    href: "/dashboard/jobs",
    icon: Briefcase,
    section: "main",
    dynamicCheck: (roles) =>
      !roles.some((r) => r === ROLES.MENTOR || r === ROLES.COMPANY),
  },
  {
    id: "talent-pool",
    title: "Talent Pool",
    href: "/dashboard/talent-pool",
    icon: UserCheck,
    section: "main",
    dynamicCheck: (roles) =>
      roles.some((r) => r === ROLES.MENTOR || r === ROLES.COMPANY),
  },
  {
    id: "intern-dashboard",
    title: "Intern",
    href: "/dashboard/intern",
    icon: LayoutDashboard,
    section: "main",
    roles: [ROLES.INTERN, ROLES.ADMIN],
  },

  // ── Management Section (role-gated) ───────────────────────

  {
    id: "mentor-sessions",
    title: "Sessions",
    href: "/dashboard/mentor/sessions",
    icon: CalendarDays,
    section: "management",
    roles: [ROLES.MENTOR],
  },

  {
    id: "mentor-task-requests",
    title: "Task Requests",
    href: "/dashboard/mentor/task-requests",
    icon: FileText,
    section: "management",
    roles: [ROLES.MENTOR],
  },
  {
    id: "mentor-mentees",
    title: "Mentees",
    href: "/dashboard/mentor/mentees",
    icon: Users,
    section: "management",
    roles: [ROLES.MENTOR],
  },
  {
    id: "company-jobs",
    title: "Job Management",
    href: "/dashboard/company/jobs",
    icon: Briefcase,
    section: "management",
    roles: [ROLES.COMPANY],
  },
  {
    id: "company-tasks",
    title: "Task Management",
    href: "/dashboard/company/tasks",
    icon: ClipboardCheck,
    section: "management",
    roles: [ROLES.COMPANY],
  },
  {
    id: "company-mentors",
    title: "Mentor Management",
    href: "/dashboard/company/mentors",
    icon: Users,
    section: "management",
    roles: [ROLES.COMPANY],
  },
  {
    id: "company-ig-requests",
    title: "IG Requests",
    href: "/dashboard/company/ig-requests",
    icon: FileText,
    section: "management",
    roles: [ROLES.COMPANY],
  },
  {
    id: "company-analytics",
    title: "Analytics & Performance",
    href: "/dashboard/company/analytics",
    icon: LineChart,
    section: "management",
    roles: [ROLES.COMPANY],
  },
  {
    id: "campus-manage",
    title: "Campus",
    href: "/dashboard/campus/manage",
    icon: LayoutDashboard,
    section: "management",
    roles: CAMPUS_MANAGEMENT_ROLES,
  },
  {
    id: "zonal",
    title: "Zonal",
    href: "/dashboard/zonal",
    icon: Globe,
    section: "management",
    roles: ZONAL_ROLES,
  },
  {
    id: "district",
    title: "District",
    href: "/dashboard/district",
    icon: MapPin,
    section: "management",
    roles: DISTRICT_ROLES,
  },
  {
    id: "interest-groups",
    title: "Interest Groups",
    href: "/dashboard/edit-ig",
    icon: Users,
    section: "management",
    roles: IG_ROLES,
    dynamicCheck: (roles) => roles.some((r) => r.endsWith(" IGLead")),
  },
  {
    id: "mentor-verification",
    title: "Mentor Verification",
    href: "/dashboard/management/mentor-verification",
    icon: UserCheck,
    section: "management",
    roles: MANAGEMENT_ROLES,
  },
  {
    id: "management",
    title: "Management",
    href: "/dashboard/management",
    icon: Shield,
    section: "management",
    roles: MANAGEMENT_ROLES,
  },
  {
    id: "url-shortener",
    title: "Url Shortner",
    href: "/dashboard/url-shortener",
    icon: Link,
    section: "management",
    roles: MANAGEMENT_ROLES,
  },
  {
    id: "event-report",
    title: "Event Report",
    href: "/dashboard/reports",
    icon: LineChart,
    section: "management",
    roles: MANAGEMENT_ROLES,
  },
  {
    id: "manage-events",
    title: "Manage Events",
    href: "/dashboard/manage-events",
    icon: LayoutDashboard,
    section: "management",
    permission: "events:manage",
  },

  // ── Bottom Section (all authenticated users) ──────────────
  {
    id: "settings",
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    section: "bottom",
  },
] as const;
