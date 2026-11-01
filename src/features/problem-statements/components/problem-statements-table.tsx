"use client";

import { Calendar, CheckCircle2, Clock, Eye, Users } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StateDisplay } from "@/components/ui/state-display";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProblemStatement } from "../types/problem-statement.types";
import { ProblemStatementStatusBadge } from "./problem-statement-status-badge";

interface ProblemStatementsTableProps {
  statements: ProblemStatement[];
  onView: (statement: ProblemStatement) => void;
  isManageView?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
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

export function ProblemStatementsTable({
  statements,
  onView,
  isManageView = false,
  emptyTitle,
  emptyDescription,
}: ProblemStatementsTableProps) {
  if (statements.length === 0) {
    return (
      <StateDisplay
        variant="no-results"
        className="rounded-2xl border border-dashed border-border bg-muted/40 py-12"
        title={emptyTitle ?? "No problem statements found"}
        description={
          emptyDescription ??
          "Try adjusting your search terms or filter criteria."
        }
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border/80 bg-muted/40 hover:bg-muted/40">
            <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Problem Statement
            </TableHead>
            <TableHead className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Company
            </TableHead>
            <TableHead className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Category
            </TableHead>
            <TableHead className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Deadline
            </TableHead>
            <TableHead className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">
              Trying
            </TableHead>
            {isManageView && (
              <TableHead className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </TableHead>
            )}
            <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {statements.map((statement) => {
            const deadlineText = formatDeadline(statement.deadline);
            const isOpen = statement.is_open;
            const isSubmitted = statement.my_interaction === "Submitted";
            const isTrying = statement.my_interaction === "Trying";
            const tryingCount = statement.interaction_counts?.Trying ?? 0;
            const submittedCount = statement.interaction_counts?.Submitted ?? 0;

            return (
              <TableRow
                key={statement.id}
                tabIndex={0}
                role="button"
                className="transition-colors hover:bg-muted/30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                onClick={() => onView(statement)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onView(statement);
                  }
                }}
              >
                {/* Title */}
                <TableCell className="px-6 py-4 max-w-xs">
                  <p className="font-semibold text-xs text-foreground line-clamp-2 leading-snug">
                    {statement.title}
                  </p>
                  {!isManageView && isSubmitted && (
                    <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Submitted
                    </span>
                  )}
                  {!isManageView && !isSubmitted && isTrying && (
                    <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-brand-blue">
                      <CheckCircle2 className="h-3 w-3" />
                      Trying It
                    </span>
                  )}
                </TableCell>

                {/* Company */}
                <TableCell className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {statement.company.logo ? (
                      <Image
                        src={statement.company.logo}
                        alt={statement.company.name}
                        width={20}
                        height={20}
                        className="rounded-full shrink-0 object-cover"
                      />
                    ) : (
                      <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <span className="text-[9px] font-bold text-muted-foreground">
                          {statement.company.name[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground max-w-[120px] truncate">
                      {statement.company.name}
                    </span>
                  </div>
                </TableCell>

                {/* Category */}
                <TableCell className="px-4 py-4 whitespace-nowrap">
                  <Badge
                    variant="outline"
                    className="rounded-full border-brand-blue/20 bg-brand-blue/8 text-brand-blue text-[10px] px-2 py-0.5"
                  >
                    {statement.category}
                  </Badge>
                </TableCell>

                {/* Deadline */}
                <TableCell className="px-4 py-4 whitespace-nowrap">
                  {deadlineText ? (
                    <span
                      className={`flex items-center gap-1 text-xs font-medium ${
                        isOpen ? "text-brand-blue" : "text-muted-foreground"
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
                    <span className="text-xs text-muted-foreground">
                      No deadline
                    </span>
                  )}
                </TableCell>

                {/* Trying / Submitted count */}
                <TableCell className="px-4 py-4 whitespace-nowrap text-center">
                  <span className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{tryingCount}</span>
                    {submittedCount > 0 && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        (+{submittedCount})
                      </span>
                    )}
                  </span>
                </TableCell>

                {/* Status (manage view) */}
                {isManageView && (
                  <TableCell className="px-4 py-4 whitespace-nowrap">
                    <ProblemStatementStatusBadge status={statement.status} />
                  </TableCell>
                )}

                {/* Action */}
                <TableCell className="px-6 py-4 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl text-xs gap-1.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(statement);
                    }}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
