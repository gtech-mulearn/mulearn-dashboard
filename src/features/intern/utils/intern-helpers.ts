import type { TInternTask, TLeaderboardRow, TManageInternItem } from "../types";

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

export function getTaskKarma(task: Partial<TInternTask>): number {
  const record = task as UnknownRecord;
  let complexityScore = getRecordNumber(record, "complexity_score");
  if (complexityScore === undefined) {
    const comp = normalizeString(task.complexity);
    if (comp === "LOW") complexityScore = 1;
    else if (comp === "MEDIUM") complexityScore = 2;
    else if (comp === "HIGH") complexityScore = 3;
    else if (comp === "CRITICAL") complexityScore = 4;
  }

  const baseKarma = getTaskBaseKarma(task);
  if (complexityScore !== undefined) {
    return complexityScore * baseKarma;
  }
  return baseKarma;
}

const CATEGORY_TO_GUILD: Record<string, string> = {
  "Backend API": "Backend Guild",
  "Auth API": "Backend Guild",
  Bot: "Backend Guild",
  Database: "Backend Guild",
  DevOps: "Backend Guild",
  "UI Components": "Frontend Guild",
  "API Integration": "Frontend Guild",
  "Bug Fix": "Frontend Guild",
  Performance: "Frontend Guild",
  Accessibility: "Frontend Guild",
  Wireframes: "Design Guild",
  Prototyping: "Design Guild",
  Branding: "Design Guild",
  Research: "Design Guild",
};

export function getTaskGuild(task: Partial<TInternTask>): string {
  const record = task as UnknownRecord;
  const directGuild = getRecordString(
    record,
    "guild",
    "team",
    "assigned_to_guild",
    "task_guild",
  );
  if (directGuild && directGuild !== "UNASSIGNED") {
    return directGuild;
  }

  // Fallback to mapping from category
  const category = getRecordString(record, "category");
  if (category) {
    if (category in CATEGORY_TO_GUILD) {
      return CATEGORY_TO_GUILD[category];
    }

    // Fuzzy matching
    const lowerCat = category.toLowerCase();
    if (
      lowerCat.includes("backend") ||
      lowerCat.includes("auth") ||
      lowerCat.includes("database") ||
      lowerCat.includes("devops") ||
      lowerCat.includes("bot")
    ) {
      return "Backend Guild";
    }
    if (
      lowerCat.includes("frontend") ||
      lowerCat.includes("ui") ||
      lowerCat.includes("integration") ||
      lowerCat.includes("bug") ||
      lowerCat.includes("performance") ||
      lowerCat.includes("accessibility")
    ) {
      return "Frontend Guild";
    }
    if (
      lowerCat.includes("design") ||
      lowerCat.includes("wireframe") ||
      lowerCat.includes("prototype") ||
      lowerCat.includes("branding") ||
      lowerCat.includes("research")
    ) {
      return "Design Guild";
    }
  }

  return "UNASSIGNED";
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

export function formatTasksAssigned(
  tasksAssigned: Record<string, string> | string | null | undefined,
): string {
  if (!tasksAssigned) return "No tasks assigned.";
  if (typeof tasksAssigned === "object") {
    return Object.values(tasksAssigned)
      .map((title) => `- ${title}`)
      .join("\n");
  }
  return tasksAssigned;
}

export function formatTasksCompleted(
  tasksCompleted:
    | Array<{ title: string; final_status?: string }>
    | string
    | null
    | undefined,
): string {
  if (!tasksCompleted) return "No tasks completed.";
  if (Array.isArray(tasksCompleted)) {
    return tasksCompleted
      .map((t) => `- ${t.title} (${t.final_status || "COMPLETED"})`)
      .join("\n");
  }
  return tasksCompleted;
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
