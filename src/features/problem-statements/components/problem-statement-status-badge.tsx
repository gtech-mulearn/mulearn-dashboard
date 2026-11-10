"use client";

import { Badge } from "@/components/ui/badge";
import { STATUS_CONFIG } from "../constants/problem-statement.constants";
import type { ProblemStatementStatus } from "../types/problem-statement.types";

interface ProblemStatementStatusBadgeProps {
  status: ProblemStatementStatus;
}

export function ProblemStatementStatusBadge({
  status,
}: ProblemStatementStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge
      variant="outline"
      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${config.className}`}
    >
      {config.label}
    </Badge>
  );
}
