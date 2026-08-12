import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { MANAGEMENT_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Homepage | Management",
  description: "Manage content sections shown on the public homepage.",
};

interface HomepageItem {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  iconBg: string;
}

const HOMEPAGE_ITEMS: HomepageItem[] = [
  {
    title: "Career Labs",
    description: "Manage hiring postings shown on the homepage.",
    href: "/dashboard/management/homepage/career-labs",
    icon: Briefcase,
    iconBg: "bg-primary/15 text-primary",
  },
];

export default async function HomepagePage() {
  await requireRole(MANAGEMENT_ROLES);

  return (
    <div className="space-y-8 py-6">
      <div className="space-y-4">
        <Link
          href="/dashboard/management"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Management
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Homepage</h1>
          <p className="mt-1 text-muted-foreground">
            Manage content sections shown on the public homepage.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {HOMEPAGE_ITEMS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-1 hover:ring-inset hover:ring-border"
          >
            <div className="flex flex-1 flex-col gap-3 p-5 pt-6">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.iconBg} transition-transform duration-200 group-hover:scale-105`}
              >
                <card.icon className="h-5 w-5" strokeWidth={1.75} />
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold leading-snug text-foreground">
                  {card.title}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                  {card.description}
                </p>
              </div>

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
