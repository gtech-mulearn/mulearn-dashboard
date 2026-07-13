"use client";

import { format } from "date-fns";
import { Award, ShieldCheck, Trophy } from "lucide-react";
import * as React from "react";

import ReusableTable from "@/components/dashboard/table/Table";
import THead from "@/components/dashboard/table/Thead";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAchievements } from "../hooks/use-achievements";
import type { Achievement } from "../schemas";
import { AchievementIcon } from "./achievement-icon";

const COLUMN_ORDER = [
  { column: "icon", Label: "", isSortable: false, width: "w-12" },
  { column: "name", Label: "Name", isSortable: true },
  { column: "type", Label: "Type", isSortable: true },
  { column: "level_based", Label: "Level Based", isSortable: false },
  { column: "has_vc", Label: "VC Enabled", isSortable: true },
  { column: "created_at", Label: "Created On", isSortable: true },
];

export function AchievementAnalytics() {
  const { data: achievements = [], isLoading } = useAchievements();
  const [search, setSearch] = React.useState("");

  const [sortConfig, setSortConfig] = React.useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const handleSort = (column: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === column && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key: column, direction });
  };

  const filteredAndSorted = React.useMemo(() => {
    let result = achievements.filter((row) =>
      row.name.toLowerCase().includes(search.toLowerCase()),
    );

    if (sortConfig) {
      result = [...result].sort((a, b) => {
        const aVal = a[sortConfig.key as keyof Achievement];
        const bVal = b[sortConfig.key as keyof Achievement];
        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        if (sortConfig.key === "created_at") {
          const aTime = new Date(aVal as string).getTime();
          const bTime = new Date(bVal as string).getTime();
          return sortConfig.direction === "asc" ? aTime - bTime : bTime - aTime;
        }

        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        if (aStr < bStr) return sortConfig.direction === "asc" ? -1 : 1;
        if (aStr > bStr) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [achievements, search, sortConfig]);

  // Compute stats
  const totalCount = achievements.length;
  const vcCount = achievements.filter((a) => a.has_vc).length;
  const standardCount = totalCount - vcCount;

  const customCellRender = (column: string, row: Record<string, unknown>) => {
    if (column === "icon") {
      return (
        <AchievementIcon
          imageUrl={row.icon as string}
          name={row.name as string}
          size={36}
        />
      );
    }
    if (column === "name") {
      return (
        <span className="font-medium text-foreground">
          {row.name as string}
        </span>
      );
    }
    if (column === "type") {
      const type = (row.type as string) || "General";
      return (
        <Badge variant="outline" className="capitalize">
          {type}
        </Badge>
      );
    }
    if (column === "level_based") {
      const isLevelBased = row.level_based ?? !!row.level_id;
      return isLevelBased ? (
        <Badge variant="secondary">Yes</Badge>
      ) : (
        <Badge variant="outline">No</Badge>
      );
    }
    if (column === "has_vc") {
      return row.has_vc ? (
        <Badge
          variant="outline"
          className="bg-success/10 text-success border-success/20"
        >
          Yes
        </Badge>
      ) : (
        <Badge variant="outline" className="text-muted-foreground">
          No
        </Badge>
      );
    }
    if (column === "created_at") {
      const createdAt = row.created_at;
      if (!createdAt)
        return <span className="text-sm text-muted-foreground">—</span>;
      try {
        return (
          <span className="text-sm text-muted-foreground">
            {format(new Date(createdAt as string), "dd MMM yyyy")}
          </span>
        );
      } catch {
        return <span className="text-sm text-muted-foreground">—</span>;
      }
    }
    return null;
  };

  return (
    <div className="space-y-6" data-testid="achievement-analytics">
      {/* Stats Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Total Achievements */}
        <Card className="overflow-hidden border-border bg-card shadow-xs">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Achievements
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                  {isLoading ? "..." : totalCount}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10 text-warning">
                <Trophy className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* VC Enabled */}
        <Card className="overflow-hidden border-border bg-card shadow-xs">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  VC Enabled
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                  {isLoading ? "..." : vcCount}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success">
                <ShieldCheck className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Standard Achievements */}
        <Card className="overflow-hidden border-border bg-card shadow-xs">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Standard/Classic
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                  {isLoading ? "..." : standardCount}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                <Award className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header & Table section */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-3">
          <h3 className="text-lg font-semibold text-foreground">
            All Achievements
          </h3>
          <div className="flex items-center w-full sm:w-auto">
            <Input
              placeholder="Search achievements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs h-9 bg-background/50"
            />
          </div>
        </div>

        <ReusableTable
          // biome-ignore lint/suspicious/noExplicitAny: third-party types
          rows={filteredAndSorted as any}
          isLoading={isLoading}
          page={1}
          perPage={filteredAndSorted.length || 1}
          columnOrder={COLUMN_ORDER}
          id={["id"]}
          customCellRender={customCellRender}
        >
          <THead
            columnOrder={COLUMN_ORDER}
            onIconClick={handleSort}
            action={false}
          />
          <div />
          <div />
        </ReusableTable>
      </div>
    </div>
  );
}
