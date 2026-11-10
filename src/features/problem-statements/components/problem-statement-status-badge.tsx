"use client";

/**
 * Problem Statement badges
 *
 * 📍 src/features/problem-statements/components/problem-statement-status-badge.tsx
 *
 * The three status dimensions a statement can show, each mapped onto the
 * shared Badge variants so colours come from design tokens only:
 *  - lifecycle (Draft / Published / Unpublished) — manage views
 *  - availability (Open / Closed)                — derived from `is_open`
 *  - participation (Trying / Submitted)          — the current learner
 */

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_CONFIG } from "../constants/problem-statement.constants";
import type {
  InteractionStatus,
  ProblemStatement,
  ProblemStatementStatus,
} from "../types/problem-statement.types";

/**
 * The badges a card / row shows for a statement.
 * Manage: lifecycle status, plus "Closed" once a published statement's deadline passes.
 * Learner: their participation if any, otherwise Open / Closed.
 */
export function ProblemStatementStatusBadges({
  statement,
  isManageView = false,
  className,
}: {
  statement: ProblemStatement;
  isManageView?: boolean;
  className?: string;
}) {
  if (isManageView) {
    return (
      <span className={cn("flex flex-wrap items-center gap-1.5", className)}>
        <ProblemStatementStatusBadge status={statement.status} />
        {statement.status === "Published" && !statement.is_open && (
          <ProblemStatementAvailabilityBadge isOpen={false} />
        )}
      </span>
    );
  }
  return (
    <span className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {statement.my_interaction ? (
        <ProblemStatementParticipationBadge status={statement.my_interaction} />
      ) : (
        <ProblemStatementAvailabilityBadge isOpen={statement.is_open} />
      )}
    </span>
  );
}

export function ProblemStatementStatusBadge({
  status,
  className,
}: {
  status: ProblemStatementStatus;
  className?: string;
}) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}

export function ProblemStatementAvailabilityBadge({
  isOpen,
  className,
}: {
  isOpen: boolean;
  className?: string;
}) {
  return (
    <Badge variant={isOpen ? "success" : "secondary"} className={className}>
      {isOpen ? "Open" : "Closed"}
    </Badge>
  );
}

export function ProblemStatementParticipationBadge({
  status,
  className,
}: {
  status: InteractionStatus | null | undefined;
  className?: string;
}) {
  if (!status) return null;
  return (
    <Badge
      variant={status === "Submitted" ? "success" : "default"}
      className={className}
    >
      {status}
    </Badge>
  );
}
