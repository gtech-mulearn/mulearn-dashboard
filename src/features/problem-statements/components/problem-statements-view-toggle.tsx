"use client";

import { LayoutGrid, List } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProblemStatementViewMode } from "../types/problem-statement.types";

/** Board / table switch shared by the learner feed and the manage dashboard. */
export function ProblemStatementsViewToggle({
  value,
  onChange,
}: {
  value: ProblemStatementViewMode;
  onChange: (mode: ProblemStatementViewMode) => void;
}) {
  return (
    <Tabs
      value={value}
      onValueChange={(v) => onChange(v as ProblemStatementViewMode)}
    >
      <TabsList aria-label="Layout">
        <TabsTrigger value="board" aria-label="Board view" title="Board view">
          <LayoutGrid />
        </TabsTrigger>
        <TabsTrigger value="table" aria-label="Table view" title="Table view">
          <List />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
