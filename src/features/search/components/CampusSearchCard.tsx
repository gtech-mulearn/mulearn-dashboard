import { ArrowUpRight, MapPin, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { CampusSearchResult } from "../schemas";

interface CampusSearchCardProps {
  campus: CampusSearchResult;
}

// Vivid deterministic gradient per campus — the "hero" stands in for the
// photo that user cards have. Stable across renders, distinct per campus.
const GRADIENTS = [
  "from-indigo-500 via-violet-500 to-fuchsia-500",
  "from-sky-500 via-cyan-500 to-teal-500",
  "from-rose-500 via-pink-500 to-orange-400",
  "from-emerald-500 via-teal-500 to-cyan-600",
  "from-violet-600 via-purple-500 to-indigo-500",
  "from-amber-500 via-orange-500 to-rose-500",
];

export function CampusSearchCard({ campus }: CampusSearchCardProps) {
  const firstLetter = campus.title.charAt(0).toUpperCase();
  const location = [campus.district, campus.zone].filter(Boolean).join(", ");

  const seed = campus.code || campus.id?.toString() || campus.title;
  const gradient =
    GRADIENTS[
      Array.from(seed).reduce((sum, c) => sum + c.charCodeAt(0), 0) %
        GRADIENTS.length
    ];

  return (
    <Link
      href={`/dashboard/campus/${campus.id}`}
      className="group block rounded-[2rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <Card className="relative aspect-8/5 w-full gap-0 overflow-hidden rounded-[2rem] border-0 p-0 shadow-sm ring-1 ring-black/5 transition-all duration-500 group-hover:-translate-y-1.5 group-hover:shadow-2xl group-hover:shadow-black/25 motion-reduce:transform-none motion-reduce:transition-none">
        {/* Hero: vivid gradient with a large monogram watermark */}
        <div className={`absolute inset-0 bg-linear-to-br ${gradient}`}>
          <span className="absolute -bottom-6 -right-2 select-none text-[12rem] font-black leading-none text-white/15 drop-shadow-sm">
            {firstLetter}
          </span>
        </div>

        {/* Soft light blob for depth, echoes the original neon splash */}
        <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/25 blur-3xl transition-all duration-700 group-hover:scale-150" />

        {/* Legibility scrims */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-2/5 bg-linear-to-b from-black/45 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-linear-to-t from-black/70 via-black/25 to-transparent" />

        {/* Top: title + rank badge */}
        <CardHeader className="absolute inset-x-0 top-0 z-10 flex flex-row items-start justify-between gap-3 p-4">
          <CardTitle className="font-display line-clamp-2 text-2xl font-bold leading-tight text-white drop-shadow-md [text-wrap:balance]">
            {campus.title}
          </CardTitle>
          {campus.rank && (
            <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 backdrop-blur-md transition-colors group-hover:border-white/40">
              <Trophy className="h-3.5 w-3.5 text-amber-300 drop-shadow" />
              <span className="font-display text-sm font-bold text-white">
                #{campus.rank}
              </span>
            </div>
          )}
        </CardHeader>

        {/* Bottom: info chips + glassmorphic detail bar */}
        <CardFooter className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-stretch gap-2.5 p-3">
          <div className="flex flex-wrap gap-1.5 px-1">
            {location && (
              <span className="flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                <MapPin className="h-3 w-3" />
                <span className="max-w-[160px] truncate">{location}</span>
              </span>
            )}
            <span className="flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
              <Users className="h-3 w-3" />
              {campus.member_count.toLocaleString()} Members
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-[1.4rem] border border-white/25 bg-white/15 p-2.5 shadow-lg ring-1 ring-black/5 backdrop-blur-xl">
            <div className="flex min-w-0 items-center gap-2.5 pl-1">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 text-sm font-black text-white ring-1 ring-white/40">
                {firstLetter}
              </div>
              <span className="truncate font-mono text-xs font-semibold tracking-wide text-white">
                {campus.code}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-slate-900 shadow-sm transition-colors group-hover:bg-white/90">
              View Campus
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none" />
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
