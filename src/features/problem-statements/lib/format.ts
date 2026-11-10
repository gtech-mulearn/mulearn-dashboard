/**
 * Problem Statement formatting helpers
 *
 * 📍 src/features/problem-statements/lib/format.ts
 *
 * Single source for deadline / date copy so every surface (card, table,
 * modal, detail, manage) describes the same statement the same way.
 */

const DAY_MS = 1000 * 60 * 60 * 24;

/** Relative deadline copy: "Ends today", "3 days left", "Mar 4, 2027", "Deadline passed". */
export function formatDeadline(deadline: string | null | undefined): string {
  if (!deadline) return "No deadline";
  const d = new Date(deadline);
  const diff = d.getTime() - Date.now();
  if (diff < 0) return "Deadline passed";
  const days = Math.ceil(diff / DAY_MS);
  if (days <= 1 && d.toDateString() === new Date().toDateString()) {
    return "Ends today";
  }
  if (days === 1) return "1 day left";
  if (days <= 7) return `${days} days left`;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Absolute date + time, e.g. "Nov 10, 2026, 04:30 PM". */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Absolute date only, e.g. "Nov 10, 2026". */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Plain-text preview of a markdown description for cards and table rows,
 * so line-clamped previews don't show raw `##`, `**` or link syntax.
 */
export function markdownToPlainText(markdown: string | null | undefined) {
  if (!markdown) return "";
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, "")
    .replace(/(\*\*|__|~~|\*|_)(.*?)\1/g, "$2")
    .replace(/\s+/g, " ")
    .trim();
}

/** Total learners engaged (trying + submitted). */
export function participantCount(
  counts: Record<string, number> | undefined,
): number {
  return (counts?.Trying ?? 0) + (counts?.Submitted ?? 0);
}

export function pluralize(count: number, singular: string, plural?: string) {
  return `${count} ${count === 1 ? singular : (plural ?? `${singular}s`)}`;
}
