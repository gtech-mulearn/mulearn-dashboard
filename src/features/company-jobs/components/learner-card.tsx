"use client";

import {
  ArrowUpRight,
  Briefcase,
  ChevronDown,
  MapPin,
  Sparkles,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useRemoveLearnerFromShortlist,
  useShortlistedLearners,
} from "../hooks";
import type { LearnerProfile } from "../types";
import { ShortlistLearnerDialog } from "./shortlist-learner-dialog";

interface LearnerCardProps {
  learner: LearnerProfile;
}

export function LearnerCard({ learner }: LearnerCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: shortlisted = [] } = useShortlistedLearners();
  const { mutateAsync: removeLearner, isPending: isRemoving } =
    useRemoveLearnerFromShortlist();

  const isShortlisted = shortlisted.some((s) => s.id === learner.id);

  const initials = learner.full_name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <Card className="group flex h-full flex-col p-3 py-4">
        {/* Avatar + name */}
        <div className="flex items-start gap-3 pr-24">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground group-hover:text-primary transition-colors">
              {learner.full_name}
            </p>
            <p className="text-xs text-muted-foreground">{learner.muid}</p>
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
        <div className="mt-3 mb-4 flex-1 space-y-1">
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

        {/* Bottom action row: View Profile (left) | Shortlist (right) */}
        <div className="mt-auto border-t border-border pt-3 flex items-center justify-between gap-2">
          {/* View Profile */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground group/link"
            asChild
          >
            <Link
              href={`/profile/${learner.muid}`}
              target="_blank"
              rel="noreferrer"
            >
              View Profile
              <ArrowUpRight className="h-3 w-3 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
            </Link>
          </Button>

          {/* Shortlist action */}
          {isShortlisted ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 px-2 text-xs font-medium text-primary hover:text-primary/80 hover:bg-primary/10"
                  disabled={isRemoving}
                >
                  <Star className="h-3 w-3 fill-current" />
                  Shortlisted
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  className="text-xs text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                  onClick={() => removeLearner(learner.id)}
                  disabled={isRemoving}
                >
                  {isRemoving ? "Removing…" : "Remove from shortlist"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setIsDialogOpen(true)}
            >
              <Star className="h-3 w-3" />
              Shortlist
            </Button>
          )}
        </div>
      </Card>

      <ShortlistLearnerDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        learnerId={learner.id}
        learnerName={learner.full_name}
      />
    </>
  );
}
