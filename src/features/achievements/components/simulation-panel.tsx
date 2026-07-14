"use client";

import { FlaskConical, Loader2, Search, X } from "lucide-react";
import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearch } from "@/hooks/use-search";
import { debugAchievement } from "../api";
import { useSimulation } from "../hooks/use-achievements";
import type { SimulationResult } from "../schemas";

type SimStatus = "eligible" | "claimed" | "in-progress" | "locked";

function getSimStatus(result: SimulationResult): SimStatus {
  if (result.eligible) return "eligible";
  const reasonLower = result.reason?.toLowerCase() ?? "";
  if (reasonLower.includes("already claimed")) return "claimed";
  const pct = result.progress?.percentage ?? 0;
  if (result.progress && pct > 0) return "in-progress";
  return "locked";
}

const SIM_STATUS_CONFIG: Record<
  SimStatus,
  { label: string; badgeClass: string; barClass: string }
> = {
  eligible: {
    label: "Eligible",
    badgeClass: "bg-success/10 text-success border-success/20",
    barClass: "bg-success",
  },
  claimed: {
    label: "Claimed",
    badgeClass: "bg-brand-blue/10 text-brand-blue border-brand-blue/20",
    barClass: "bg-brand-blue",
  },
  "in-progress": {
    label: "In Progress",
    badgeClass: "bg-warning/10 text-warning border-warning/20",
    barClass: "bg-warning",
  },
  locked: {
    label: "Not Eligible",
    badgeClass: "",
    barClass: "bg-muted-foreground/30",
  },
};

function ProgressBar({ value, barClass }: { value: number; barClass: string }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted/70">
      <div
        className={`h-full rounded-full transition-all duration-500 ease-out ${barClass}`}
        style={{ width: `${clamped}%` }}
        data-testid="progress-bar"
      />
    </div>
  );
}

