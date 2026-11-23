import type { PushStatsRow } from "./types";

export type PushStatsLine = {
  source: string;
  kind: string;
  sent: number;
  opened: number;
  failed: number;
  skipped: Record<string, number>;
};

/** Collapse per-status rows into one line per source and kind. */
export function groupPushStats(rows: PushStatsRow[]): PushStatsLine[] {
  const map = new Map<string, PushStatsLine>();
  for (const r of rows) {
    const id = `${r.source}:${r.kind}`;
    const line: PushStatsLine = map.get(id) ?? {
      source: r.source,
      kind: r.kind,
      sent: 0,
      opened: 0,
      failed: 0,
      skipped: {},
    };
    if (r.status === "sent") {
      line.sent += r.n;
      line.opened += r.opened;
    } else if (r.status === "failed") {
      line.failed += r.n;
    } else {
      line.skipped[r.status] = (line.skipped[r.status] ?? 0) + r.n;
    }
    map.set(id, line);
  }
  return [...map.values()].sort((a, b) => b.sent - a.sent);
}
