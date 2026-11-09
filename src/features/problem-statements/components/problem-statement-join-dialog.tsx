"use client";

/**
 * @deprecated Joined/application dialog is superseded by the 1-click "I'm Trying It"
 * toggle directly on cards and detail modals per PROBLEM_STATEMENT_API.md.
 */

import type { ProblemStatement } from "../types/problem-statement.types";

interface ProblemStatementJoinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statement?: ProblemStatement | null;
  onSuccess?: () => void;
}

export function ProblemStatementJoinDialog({
  open: _open,
  onOpenChange: _onOpenChange,
  statement: _statement,
  onSuccess: _onSuccess,
}: ProblemStatementJoinDialogProps) {
  return null;
}
