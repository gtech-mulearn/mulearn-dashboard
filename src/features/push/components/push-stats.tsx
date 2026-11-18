"use client";

import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePushStats } from "../hooks";
import { RULE_NAMES } from "../rule-names";
import { groupPushStats, groupVariantStats } from "../stats";

const SKIP_LABELS: Record<string, string> = {
  skipped_pref: "turned off",
  skipped_quiet: "quiet hours",
  skipped_cap: "daily limit",
  skipped_cooldown: "cooldown",
  skipped_disabled: "paused",
  no_device: "no phone",
};

export function PushStatsView() {
  const { data, isLoading } = usePushStats(14);
  if (isLoading || !data) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }
  const lines = groupPushStats(data.rows);
  const versions = groupVariantStats(data.variants ?? []);
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Last {data.days} days · {data.devices.users.toLocaleString()} people on{" "}
        {data.devices.devices.toLocaleString()} phones can receive pushes.
      </p>
      {lines.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No pushes in this period yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kind</TableHead>
                <TableHead className="text-right">Sent</TableHead>
                <TableHead className="text-right">Opened</TableHead>
                <TableHead>Not sent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((l) => (
                <TableRow key={`${l.source}:${l.kind}`}>
                  <TableCell>
                    <p className="font-medium">{l.kind}</p>
                    <p className="text-xs text-muted-foreground">{l.source}</p>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {l.sent.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {l.sent ? `${Math.round((100 * l.opened) / l.sent)}%` : "–"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {[
                      ...Object.entries(l.skipped).map(
                        ([s, n]) => `${n} ${SKIP_LABELS[s] ?? s}`,
                      ),
                      ...(l.failed ? [`${l.failed} failed`] : []),
                    ].join(" · ") || "–"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {versions.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Versions</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead className="text-right">Sent</TableHead>
                  <TableHead className="text-right">Opened</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {versions.map((v) => (
                  <TableRow key={`${v.group}:${v.key}`}>
                    <TableCell className="font-medium">
                      {RULE_NAMES[v.group]?.name ?? v.group}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{v.key}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {v.sent.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {v.sent
                        ? `${v.opened.toLocaleString()} opened · ${Math.round(v.rate * 100)}%`
                        : "–"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
