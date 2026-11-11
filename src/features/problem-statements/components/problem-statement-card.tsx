"use client";

import { CalendarClock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  formatDeadline,
  markdownToPlainText,
  participantCount,
  pluralize,
} from "../lib/format";
import type { ProblemStatement } from "../types/problem-statement.types";
import { ProblemStatementCompany } from "./problem-statement-company";
import { ProblemStatementStatusBadges } from "./problem-statement-status-badge";

interface ProblemStatementCardProps {
  statement: ProblemStatement;
  isManageView?: boolean;
  onView: (statement: ProblemStatement) => void;
}

export function ProblemStatementCardComponent({
  statement,
  isManageView = false,
  onView,
}: ProblemStatementCardProps) {
  const participants = participantCount(statement.interaction_counts);
  const extraSkills = statement.skills.length - 2;

  return (
    <button
      type="button"
      onClick={() => onView(statement)}
      className="group flex h-full w-full flex-col rounded-2xl border border-border bg-card p-5 text-left transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="flex w-full items-start justify-between gap-3">
        <ProblemStatementCompany company={statement.company} />
        <ProblemStatementStatusBadges
          statement={statement}
          isManageView={isManageView}
          className="shrink-0"
        />
      </div>

      <h3 className="mt-3 line-clamp-2 text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
        {statement.title}
      </h3>
      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {markdownToPlainText(statement.description)}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <Badge>{statement.category}</Badge>
        {statement.skills.slice(0, 2).map((skill) => (
          <Badge key={skill} variant="secondary">
            {skill}
          </Badge>
        ))}
        {extraSkills > 0 && <Badge variant="secondary">+{extraSkills}</Badge>}
      </div>

      <div className="mt-auto w-full pt-4">
        <div className="flex items-center justify-between gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Users className="size-3.5" />
            {pluralize(participants, "participant")}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarClock className="size-3.5" />
            {formatDeadline(statement.deadline)}
          </span>
        </div>
      </div>
    </button>
  );
}
