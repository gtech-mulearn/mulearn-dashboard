import type {
  TInternTask,
  TInternTaskStatus,
  TLeaderboardRow,
  TManageInternItem,
  TTimesheet,
} from "../types";

// ── Dates (IST) ──────────────────────────────────────────────
// The intern backend works in IST. Never derive a calendar date with
// `toISOString()`, which is UTC and is a day behind between 00:00–05:30 IST.

const IST_DATE_FORMAT = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
});

/** `YYYY-MM-DD` in IST. `offsetDays = -1` gives yesterday. */
export function getISTDateString(offsetDays = 0): string {
  return IST_DATE_FORMAT.format(
    new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000),
  );
}

/** Adds whole days to a `YYYY-MM-DD` string (pure calendar arithmetic). */
export function addDaysToDateString(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * A timesheet can be edited until the end of the second day after its
 * `entry_date` (IST). Timesheets have no approval status.
 */
export function isTimesheetEditable(
  timesheet: Pick<TTimesheet, "entry_date">,
): boolean {
  return getISTDateString() <= addDaysToDateString(timesheet.entry_date, 2);
}

export const TIMESHEET_TASK_STATUS_OPTIONS: Array<{
  value: TInternTaskStatus;
  label: string;
}> = [
  { value: "NOT_STARTED", label: "Not Started" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "WAITING_FOR_REVIEW", label: "Waiting for Review" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "OVERDUE", label: "Overdue" },
];

export function formatTaskStatus(status: string): string {
  return (
    TIMESHEET_TASK_STATUS_OPTIONS.find((o) => o.value === status)?.label ??
    status.replaceAll("_", " ")
  );
}

export type TResolvedInternStatus =
  | "ACTIVE"
  | "AT_RISK"
  | "ON_LEAVE"
  | "INACTIVE";

type UnknownRecord = Record<string, unknown>;

const TASK_COMPLEXITY_KARMA: Record<TInternTask["complexity"], number> = {
  LOW: 50,
  MEDIUM: 70,
  HIGH: 90,
  CRITICAL: 130,
};

function normalizeString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  return normalized ? normalized.toUpperCase() : undefined;
}

function getRecordString(
  record: UnknownRecord,
  ...keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = normalizeString(record[key]);
    if (value) {
      return value;
    }
  }

  return undefined;
}

function getRecordBoolean(
  record: UnknownRecord,
  ...keys: string[]
): boolean | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") {
      return value;
    }
  }

  return undefined;
}

function getRecordNumber(
  record: UnknownRecord,
  ...keys: string[]
): number | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }

  return undefined;
}

function normalizeComparable(value: string | undefined): string | undefined {
  return value?.trim().toLowerCase();
}

export function resolveInternStatus(
  intern: Partial<TManageInternItem>,
): TResolvedInternStatus {
  const record = intern as UnknownRecord;
  const directStatus = getRecordString(
    record,
    "display_status",
    "resolved_status",
    "current_status",
    "intern_status",
    "status",
  );

  if (directStatus === "ON_LEAVE") {
    return "ON_LEAVE";
  }

  const leaveFlag = getRecordBoolean(
    record,
    "is_on_leave",
    "on_leave",
    "has_active_leave",
  );

  const leaveStatus = getRecordString(
    record,
    "active_leave_status",
    "current_leave_status",
    "leave_status",
  );

  if (leaveFlag || leaveStatus === "APPROVED") {
    return "ON_LEAVE";
  }

  if (
    directStatus === "ACTIVE" ||
    directStatus === "AT_RISK" ||
    directStatus === "INACTIVE"
  ) {
    return directStatus;
  }

  const fallbackStatus = getRecordString(
    record,
    "base_status",
    "previous_status",
    "status_before_leave",
  );

  if (
    fallbackStatus === "ACTIVE" ||
    fallbackStatus === "AT_RISK" ||
    fallbackStatus === "INACTIVE"
  ) {
    return fallbackStatus;
  }

  return "ACTIVE";
}

export function getTaskBaseKarma(task: Partial<TInternTask>): number {
  const record = task as UnknownRecord;
  const explicitKarma = getRecordNumber(
    record,
    "karma",
    "karma_awarded",
    "karma_points",
    "points",
  );

  if (explicitKarma !== undefined) {
    return explicitKarma;
  }

  const complexity = normalizeString(task.complexity) as
    | TInternTask["complexity"]
    | undefined;

  if (!complexity || !(complexity in TASK_COMPLEXITY_KARMA)) {
    return 0;
  }

  return TASK_COMPLEXITY_KARMA[complexity];
}

/** "Frontend (FE)" for a team ref, "—" when none. */
export function formatTeam(team?: { name: string; code: string } | null) {
  return team ? `${team.name} (${team.code})` : "—";
}

export function isCurrentLeaderboardUser(
  row: Partial<TLeaderboardRow>,
  identity: {
    profileId?: string | null;
    muids?: Array<string | null | undefined>;
  },
): boolean {
  const rowUserId = normalizeComparable(
    typeof row.user_id === "string" ? row.user_id : undefined,
  );
  const rowMuid = normalizeComparable(
    typeof row.muid === "string" ? row.muid : undefined,
  );
  const profileId = normalizeComparable(identity.profileId ?? undefined);
  const muids = (identity.muids ?? [])
    .map((muid) => normalizeComparable(muid ?? undefined))
    .filter((muid): muid is string => Boolean(muid));

  if (profileId && rowUserId === profileId) {
    return true;
  }

  if (rowMuid && muids.includes(rowMuid)) {
    return true;
  }

  return false;
}

// ── Monthly review ───────────────────────────────────────────

/** "November 2026" for a review/window `{ year, month }` (month is 1–12). */
export function formatReviewMonth(item: { year: number; month: number }) {
  return new Date(item.year, item.month - 1, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

/** "29 Nov 2026" for a `YYYY-MM-DD` date (no timezone shift). */
export function formatDateOnly(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getComplexityColor(complexity: string): string {
  switch (complexity) {
    case "LOW":
      return "border-success/30 bg-success/5 text-success";
    case "MEDIUM":
      return "border-brand-blue/30 bg-brand-blue/5 text-brand-blue";
    case "HIGH":
      return "border-warning/30 bg-warning/5 text-warning";
    case "CRITICAL":
      return "border-destructive/30 bg-destructive/5 text-destructive";
    default:
      return "border-border/30 bg-muted/50 text-muted-foreground";
  }
}
