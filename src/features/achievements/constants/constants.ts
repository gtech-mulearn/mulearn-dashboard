// ==========================================
// Constants for Level Options
// ==========================================
export const LEVEL_OPTIONS = [
  { value: "1", label: "Level 1" },
  { value: "2", label: "Level 2" },
  { value: "3", label: "Level 3" },
  { value: "4", label: "Level 4" },
  { value: "5", label: "Level 5" },
  { value: "6", label: "Level 6" },
  { value: "7", label: "Level 7" },
];

// ==========================================
// Constants for IssuedLogsTable
// ==========================================

export const ISSUED_LOGS_PAGE_SIZE = 20;

/** Column headers for the issued-logs manual HTML table */
export const ISSUED_LOGS_HEADERS = [
  "MUID",
  "Issued To",
  "Achievement",
  "Issued By",
  "Issued On",
] as const;

// ==========================================
// Rule Engine Constants (matches API spec §3)
// ==========================================

/** All supported rule type identifiers. */
export const RULE_TYPES = [
  { value: "ig_karma", label: "IG Karma" },
  { value: "skill", label: "Skill" },
  { value: "streak", label: "Streak" },
  { value: "milestone", label: "Milestone" },
  { value: "event", label: "Event" },
  { value: "task_completion", label: "Task Completion" },
] as const;

export type RuleTypeValue = (typeof RULE_TYPES)[number]["value"];

/** Options for the `streak_type` field (streak rule). */
export const STREAK_TYPE_OPTIONS = [
  { value: "daily_task", label: "Daily Task" },
  { value: "daily_login", label: "Daily Login" },
] as const;

/** Options for the `milestone_type` field (milestone rule). */
export const MILESTONE_TYPE_OPTIONS = [
  { value: "total_karma", label: "Total Karma" },
  { value: "total_tasks", label: "Total Tasks" },
] as const;
