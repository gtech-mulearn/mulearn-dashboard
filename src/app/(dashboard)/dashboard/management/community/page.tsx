import {
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  type LucideIcon,
  MapPin,
  Megaphone,
  Users,
  Wrench,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Community Settings | Management",
  description:
    "Configure interest groups, college levels, locations, channels, and integrations.",
};

interface CommunityItem {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  iconBg: string;
}

const COMMUNITY_ITEMS: CommunityItem[] = [
  {
    title: "Interest Groups",
    description: "Manage user interest groups and categories.",
    href: "/dashboard/management/manage-interest-groups",
    icon: Users,
    iconBg: "bg-warning/15 text-warning",
  },
  {
    title: "College Levels",
    description: "Manage educational levels and institutions.",
    href: "/dashboard/management/college-levels",
    icon: GraduationCap,
    iconBg: "bg-success/15 text-success",
  },
  {
    title: "Locations",
    description: "Manage geographical locations for events and users.",
    href: "/dashboard/management/manage-locations",
    icon: MapPin,
    iconBg: "bg-brand-blue/15 text-brand-blue",
  },
  {
    title: "Channels",
    description: "Configure communication channels.",
    href: "/dashboard/management/channels",
    icon: Megaphone,
    iconBg: "bg-brand-purple/15 text-brand-purple",
  },
  {
    title: "Discord Moderation",
    description: "Moderate and manage Discord integration.",
    href: "/dashboard/management/discord-moderation",
    icon: Wrench,
    iconBg: "bg-destructive/15 text-destructive",
  },
];

export default async function CommunitySettingsPage() {
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
            Community Settings
          </h1>
          <p className="mt-1 text-muted-foreground">
            Configure interest groups, college levels, locations, channels, and
            integrations.
          </p>
        </div>
      </div>

      {/* Grid of Sub-Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {COMMUNITY_ITEMS.map((card) => (
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
