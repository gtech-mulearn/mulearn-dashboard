import type { PushStatsRow, PushVariantStat } from "./types";

export type PushVariantLine = {
  group: string;
  key: string;
  sent: number;
  opened: number;
  rate: number;
};

/** Split "GROUP:key" rows; sort by group, then open rate (best first). */
export function groupVariantStats(rows: PushVariantStat[]): PushVariantLine[] {
  return rows
    .map((r) => {
      const i = r.variant.indexOf(":");
      return {
        group: i < 0 ? r.variant : r.variant.slice(0, i),
        key: i < 0 ? "" : r.variant.slice(i + 1),
        sent: r.sent,
        opened: r.opened,
        rate: r.sent ? r.opened / r.sent : 0,
      };
    })
    .sort((a, b) => a.group.localeCompare(b.group) || b.rate - a.rate);
}

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
