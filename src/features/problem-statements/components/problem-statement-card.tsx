"use client";

import { Calendar, CheckCircle2, Clock, Users, Zap } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import type { ProblemStatement } from "../types/problem-statement.types";
import { ProblemStatementStatusBadge } from "./problem-statement-status-badge";

interface ProblemStatementCardProps {
  statement: ProblemStatement;
  isManageView?: boolean;
  onView?: (statement: ProblemStatement) => void;
}

function formatDeadline(deadline: string | null): string | null {
  if (!deadline) return null;
  const d = new Date(deadline);
  const now = new Date();
  const diff = d.getTime() - now.getTime();

  if (diff < 0) return "Deadline passed";
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Ends today";
  if (days === 1) return "1 day left";
  if (days <= 7) return `${days} days left`;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ProblemStatementCardComponent({
  statement,
  isManageView,
  onView,
}: ProblemStatementCardProps) {
  const router = useRouter();
  const deadlineText = formatDeadline(statement.deadline);
  const isSubmitted = statement.my_interaction === "Submitted";
  const isTrying = statement.my_interaction === "Trying";
  const isOpen = statement.is_open;
  const tryingCount = statement.interaction_counts?.Trying ?? 0;
  const submittedCount = statement.interaction_counts?.Submitted ?? 0;

  const handleClick = () => {
    if (onView) {
      onView(statement);
    } else if (!isManageView) {
      router.push(`/dashboard/problem-statements/${statement.id}`);
    }
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card lc-card-shadow transition-all duration-300 hover:-translate-y-1 lc-card-shadow-hover cursor-pointer lc-slide-up">
      {/* Clickable overlay */}
      <button
        type="button"
        className="absolute inset-0 z-20 cursor-pointer"
        onClick={handleClick}
        aria-label={`View ${statement.title}`}
      />

      {/* Gradient header */}
      <div className="relative h-28 w-full overflow-hidden bg-gradient-to-br from-brand-blue/20 via-muted/30 to-purple-500/10 flex-shrink-0">
        {/* Decorative glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-purple-500/5" />

        {/* Status badge (manage view) */}
        {isManageView && (
          <div className="absolute right-3 top-3 z-30 pointer-events-none">
            <ProblemStatementStatusBadge status={statement.status} />
          </div>
        )}

        {/* "Submitted" indicator for learners */}
        {!isManageView && isSubmitted && (
          <div className="absolute left-3 top-3 z-30 pointer-events-none">
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 backdrop-blur-xs">
              <CheckCircle2 className="h-3 w-3" />
              Submitted
            </span>
          </div>
        )}

        {/* "Trying" indicator for learners */}
        {!isManageView && !isSubmitted && isTrying && (
          <div className="absolute left-3 top-3 z-30 pointer-events-none">
            <span className="flex items-center gap-1 rounded-full bg-brand-blue/20 px-2.5 py-0.5 text-[11px] font-semibold text-brand-blue border border-brand-blue/30 backdrop-blur-xs">
              <CheckCircle2 className="h-3 w-3" />
              Trying It
            </span>
          </div>
        )}

        {/* Open/Closed tag */}
        {!isManageView && !isTrying && !isSubmitted && (
          <div className="absolute left-3 top-3 z-30 pointer-events-none">
            {isOpen ? (
              <span className="flex items-center gap-1 rounded-full bg-brand-blue/10 px-2.5 py-0.5 text-[11px] font-medium text-brand-blue border border-brand-blue/20">
                <Zap className="h-3 w-3" />
                Open
              </span>
            ) : (
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground border border-border">
                Closed
              </span>
            )}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/20 to-transparent" />
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Company */}
        <div className="flex items-center gap-2 min-w-0">
          {statement.company.logo ? (
            <Image
              src={statement.company.logo}
              alt={statement.company.name}
              width={18}
              height={18}
              className="rounded-full shrink-0 object-cover"
            />
          ) : (
            <div className="h-[18px] w-[18px] rounded-full bg-muted flex items-center justify-center shrink-0">
              <span className="text-[9px] font-bold text-muted-foreground">
                {statement.company.name[0]?.toUpperCase()}
              </span>
            </div>
          )}
          <span className="text-xs text-muted-foreground truncate">
            {statement.company.name}
          </span>
        </div>

        {/* Title */}
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
          {statement.title}
        </h3>

        {/* Description preview */}
        <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
          {statement.description}
        </p>

        {/* Category + Skills */}
        <div className="flex flex-wrap gap-1.5 pointer-events-none">
          {/* Category */}
          <Badge
            variant="outline"
            className="rounded-full border border-brand-blue/20 bg-brand-blue/8 px-2.5 py-0.5 text-[10px] font-medium text-brand-blue"
          >
            {statement.category}
          </Badge>
          {/* Top 2 skills */}
          {statement.skills.slice(0, 2).map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-muted/80 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground"
            >
              {skill}
            </span>
          ))}
          {statement.skills.length > 2 && (
            <span className="rounded-full bg-muted/80 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              +{statement.skills.length - 2}
            </span>
          )}
        </div>

        {/* Footer: count + deadline */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2 border-t border-border/50">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{tryingCount} trying</span>
            {submittedCount > 0 && (
              <>
                <span className="text-muted-foreground/40">•</span>
                <span>{submittedCount} sub</span>
              </>
            )}
          </span>

          {deadlineText ? (
            <span
              className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${
                isOpen
                  ? "bg-brand-blue/10 text-brand-blue border-brand-blue/20"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              {isOpen ? (
                <Calendar className="h-3 w-3" />
              ) : (
                <Clock className="h-3 w-3" />
              )}
              {deadlineText}
            </span>
          ) : (
            <span className="text-[11px] text-muted-foreground">
              No deadline
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
