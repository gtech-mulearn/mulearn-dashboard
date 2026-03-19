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
          <div className="inline-flex w-fit items-center gap-2 text-base font-semibold text-primary">
            <Shield className="size-5" />
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
          {/* Peer / Appraiser dropdown — only shown on leaderboard tab */}
          {activeTab === "leaderboard" && (
            <Select
              value={option}
              onValueChange={(v) => setOption(v as LeaderboardOption)}
            >
              <SelectTrigger className="w-44 h-10 rounded-xl text-base font-medium cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="peer"
                  className="text-base py-2.5 cursor-pointer"
                >
                  Peer
                </SelectItem>
                <SelectItem
                  value="appraiser"
                  className="text-base py-2.5 cursor-pointer"
                >
                  Appraiser
                </SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Leaderboard / Tasks tab buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("leaderboard")}
              className={`px-3 h-9 text-base font-semibold border-0 bg-transparent shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 hover:bg-transparent ${
                activeTab === "leaderboard"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Leaderboard
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("tasks")}
              className={`px-3 h-9 text-base font-semibold border-0 bg-transparent shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 hover:bg-transparent ${
                activeTab === "tasks"
                  ? "text-foreground"
                  : "text-muted-foreground"
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
