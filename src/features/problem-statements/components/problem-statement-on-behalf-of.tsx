import { UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  EmbeddedUser,
  ProblemStatement,
} from "../types/problem-statement.types";

/**
 * Learner responses carry no `on_behalf_of`; the same person arrives as
 * `creator` with type "user". Null for company / community / muLearn creators.
 */
export function creatorAsOnBehalfOf(
  creator: ProblemStatement["creator"],
): EmbeddedUser | null {
  if (creator?.type !== "user" || !creator.id || !creator.muid) return null;
  return { id: creator.id, muid: creator.muid, full_name: creator.name };
}

interface ProblemStatementOnBehalfOfProps {
  user: EmbeddedUser | null | undefined;
  className?: string;
}

/**
 * "On behalf of {full_name} ({muid})" — admin-only label for statements an
 * admin drafted for a mentioned user. Renders nothing when nobody is mentioned.
 */
export function ProblemStatementOnBehalfOf({
  user,
  className,
}: ProblemStatementOnBehalfOfProps) {
  if (!user) return null;
  return (
    <span
      className={cn(
        "flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-muted-foreground",
        className,
      )}
    >
      <UserRound className="size-3.5 shrink-0" />
      <span>Curated and supported by</span>
      <span className="break-words font-medium text-foreground">
        {user.full_name}
      </span>
      <span className="break-all font-mono text-xs">({user.muid})</span>
    </span>
  );
}
