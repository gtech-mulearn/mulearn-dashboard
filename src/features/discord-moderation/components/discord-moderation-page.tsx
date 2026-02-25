/**
 * Discord Moderation Page
 *
 * 📍 src/features/discord-moderation/components/discord-moderation-page.tsx
 *
 * Tab-based layout:
 *   • Leaderboard tab — moderator leaderboard table, filtered by the dropdown
 *   • Tasks tab       — pending counts + karma activity log table
 */

"use client";

import { Shield } from "lucide-react";
import { useState } from "react";
import { DataTableErrorBoundary } from "@/components/dashboard/DataTableErrorBoundary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LeaderboardOption } from "../schemas";
import { ModeratorLeaderboard } from "./moderator-leaderboard";
import { PendingCountsCard } from "./pending-counts-card";
import { TaskListTable } from "./task-list-table";

type ActiveTab = "leaderboard" | "tasks";

export default function DiscordModerationPage() {
  return (
    <DataTableErrorBoundary>
      <DiscordModerationContent />
    </DataTableErrorBoundary>
  );
}

function DiscordModerationContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("leaderboard");
  const [option, setOption] = useState<LeaderboardOption>("peer");

  return (
    <Card className="overflow-visible border-0 bg-transparent shadow-none rounded-none">
      {/* ── Page Header ── */}
      <CardHeader className="px-0 py-0 sm:px-0 sm:py-0">
        <div className="flex flex-col gap-2">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/6 px-3 py-1 text-xs font-semibold text-primary">
            <Shield className="size-3.5" />
            System Management
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Discord Moderation
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="bg-transparent p-0 mt-6 space-y-6">
        {/* ── Controls row: dropdown + tabs ── */}
        <div className="flex items-center gap-3">
          {/* Peer / Appraiser dropdown — only relevant while on leaderboard tab */}
          <Select
            value={option}
            onValueChange={(v) => setOption(v as LeaderboardOption)}
          >
            <SelectTrigger className="w-36 rounded-xl text-sm" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="peer">Peer</SelectItem>
              <SelectItem value="appraiser">Appraiser</SelectItem>
            </SelectContent>
          </Select>

          {/* Leaderboard / Tasks tab buttons */}
          <div className="flex rounded-xl border border-border overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("leaderboard")}
              className={`rounded-none px-5 h-8 text-sm font-medium transition-colors ${
                activeTab === "leaderboard"
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Leaderboard
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("tasks")}
              className={`rounded-none px-5 h-8 text-sm font-medium border-l border-border transition-colors ${
                activeTab === "tasks"
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Tasks
            </Button>
          </div>
        </div>

        {/* ── Tab content ── */}
        {activeTab === "leaderboard" ? (
          <ModeratorLeaderboard key={option} option={option} />
        ) : (
          <div className="space-y-6">
            <PendingCountsCard />
            <TaskListTable />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
