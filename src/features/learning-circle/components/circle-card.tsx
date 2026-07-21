/**
 * Circle Card Component
 *
 * 📍 src/features/learning-circle/components/circle-card.tsx
 *
 * Bold widget-style cards with distinct category backgrounds,
 * decorative shapes, and strong visual hierarchy.
 */

"use client";

import {
  BarChart3,
  Blocks,
  Cloud,
  Code2,
  Cpu,
  Database,
  Globe,
  Loader2,
  Palette,
  Plus,
  Shield,
  Smartphone,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useJoinCircle } from "../hooks";
import type { LearningCircle } from "../schemas";

/* ─── Category theme system — bold, visible backgrounds ─── */
// TODO: no semantic token — per-category hex values in CATEGORY_THEMES need design decision

interface CategoryTheme {
  cardBg: string; // gradient for entire card
  pillBg: string; // pill background
  pillText: string;
  accent: string; // raw hex for decorative shapes
  titleHover: string; // hover color for title
  icon: typeof Cloud;
}

const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  cloud: {
    cardBg:
      "from-[#EEF4FF] via-[#F5F8FF] to-[#FAFCFF] dark:from-blue-950/45 dark:via-slate-900/40 dark:to-card/30",
    pillBg: "bg-card/80 dark:bg-white/10 backdrop-blur-sm",
    pillText: "text-[#3B82F6] dark:text-[#60A5FA]",
    accent: "#3B82F6",
    titleHover: "group-hover:text-[#2563EB] dark:group-hover:text-[#60A5FA]",
    icon: Cloud,
  },
  devops: {
    cardBg:
      "from-[#EEF2FF] via-[#F5F3FF] to-[#FAF9FF] dark:from-indigo-950/45 dark:via-slate-900/40 dark:to-card/30",
    pillBg: "bg-card/80 dark:bg-white/10 backdrop-blur-sm",
    pillText: "text-[#6366F1] dark:text-[#818CF8]",
    accent: "#6366F1",
    titleHover: "group-hover:text-[#4F46E5] dark:group-hover:text-[#818CF8]",
    icon: Cloud,
  },
  web: {
    cardBg:
      "from-[#ECFDF5] via-[#F0FFF6] to-[#F9FFFC] dark:from-emerald-950/40 dark:via-slate-900/40 dark:to-card/30",
    pillBg: "bg-card/80 dark:bg-white/10 backdrop-blur-sm",
    pillText: "text-[#059669] dark:text-[#34D399]",
    accent: "#059669",
    titleHover: "group-hover:text-[#047857] dark:group-hover:text-[#34D399]",
    icon: Code2,
  },
  product: {
    cardBg:
      "from-[#F3EEFF] via-[#F8F5FF] to-[#FDFCFF] dark:from-violet-950/45 dark:via-slate-900/40 dark:to-card/30",
    pillBg: "bg-card/80 dark:bg-white/10 backdrop-blur-sm",
    pillText: "text-[#7C3AED] dark:text-[#A78BFA]",
    accent: "#7C3AED",
    titleHover: "group-hover:text-[#6D28D9] dark:group-hover:text-[#A78BFA]",
    icon: BarChart3,
  },
  design: {
    cardBg:
      "from-[#FFF1E6] via-[#FFF8F2] to-[#FFFCF9] dark:from-orange-950/30 dark:via-slate-900/40 dark:to-card/30",
    pillBg: "bg-card/80 dark:bg-white/10 backdrop-blur-sm",
    pillText: "text-[#EA580C] dark:text-[#FB923C]",
    accent: "#EA580C",
    titleHover: "group-hover:text-[#C2410C] dark:group-hover:text-[#FB923C]",
    icon: Palette,
  },
  mobile: {
    cardBg:
      "from-[#E6F7FF] via-[#F0FAFF] to-[#F9FDFF] dark:from-sky-950/45 dark:via-slate-900/40 dark:to-card/30",
    pillBg: "bg-card/80 dark:bg-white/10 backdrop-blur-sm",
    pillText: "text-[#0284C7] dark:text-[#38BDF8]",
    accent: "#0284C7",
    titleHover: "group-hover:text-[#0369A1] dark:group-hover:text-[#38BDF8]",
    icon: Smartphone,
  },
  ai: {
    cardBg:
      "from-[#FDF2F8] via-[#FFF5FA] to-[#FFFAFC] dark:from-pink-950/35 dark:via-slate-900/40 dark:to-card/30",
    pillBg: "bg-card/80 dark:bg-white/10 backdrop-blur-sm",
    pillText: "text-[#DB2777] dark:text-[#F472B6]",
    accent: "#DB2777",
    titleHover: "group-hover:text-[#BE185D] dark:group-hover:text-[#F472B6]",
    icon: Cpu,
  },
  cyber: {
    cardBg:
      "from-[#FEF2F2] via-[#FFF5F5] to-[#FFFAFA] dark:from-red-950/35 dark:via-slate-900/40 dark:to-card/30",
    pillBg: "bg-card/80 dark:bg-white/10 backdrop-blur-sm",
    pillText: "text-[#DC2626] dark:text-[#F87171]",
    accent: "#DC2626",
    titleHover: "group-hover:text-[#B91C1C] dark:group-hover:text-[#F87171]",
    icon: Shield,
  },
  data: {
    cardBg:
      "from-[#FEF9C3] via-[#FFFBEB] to-[#FFFEF5] dark:from-amber-950/30 dark:via-slate-900/40 dark:to-card/30",
    pillBg: "bg-card/80 dark:bg-white/10 backdrop-blur-sm",
    pillText: "text-[#CA8A04] dark:text-[#FBBF24]",
    accent: "#D97706",
    titleHover: "group-hover:text-[#B45309] dark:group-hover:text-[#FBBF24]",
    icon: Database,
  },
  iot: {
    cardBg:
      "from-[#E6FFFA] via-[#F0FFFE] to-[#F9FFFE] dark:from-teal-950/45 dark:via-slate-900/40 dark:to-card/30",
    pillBg: "bg-card/80 dark:bg-white/10 backdrop-blur-sm",
    pillText: "text-[#0D9488] dark:text-[#2DD4BF]",
    accent: "#0D9488",
    titleHover: "group-hover:text-[#0F766E] dark:group-hover:text-[#2DD4BF]",
    icon: Blocks,
  },
};

