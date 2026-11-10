"use client";

import { Eye } from "lucide-react";
import type { ReactNode } from "react";
import { RowActionButton } from "@/components/dashboard/table/row-action-button";
import { Badge } from "@/components/ui/badge";
import { StateDisplay } from "@/components/ui/state-display";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDeadline, participantCount } from "../lib/format";
import type { ProblemStatement } from "../types/problem-statement.types";
import { ProblemStatementCompany } from "./problem-statement-company";
import { ProblemStatementStatusBadges } from "./problem-statement-status-badge";

interface ProblemStatementsTableProps {
  statements: ProblemStatement[];
  onView: (statement: ProblemStatement) => void;
  isManageView?: boolean;
  emptyTitle: string;
  emptyDescription: string;
  emptyAction?: ReactNode;
}

export function ProblemStatementsTable({
  statements,
  onView,
  isManageView = false,
  emptyTitle,
  emptyDescription,
  emptyAction,
}: ProblemStatementsTableProps) {
  if (statements.length === 0) {
    return (
      <StateDisplay
        variant="no-results"
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Problem statement</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead className="text-right">Participants</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12 pr-4">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {statements.map((statement) => (
            <TableRow
              key={statement.id}
              className="cursor-pointer"
              onClick={() => onView(statement)}
            >
              <TableCell className="max-w-sm pl-4">
                <p className="truncate font-medium text-foreground">
                  {statement.title}
                </p>
                <ProblemStatementCompany
                  company={statement.company}
                  className="mt-1"
                />
              </TableCell>
              <TableCell>
                <Badge>{statement.category}</Badge>
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {formatDeadline(statement.deadline)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {participantCount(statement.interaction_counts)}
              </TableCell>
              <TableCell>
                <ProblemStatementStatusBadges
                  statement={statement}
                  isManageView={isManageView}
                />
              </TableCell>
              <TableCell
                className="pr-4 text-right"
                onClick={(e) => e.stopPropagation()}
              >
                <RowActionButton
                  icon={Eye}
                  label="View details"
                  onClick={() => onView(statement)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