function SimulationResultRow({ result }: { result: SimulationResult }) {
  const [_expanded, _setExpanded] = React.useState(false);
  const [_debugData, _setDebugData] = React.useState<unknown>(null);
  const [_loadingDebug, _setLoadingDebug] = React.useState(false);

  const _handleDebug = async (muid: string) => {
    _setLoadingDebug(true);
    try {
      const data = await debugAchievement(muid, result.achievement_id);
      _setDebugData(data);
      _setExpanded(true);
    } finally {
      _setLoadingDebug(false);
    }
  };

  const hasProgress = result.progress !== undefined && result.progress !== null;
  const pct = result.progress?.percentage ?? 0;
  const current = result.progress?.current;
  const required = result.progress?.required;

  const status = getSimStatus(result);
  const config = SIM_STATUS_CONFIG[status];

  return (
    <div
      className="group rounded-2xl border border-border/60 bg-card p-5 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 space-y-3.5"
      data-testid={`sim-result-${result.achievement_id}`}
    >
      <div className="flex items-center justify-between gap-3 min-w-0">
        <span className="font-bold text-sm text-foreground truncate block flex-1">
          {result.achievement_name}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {status === "locked" ? (
            <Badge
              variant="outline"
              className="text-muted-foreground font-medium"
            >
              {config.label}
            </Badge>
          ) : (
            <Badge className={`${config.badgeClass} font-medium`}>
              {config.label}
            </Badge>
          )}
          {hasProgress && (
            <span className="text-xs text-muted-foreground">
              {current !== undefined && required !== undefined
                ? `${current} / ${required}`
                : `${pct}%`}
            </span>
          )}
        </div>
      </div>
      {hasProgress && <ProgressBar value={pct} barClass={config.barClass} />}
      {result.reason && (
        <p className="text-xs text-muted-foreground">{result.reason}</p>
      )}
    </div>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function SimulationPanel() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [selectedUser, setSelectedUser] = React.useState<{
    muid: string;
    name: string;
    profile_pic?: string | null;
  } | null>(null);
  const muid = selectedUser?.muid || "";
  const [activeMuid, setActiveMuid] = React.useState("");

  const {
    results,
    isLoading: isSearching,
    handleSearch,
    clearResults,
  } = useSearch();

  const {
    data: results_sim = [],
    isLoading,
    isFetching,
  } = useSimulation(activeMuid);

  const handleSimulate = React.useCallback(() => {
    if (muid.trim()) setActiveMuid(muid.trim());
  }, [muid]);

  return (
    <div className="space-y-6" data-testid="simulation-panel">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Simulate Achievements
        </h2>
        <p className="text-sm text-muted-foreground">
          Test achievement eligibility for any user by MUID.
        </p>
      </div>

      <div className="flex items-end gap-3 max-w-md">
        <div className="flex-1 space-y-1.5 relative">
          {!selectedUser ? (
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  handleSearch(e.target.value);
                  setOpen(e.target.value.length >= 2);
                }}
                onFocus={() => {
                  if (query.length >= 2) setOpen(true);
                }}
                onBlur={() => setTimeout(() => setOpen(false), 150)}
                placeholder="Search user by MuID"
                className="pl-11 h-11 bg-background/50 border-border/50 font-medium rounded-xl focus-visible:ring-brand-blue transition-all duration-200"
              />
              {open && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-md">
                  {isSearching && (
                    <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                      <Loader2 className="size-3.5 animate-spin" /> Searching…
                    </div>
                  )}
                  {!isSearching && results.length === 0 && (
                    <p className="px-3 py-2 text-sm text-muted-foreground">
                      No users found.
                    </p>
                  )}
                  {!isSearching &&
                    results.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setSelectedUser({
                            muid: user.muid,
                            name: user.full_name,
                            profile_pic: user.profile_pic,
                          });
                          setActiveMuid(user.muid); // Run simulation automatically
                          setQuery("");
                          clearResults();
                          setOpen(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-muted/60 transition-colors"
                      >
                        <Avatar className="size-8 shrink-0">
                          <AvatarImage src={user.profile_pic ?? undefined} />
                          <AvatarFallback>
                            {getInitials(user.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {user.full_name}
                          </p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {user.muid}
                          </p>
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
              <Avatar className="size-9 shrink-0">
                <AvatarImage src={selectedUser.profile_pic ?? undefined} />
                <AvatarFallback>
                  {getInitials(selectedUser.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {selectedUser.name}
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  {selectedUser.muid}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-lg shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                onClick={() => {
                  setSelectedUser(null);
                  setActiveMuid("");
                  setQuery("");
                }}
              >
                <X className="size-4" />
                <span className="sr-only">Clear user selection</span>
              </Button>
            </div>
          )}
        </div>
        {!selectedUser && (
          <Button
            onClick={handleSimulate}
            disabled={!muid.trim() || isLoading || isFetching}
            className="h-11 px-6 rounded-xl"
            data-testid="simulation-run-btn"
          >
            {isLoading || isFetching ? "Running..." : "Simulate"}
          </Button>
        )}
      </div>

      {!activeMuid && (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed rounded-3xl bg-muted/10 space-y-3 mt-6">
          <FlaskConical className="size-12 text-muted-foreground/60" />
          <h3 className="text-lg font-semibold text-foreground">
            Simulate Achievement Eligibility
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Enter a MuID above to check which achievements a user is eligible
            for
          </p>
        </div>
      )}

      {activeMuid && (
        <>
          <Separator />
          <div className="space-y-3">
            {(isLoading || isFetching) && (
              <div className="space-y-2">
                {["s1", "s2", "s3"].map((key) => (
                  <Skeleton key={key} className="h-10 w-full" />
                ))}
              </div>
            )}
            {!isLoading &&
              !isFetching &&
              (!Array.isArray(results_sim) || results_sim.length === 0) && (
                <p className="text-sm text-muted-foreground">
                  No results for this user.
                </p>
              )}
            {!isLoading &&
              !isFetching &&
              Array.isArray(results_sim) &&
              results_sim.map((result) => (
                <SimulationResultRow
                  key={result?.achievement_id ?? Math.random().toString()}
                  result={result}
                />
              ))}
          </div>
        </>
      )}
    </div>
  );
}
