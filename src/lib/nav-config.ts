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
  Globe,
  Home,
  LayoutDashboard,
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
  CAMPUS_MANAGEMENT_ROLES,
  DISTRICT_ROLES,
  MANAGEMENT_ROLES,
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
  },
  {
    id: "search",
    title: "Search",
    href: "/dashboard/search",
    icon: Search,
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

  // ── Management Section (role-gated) ───────────────────────
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
    id: "management",
    title: "Management",
    href: "/dashboard/management",
    icon: Shield,
    section: "management",
    roles: MANAGEMENT_ROLES,
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
