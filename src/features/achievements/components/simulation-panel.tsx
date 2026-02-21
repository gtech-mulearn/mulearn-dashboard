"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { SimulationResult } from "../schemas";
import { useSimulation } from "../hooks/use-achievements";
import { debugAchievement } from "../api";

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
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

  return (
    <div
      className="rounded-lg border p-4 space-y-3"
      data-testid={`sim-result-${result.achievement_id}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium text-sm">{result.achievement_name}</span>
        <div className="flex items-center gap-2">
          {result.eligible ? (
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Eligible
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              Not Eligible
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {result.progress}%
          </span>
        </div>
      </div>
      <ProgressBar value={result.progress} />
      {result.reason && (
        <p className="text-xs text-muted-foreground">{result.reason}</p>
      )}
    </div>
  );
}

export function SimulationPanel() {
  const [muid, setMuid] = React.useState("");
  const [activeMuid, setActiveMuid] = React.useState("");

  const {
    data: results = [],
    isLoading,
    isFetching,
  } = useSimulation(activeMuid);

  const handleSimulate = () => {
    if (muid.trim()) setActiveMuid(muid.trim());
  };

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

      <div className="flex gap-2 max-w-sm">
        <Input
          placeholder="Enter MUID..."
          value={muid}
          onChange={(e) => setMuid(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSimulate()}
          data-testid="simulation-muid-input"
        />
        <Button
          onClick={handleSimulate}
          disabled={!muid.trim() || isLoading || isFetching}
          data-testid="simulation-run-btn"
        >
          {isLoading || isFetching ? "Running..." : "Simulate"}
        </Button>
      </div>

      {activeMuid && (
        <>
          <Separator />
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              Results for{" "}
              <span className="text-foreground font-semibold">
                {activeMuid}
              </span>{" "}
              — {results.length} achievement{results.length !== 1 ? "s" : ""}
            </p>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: Skeletons are static
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))
            ) : results.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No simulation results found.
              </p>
            ) : (
              results.map((result) => (
                <SimulationResultRow
                  key={result.achievement_id}
                  result={result}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
