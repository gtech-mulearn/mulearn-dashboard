import { ArrowUpRight, Briefcase, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { LearnerProfile } from "../types";

interface LearnerCardProps {
  learner: LearnerProfile;
}

export function LearnerCard({ learner }: LearnerCardProps) {
  const initials = learner.full_name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Card className="group relative p-3 py-4">
      {/* Avatar + name */}
      <div className="flex items-start gap-3 pr-24">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground group-hover:text-primary transition-colors">
            {learner.full_name}
          </p>
          <p className="text-xs text-muted-foreground">@{learner.muid}</p>
          {learner.email && (
            <p
              className="text-[10px] text-muted-foreground truncate"
              title={learner.email}
            >
              {learner.email}
            </p>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-muted/50 px-3 py-2">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Karma
          </p>
          <p className="mt-0.5 text-sm font-bold text-foreground">
            {learner.karma.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg bg-muted/50 px-3 py-2">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Level
          </p>
          {learner.level != null ? (
            <p className="mt-0.5 text-sm font-bold text-foreground truncate">
              Level {learner.level}
            </p>
          ) : (
            <p className="mt-0.5 text-sm font-bold text-foreground truncate">
              Not Available
            </p>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="mt-3 space-y-1">
        {learner.college && (
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
            <span className="line-clamp-2" title={learner.college}>
              {learner.college}
            </span>
          </div>
        )}
        {learner.department && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Briefcase className="h-3 w-3 shrink-0" />
            <span className="truncate" title={learner.department}>
              {learner.department}
            </span>
          </div>
        )}
        {learner.graduation_year && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3 shrink-0" />
            Class of {learner.graduation_year}
          </div>
        )}
      </div>

      {/* View profile CTA */}
      <div className="mt-4 border-t border-border pt-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between text-xs text-muted-foreground hover:text-foreground group"
          asChild
        >
          <Link
            href={`/profile/${learner.muid}`}
            target="_blank"
            rel="noreferrer"
          >
            View Profile
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
