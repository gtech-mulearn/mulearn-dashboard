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
  Calendar,
  Globe,
  GraduationCap,
  Home,
  LayoutDashboard,
  Link,
  Map as MapIcon,
  MapPin,
  Rocket,
  Search,
  Settings,
  Shield,
  Trophy,
  User,
  Users,
} from "lucide-react";
import type { Permission } from "@/lib/auth/permissions";
import {
  ADMIN_ROLES,
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
   * Children items for nested navigation menus.
   */
  children?: NavItem[];
  /**
   * If true, the item is marked as "In Development" and navigation is disabled.
   */
  isUnderConstruction?: boolean;
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
  },
  {
    id: "interest-groups",
    title: "Interest Groups",
    href: "/dashboard/ig",
    icon: Users,
    section: "main",
  },
  {
    id: "learning-circle",
    title: "Learning Circle",
    href: "/dashboard/learning-circle",
    icon: BookOpen,
    section: "main",
  },
  {
    id: "courses",
    title: "Courses",
    href: "/dashboard/courses",
    icon: GraduationCap,
    section: "main",
  },
  {
    id: "search",
    title: "Search",
    href: "/dashboard/search",
    icon: Search,
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
    isUnderConstruction: true,
  },

  // ── Management Section (role-gated) ───────────────────────
  {
    id: "campus-manage",
    title: "Campus",
    icon: LayoutDashboard,
    href: "/dashboard/campus/manage",
    section: "management",
    roles: CAMPUS_MANAGEMENT_ROLES,
  },
  {
    id: "management",
    title: "Management",
    icon: Shield,
    href: "/dashboard/management",
    section: "management",
    roles: [
      ...MANAGEMENT_ROLES,
      ...ZONAL_ROLES,
      ...DISTRICT_ROLES,
      ...IG_ROLES,
    ],
    children: [
      {
        id: "management-dashboard",
        title: "Dashboard",
        href: "/dashboard/management",
        icon: Shield,
        section: "management",
        roles: ADMIN_ROLES,
      },
      {
        id: "zonal",
        title: "Zonal Dashboard",
        href: "/dashboard/zonal",
        icon: Globe,
        section: "management",
        roles: ZONAL_ROLES,
        isUnderConstruction: true,
      },
      {
        id: "district",
        title: "District Dashboard",
        href: "/dashboard/district",
        icon: MapPin,
        section: "management",
        roles: DISTRICT_ROLES,
        isUnderConstruction: true,
      },
      {
        id: "interest-groups-mgmt",
        title: "Interest Groups",
        href: "/dashboard/interest-groups",
        icon: Users,
        section: "management",
        roles: IG_ROLES,
      },
    ],
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
    id: "manage-events",
    title: "Manage Events",
    href: "/dashboard/manage-events",
    icon: LayoutDashboard,
    section: "management",
    roles: [
      ...CAMPUS_MANAGEMENT_ROLES,
      ...DISTRICT_ROLES,
      ROLES.COMPANY,
      ...MANAGEMENT_ROLES,
    ],
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
