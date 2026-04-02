import { ArrowUpRight, MapPin, Trophy, Users } from "lucide-react";
import Link from "next/link";
import type { CampusSearchResult } from "../schemas";

interface CampusSearchCardProps {
  campus: CampusSearchResult;
}

export function CampusSearchCard({ campus }: CampusSearchCardProps) {
  return (
    <Link
      href={`/dashboard/campus/${campus.id}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-border/50 bg-card shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-primary"
    >
      {/* Background Neon Splash for Campus */}
      <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl transition-all duration-700 group-hover:scale-150 group-hover:bg-primary/20" />

      <div className="relative z-10 flex h-full flex-col p-6">
        {/* Top Header: Title and Rank Badge */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col">
            <h3 className="font-display text-2xl font-bold leading-tight text-foreground transition-colors group-hover:text-primary line-clamp-2 min-h-[60px]">
              {campus.title}
            </h3>
            <p className="mt-1 font-mono text-xs font-semibold tracking-widest text-muted-foreground">
              {campus.code}
            </p>
          </div>

          {campus.rank && (
            <div className="flex shrink-0 flex-col items-end">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/80">
                Rank
              </span>
              <div className="mt-1 flex items-center gap-1.5 rounded-full bg-background px-3 py-1 ring-1 ring-border shadow-sm transition-colors group-hover:ring-primary/30">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="font-display font-bold text-foreground">
                  #{campus.rank}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Info Tags */}
        <div className="mt-8 flex-grow">
          <div className="flex flex-wrap gap-2">
            {(campus.zone || campus.district) && (
              <span className="flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1.5 text-xs font-semibold text-muted-foreground ring-1 ring-border/50 transition-all duration-300 group-hover:bg-primary/10 group-hover:text-primary group-hover:ring-primary/30">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate max-w-[200px]">
                  {[campus.district, campus.zone].filter(Boolean).join(", ")}
                </span>
              </span>
            )}

            <span className="flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1.5 text-xs font-semibold text-muted-foreground ring-1 ring-border/50 transition-all duration-300 group-hover:bg-primary/10 group-hover:text-primary group-hover:ring-primary/30">
              <Users className="h-3.5 w-3.5" />
              <span>{campus.member_count.toLocaleString()} Members</span>
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-5">
          <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground transition-colors group-hover:text-primary">
            View Campus
          </span>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground shadow-sm transition-all duration-500 group-hover:bg-primary group-hover:text-primary-foreground sm:group-hover:rotate-12">
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
