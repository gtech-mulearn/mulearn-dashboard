import type { EventLog } from "../types";

export function buildGoogleMapEmbedUrl(mapQuery: string): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=13&output=embed`;
}

export function formatEventTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatEventDateRange(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);

  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();

  const month = start.toLocaleString("en-IN", { month: "short" });

  if (sameMonth) {
    return `${month} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`;
  }

  return `${start.toLocaleString("en-IN", { month: "short", day: "numeric" })} - ${end.toLocaleString("en-IN", { month: "short", day: "numeric" })}, ${sameYear ? start.getFullYear() : `${start.getFullYear()}-${end.getFullYear()}`}`;
}

export function organizerTypeLabel(type?: string): string {
  if (!type) return "";
  return type.replace(/_/g, " ");
}

export function countdownLabel(
  deadline: string | null,
  nowTs: number,
): { label: string; urgent: boolean } | null {
  if (!deadline) return null;
  const target = new Date(deadline).getTime();
  const diff = target - nowTs;
  if (diff <= 0) return { label: "Registration closed", urgent: true };

  const totalMinutes = Math.floor(diff / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return {
      label: `Registration closes in ${days}d ${hours}h ${minutes}m`,
      urgent: days < 3,
    };
  }

  return {
    label: `Registration closes in ${hours}h ${minutes}m`,
    urgent: true,
  };
}

export function historyTimestamp(entry: EventLog): string {
  return entry.timestamp ?? entry.edited_at ?? new Date().toISOString();
}

export function historyAction(entry: EventLog): string {
  if (entry.action) {
    return entry.action.replace(/_/g, " ");
  }
  if (entry.changed_fields) {
    return "edited";
  }
  return "updated";
}

export function historyTarget(entry: EventLog): string | null {
  if (entry.target_name && entry.target_type) {
    return `${entry.target_type.replace(/_/g, " ")} · ${entry.target_name}`;
  }
  if (entry.target_name) {
    return entry.target_name;
  }
  if (entry.target_type) {
    return entry.target_type.replace(/_/g, " ");
  }
  return null;
}
