import { ArrowUpRight, Briefcase, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
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
      {/* Work intent badges */}
      <div className="absolute right-4 top-4 flex gap-1.5">
        {learner.interested_in_work && (
          <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold app-status-accepted border">
            <Briefcase className="h-2.5 w-2.5" />
            Work
          </span>
        )}
        {learner.interested_in_gig_work && (
          <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold app-status-applied border">
            <Sparkles className="h-2.5 w-2.5" />
            Gig
          </span>
        )}
      </div>

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
          <p className="mt-0.5 text-sm font-bold text-foreground truncate">
            {learner.level.name}
          </p>
        </div>
      </div>

      {/* Location */}
      {learner.district && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          {learner.district}
        </div>
      )}

      {/* Interest groups */}
      {learner.interest_groups.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {learner.interest_groups.slice(0, 3).map((ig) => (
            <Badge
              key={ig.id}
              variant="default"
              className="text-[10px] px-2 py-0.5"
            >
              {ig.name}
            </Badge>
          ))}
          {learner.interest_groups.length > 3 && (
            <Badge variant="outline" className="text-[10px] px-2 py-0.5">
              +{learner.interest_groups.length - 3}
            </Badge>
          )}
        </div>
      )}

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
