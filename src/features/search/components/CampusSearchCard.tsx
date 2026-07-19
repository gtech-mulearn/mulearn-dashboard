import { ArrowUpRight, MapPin, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { pickCardGradient } from "@/lib/card-gradients";
import type { CampusSearchResult } from "../schemas";

interface CampusSearchCardProps {
  campus: CampusSearchResult;
}

export function CampusSearchCard({ campus }: CampusSearchCardProps) {
  const firstLetter = campus.title.charAt(0).toUpperCase();
  const location = [campus.district, campus.zone].filter(Boolean).join(", ");

  // Same pastel palette as the learner/mentor cards, keyed off a stable seed.
  const seed = campus.code || campus.id?.toString() || campus.title;
  const gradient = pickCardGradient(seed);

  return (
    <Link
      href={`/dashboard/campus/${campus.id}`}
      className="group block rounded-[2rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <Card className="relative aspect-8/5 w-full gap-0 overflow-hidden rounded-[2rem] border-0 p-0 shadow-sm ring-1 ring-black/5 transition-all duration-500 group-hover:-translate-y-1.5 group-hover:shadow-2xl group-hover:shadow-black/25 motion-reduce:transform-none motion-reduce:transition-none">
        {/* Hero: vivid gradient with a large monogram watermark */}
        <div className={`absolute inset-0 bg-linear-to-br ${gradient}`}>
          <span className="absolute -bottom-6 -right-2 select-none text-[12rem] font-black leading-none text-black/6">
            {firstLetter}
          </span>
        </div>

        {/* Soft light blob for depth, echoes the original neon splash */}
        {/* <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/25 blur-3xl transition-all duration-700 group-hover:scale-150" /> */}

        {/* <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-linear-to-t from-black/70 via-black/25 to-transparent" /> */}

        {/* Top: title + rank badge */}
        <CardHeader className="absolute inset-x-0 top-0 z-10 flex flex-row items-start justify-between gap-3 p-4">
          <CardTitle className="font-display line-clamp-2 text-2xl font-bold leading-tight text-slate-900 [text-wrap:balance]">
            {campus.title}
          </CardTitle>
          {campus.rank && (
            <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/60 bg-white/45 px-3 py-1 backdrop-blur-md transition-colors group-hover:border-white/80">
              <Trophy className="h-3.5 w-3.5 text-amber-500" />
              <span className="font-display text-sm font-bold text-slate-800">
                #{campus.rank}
              </span>
            </div>
          )}
        </CardHeader>

        {/* Bottom: info chips + glassmorphic detail bar */}
        <CardFooter className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-stretch gap-2.5 p-3">
          <div className="flex flex-wrap gap-1.5 px-1">
            {location && (
              <span className="flex items-center gap-1.5 rounded-full border border-white/60 bg-white/45 px-2.5 py-1 text-[11px] font-semibold text-slate-700 backdrop-blur-md">
                <MapPin className="h-3 w-3" />
                <span className="max-w-[160px] truncate">{location}</span>
              </span>
            )}
            <span className="flex items-center gap-1.5 rounded-full border border-white/60 bg-white/45 px-2.5 py-1 text-[11px] font-semibold text-slate-700 backdrop-blur-md">
              <Users className="h-3 w-3" />
              {campus.member_count.toLocaleString()} Members
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-[1.4rem] border border-white/60 bg-white/45 p-2.5 shadow-lg ring-1 ring-black/5 backdrop-blur-xl">
            <div className="flex min-w-0 items-center gap-2.5 pl-1">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/70 text-sm font-black text-slate-800 ring-1 ring-white/60">
                {firstLetter}
              </div>
              <span className="truncate font-mono text-xs font-semibold tracking-wide text-slate-700">
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
