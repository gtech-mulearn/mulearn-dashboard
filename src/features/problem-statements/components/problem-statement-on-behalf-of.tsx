import { UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EmbeddedUser } from "../types/problem-statement.types";

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
      <span>On behalf of</span>
      <span className="break-words font-medium text-foreground">
        {user.full_name}
      </span>
      <span className="break-all font-mono text-xs">({user.muid})</span>
    </span>
  );
}