const DEFAULT_THEME: CategoryTheme = {
  cardBg:
    "from-[#F3F4F6] via-[#F9FAFB] to-[#FEFEFE] dark:from-zinc-900/60 dark:via-zinc-950/40 dark:to-card/30",
  pillBg: "bg-card/80 dark:bg-white/10 backdrop-blur-sm",
  pillText: "text-[#374151] dark:text-[#D4D4D8]",
  accent: "#6B7280",
  titleHover: "group-hover:text-[#4F46E5] dark:group-hover:text-[#818CF8]",
  icon: Globe,
};

function getTheme(ig: string): CategoryTheme {
  const lower = ig.toLowerCase();
  for (const [key, theme] of Object.entries(CATEGORY_THEMES)) {
    if (lower.includes(key)) return theme;
  }
  const themes = Object.values(CATEGORY_THEMES);
  const hash = ig.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return themes[hash % themes.length] ?? DEFAULT_THEME;
}

/* ─── Stacked avatar placeholders ─── */

// TODO: no semantic token — avatar palette colors need design decision; using chart token approximations
const AVATAR_COLORS = [
  "bg-chart-1/30",
  "bg-chart-3/30",
  "bg-chart-2/30",
  "bg-chart-5/30",
  "bg-chart-4/30",
];

function StackedAvatars({ count }: { count: number }) {
  if (count === 0) {
    return (
      <span className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground">
        <Users className="h-3.5 w-3.5" />
        No members
      </span>
    );
  }

  const shown = Math.min(count, 4);
  const overflow = count - shown;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {Array.from({ length: shown }).map((_, i) => (
          <div
            key={`avatar-placeholder-${String.fromCharCode(65 + i)}`}
            className={`relative flex h-7 w-7 items-center justify-center rounded-full border-[2px] border-card text-[10px] font-bold text-foreground shadow-sm ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
            style={{ marginLeft: i > 0 ? "-6px" : "0", zIndex: shown - i }}
          >
            {String.fromCharCode(65 + i)}
          </div>
        ))}
        {overflow > 0 && (
          <div
            className="relative flex h-7 w-7 items-center justify-center rounded-full border-[2px] border-card bg-foreground text-[10px] font-bold text-background shadow-sm"
            style={{ marginLeft: "-6px", zIndex: 0 }}
          >
            +{overflow}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Component ─── */

interface CircleCardProps {
  circle: LearningCircle;
  /**
   * Force-hide the Join button regardless of the circle's `is_joined` /
   * `is_creator` flags. Use this when the card is rendered from a list that
   * is *already* scoped to the current user's own circles (e.g. the "My
   * Circles" filter, backed by the user-circles endpoint) — that endpoint
   * doesn't reliably echo back `is_joined`/`is_creator` per item, so
   * membership must be inferred from which list the card came from instead.
   */
  hideJoin?: boolean;
}

export function CircleCard({ circle, hideJoin = false }: CircleCardProps) {
  const theme = getTheme(circle.ig);
  const CategoryIcon = theme.icon;
  const joinCircle = useJoinCircle();
  const memberCount = circle.total_members || circle.attendees?.length || 0;
  const canJoin = !hideJoin && !circle.is_joined && !circle.is_creator;

  const handleJoin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    joinCircle.mutate(circle.id);
  };

  return (
    <Link href={`/dashboard/learning-circle/${circle.id}`}>
      <div
        className={`group relative overflow-hidden rounded-[22px] bg-gradient-to-br ${theme.cardBg}
          border border-black/[0.04] dark:border-white/[0.08]
          shadow-[0_2px_8px_rgba(0,0,0,0.06),0_0_1px_rgba(0,0,0,0.04)]
          transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]`}
        style={{
          fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
          fontFeatureSettings: "'cv02', 'cv03', 'cv04'",
        }}
      >
        {/* Decorative background shapes */}
        <div
          className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full opacity-[0.07] blur-xl"
          style={{ backgroundColor: theme.accent }}
        />
        <div
          className="pointer-events-none absolute -bottom-4 -left-4 h-20 w-20 rounded-full opacity-[0.05] blur-lg"
          style={{ backgroundColor: theme.accent }}
        />
        {/* Large watermark icon */}
        <div className="pointer-events-none absolute bottom-3 right-3 opacity-[0.04]">
          <CategoryIcon
            className="h-20 w-20"
            style={{ color: theme.accent }}
            strokeWidth={1}
          />
        </div>

        <div className="relative p-5 pb-5">
          {/* Header: Category pill + Join button */}
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold tracking-wide uppercase shadow-sm ${theme.pillBg} ${theme.pillText}`}
            >
              <CategoryIcon className="h-3 w-3" />
              {circle.ig}
            </span>

            {canJoin && (
              <button
                type="button"
                onClick={handleJoin}
                disabled={joinCircle.isPending}
                className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full
                  bg-card/90 dark:bg-muted/40 dark:hover:bg-muted/60 dark:text-foreground
                  backdrop-blur-sm text-muted-foreground shadow-sm
                  border border-border/60
                  transition-all duration-200
                  hover:shadow-md hover:scale-110
                  active:scale-95 disabled:opacity-40"
                title="Join circle"
                aria-label="Join circle"
              >
                {joinCircle.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                )}
              </button>
            )}
          </div>

          {/* Circle name — large, bold */}
          <h4
            className={`mt-5 text-[18px] font-extrabold leading-snug tracking-[-0.02em] text-foreground line-clamp-2 transition-colors duration-200 ${theme.titleHover}`}
          >
            {circle.title}
          </h4>

          {/* Separator — thin colored bar */}
          <div
            className="mt-3 h-[3px] w-10 rounded-full"
            style={{ backgroundColor: theme.accent, opacity: 0.3 }}
          />

          {/* Footer: Organization + member count + Stacked avatars */}
          <div className="mt-4 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="inline-flex min-w-0 items-center truncate rounded-lg bg-card/60 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground shadow-sm backdrop-blur-sm">
                {circle.org || "Open"}
              </span>
              <span
                className="shrink-0 text-[12px] font-bold"
                style={{ color: theme.accent }}
              >
                {memberCount} {memberCount === 1 ? "member" : "members"}
              </span>
            </div>
            <div className="shrink-0">
              <StackedAvatars count={memberCount} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
