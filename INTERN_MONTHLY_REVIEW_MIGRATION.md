# Intern Dashboard — Frontend Migration Plan (Phased)

Source specs:
- `Dashboard_Intern_Monthly_Review.md` (replaces weekly review)
- `Dashboard_Intern_Timesheet.md` (daily timesheet, approval removed)

---

## Phase 0 — Context & rules

### What changed

| # | Change | Effect on frontend |
|---|---|---|
| 1 | **Weekly review → Monthly review** | New endpoints and shape. Submission window is the last 2 days of the month plus the first 2 of the next (IST). No hours, streak or late flag. `leave_days` is computed server-side. |
| 2 | **Daily timesheets need no approval** | New status `SUBMITTED`. A timesheet counts as soon as it's submitted. Admin approve/reject is deprecated (always returns 400). `task` is now an array snapshot. |
| 3 | **No score and no streaks in the intern dashboard** | Never show score or streak, and never call `timesheets/summary/`, even though the backend still computes them. |
| 4 | **Leaderboard stays exactly as it is** | Exception to #3: the leaderboard page, overview preview, rank card, leaderboard hooks/types and leaderboard tour steps are **not touched**. |
| 5 | **Meeting minutes removed** | Intern upload and admin view both go. Learning-circle meetings and mentor sessions are unrelated and stay. |

### Phase order

Each phase should leave `bun run typecheck` and `bun run lint` green and be committable on its own.

| Phase | Scope | Risk |
|---|---|---|
| 1 | Remove meeting minutes | Low (pure deletion) |
| 2 | Remove score & streaks (non-leaderboard) | Low |
| 3 | Daily timesheet: align with new backend (data + intern + admin) | Medium |
| 4 | Monthly review: data layer (additive, weekly still present) | Low |
| 5 | Monthly review: intern UI | Medium |
| 6 | Monthly review: admin UI | Medium |
| 7 | Delete weekly review code | Low |
| 8 | Tour, notifications, final verify | Low |

### Global rules

- Any field not listed in the spec is rejected by the backend with `"Unknown field."`. Send only the fields the spec documents.
- Field validation errors come back in `response` keyed by field name. Map them onto react-hook-form with `form.setError`.
- All dates are **IST**. Never derive a date with `toISOString()`.
- Sorting: send `sortBy=field` / `sortBy=-field` (descending) only. **Never send `sortOrder`.**

---

## Phase 1 — Remove meeting minutes

**Goal:** the guild minutes feature is fully gone.

### 1.1 Delete routes

| Path | Action |
|---|---|
| `src/app/(dashboard)/dashboard/intern/minutes/` (`page.tsx`) | Delete folder |
| `src/app/(dashboard)/dashboard/management/manage-interns/minutes/` (`page.tsx`, `manage-minutes-client.tsx`) | Delete folder |

### 1.2 Endpoints — `src/api/endpoints.ts`

- Remove `intern.minutes` (L1495) and `intern.minuteDetail` (L1496).
- Remove `manageInterns.minutes` (L1521). It pointed at the intern path, which was a bug anyway.

### 1.3 Types

- `src/features/intern/types/api.types.ts`: delete the `// ── Minutes Types` block (L309–329): `TMinuteItem`, `TSubmitMinutePayload`.
- `src/features/intern/types/index.ts` L16, L20: remove those exports.

### 1.4 API

- `src/features/intern/api/intern.api.ts`: remove the imports (L11, L13) and the `// ── Minutes` section (L292–311: `submitMinute`, `updateMinute`, `getMyMinutes`).
- `src/features/intern/api/manage-interns.api.ts`: remove the `TMinuteItem` import (L9) and `getAllMinutes` (L207–215).

### 1.5 Hooks

- `src/features/intern/hooks/use-intern.ts`: remove the `TSubmitMinutePayload` import (L9), `useMyMinutes` (L331), `useSubmitMinute` (L339) and `useUpdateMinute` (L364–385).
- `src/features/intern/hooks/use-manage-interns.ts`: remove `useManageMinutes` (L424–430).
- `src/features/intern/hooks/query-keys.ts`: remove `myMinutes` (L33–34) and `manageMinutes` (L51–52).

### 1.6 Barrel — `src/features/intern/index.ts`

Remove `useMyMinutes` (L34), `useSubmitMinute` (L36), `useUpdateMinute` (L47), `useManageMinutes` (L65) and `TMinuteItem` (L95), plus `TSubmitMinutePayload` if exported.

### 1.7 Links & copy

- `src/features/intern/components/intern-header.tsx` L96–105: remove the **Minutes** button, and the `ScrollText` import if it's unused afterwards.
- `src/app/(dashboard)/dashboard/management/manage-interns/manage-interns-client.tsx` L372–381: remove the **Minutes** button, and the `Crown` import if unused.
- `src/features/intern/components/update-dialog.tsx` L204–208: remove "Intern Lead can upload daily guild minutes." Replace it with "Intern Lead can review monthly reviews." once Phase 6 lands.

### 1.8 Route access — `src/lib/auth/route-access.ts`

- Remove `"/dashboard/intern/minutes"` (L88–90).
- Remove `"/dashboard/management/manage-interns/minutes"` (L143–145).

### 1.9 Tour — `src/features/tour/steps/pages/intern.ts`

- Delete the `/dashboard/intern/minutes` block (L159–195: `intern-minutes-intro`, `-header`, `-upload`, `-search`, `-history`).
- L7 header comment: drop "minutes".
- Check `src/features/tour/steps/` for any admin step pointing at `manage-interns/minutes`.

### ✅ Done when

```bash
grep -rnE "Minute|/minutes|minuteDetail|manageMinutes|myMinutes" \
  src/features/intern src/api/endpoints.ts src/lib/auth/route-access.ts \
  src/features/tour/steps "src/app/(dashboard)/dashboard/intern" \
  "src/app/(dashboard)/dashboard/management/manage-interns"
```
Returns only `minute: "2-digit"` (date-format options). Typecheck and lint pass.

**Commit:** `refactor(intern): remove meeting minutes feature`

---

## Phase 2 — Remove score & streaks (leaderboard excluded)

**Goal:** score and streak appear **only** inside leaderboard UI.

### 2.1 Do NOT touch (leaderboard)

- `src/features/intern/components/leaderboard.tsx` (`EliteLeaders`, used at `intern/intern-client.tsx:11,43`)
- `src/app/(dashboard)/dashboard/intern/leaderboard/*`
- `TLeaderboardRow` (incl. `score`, `daily_streak`), `TLeaderboardMe`
- `useTopLeaderboard`, `useLeaderboard`, `useLeaderboardMe`, leaderboard keys, API and endpoints
- The leaderboard rank card in `intern-stats-cards.tsx` (L164+, L37 copy)
- Leaderboard tour steps (`intern.ts` L53–106) and the "…and the leaderboard" copy (L28)

### 2.2 Overview stats — `src/features/intern/components/intern-stats-cards.tsx`

- Remove `userScore`, `userDailyStreak`, `_userWeeklyStreak`, `userLongestDailyStreak` (L98–101).
- Delete:
  - the **Score** card (L115–132)
  - the **Daily Streak** card, its 30-day bar and "Longest Streak" (L134–162)
  - the **Weekly Streak** block (~L188)
  - the "Log progress daily to keep streak" copy (L212)
- Fill the freed slots with **Total Karma** (`total_intern_karma`), **Completed Tasks** (`completed_tasks`) and **Status** (`status`). A Monthly Review status card gets added in Phase 5.

### 2.3 Daily timesheet page — `intern/timesheet/intern-timesheet-client.tsx`

- Delete the `streak` + `multiplier` logic (L210–214): the 1.2× / 1.5× / 2.0× multipliers don't exist.
- Delete the whole **Streak Bonus** panel (L624–700) and its `data-tour-id="page:intern-timesheet:streak"`.
- Copy:
  - L240 "…maintain your legendary streak." → "Log what you worked on today."
  - L263 "…your streak tomorrow!" → "You can still submit for yesterday until midnight IST."
  - L418 "Quality logs earn streak multipliers" → remove.
- Drop the `useInternOverview` import if it's unused afterwards.
- The calendar stays, as a submission history rather than a streak tracker.

### 2.4 Activity log / detail

- `activity-log.tsx` (L99–100, L118–119) and `activity-log-history.tsx` (L100–101, L121–122): remove `points: ts.score` / `wr.score` and `karma: *.karma_awarded` for timesheets and reviews (set `karma: null`). Remove `points` from `UnifiedActivity`.
- Task rows keep `karma: getTaskBaseKarma(task)`. Task karma is separate from score and stays.
- `activity-detail-dialog.tsx` L292: render the `+{karma} Karma` badge only for tasks.

### 2.5 Types / API / hooks

- `TInternOverviewStatus`: remove `score`, `daily_streak`, `weekly_streak`, `longest_daily_streak`.
- Delete `TTimesheetSummary`, `internApi.getTimesheetSummary`, `useTimesheetSummary`, `internKeys.timesheetSummary` and `endpoints.intern.timesheetSummary`, and update the barrel exports.

### 2.6 Admin hook toasts — `use-manage-interns.ts`

- L352–353 ("streak & score updated!" / "streak reset to 0!") and L399–400 ("weekly streak updated!" / "streak reset to 0!"): change them to neutral copy for now. Both hooks are deleted in Phases 3 and 7.

### 2.7 Tour — `src/features/tour/steps/pages/intern.ts`

- L43 "Track your karma, streak, and other core metrics" → "Track your karma, tasks, and review status at a glance."
- L237, L245: streak copy → "Log your daily work."
- L262–266: delete the `intern-timesheet-streak` step.

### ✅ Done when

```bash
grep -rnE "score|streak|multiplier" \
  src/features/intern src/features/tour/steps/pages/intern.ts \
  "src/app/(dashboard)/dashboard/intern"
```
The only hits are `complexity_score`, task karma helpers, and leaderboard files and steps.

**Commit:** `refactor(intern): remove score and streak UI outside leaderboard`

---

## Phase 3 — Daily timesheet: align with new backend

**Goal:** timesheets match the new spec: no approval, `SUBMITTED` status, `task[]`, IST dates, today or yesterday.

### 3.1 Types — `api.types.ts`

Rewrite `TTimesheet`:

| Field | Old | New |
|---|---|---|
| `task_id`, `category`, `task_status`, `remark` | flat | **remove** — replaced by `task` |
| `task` | — | `TTimesheetTaskEntry[] \| null` |
| `blockers` | `string` | `string \| null` |
| `status` | `PENDING\|APPROVED\|REJECTED\|CANCELLED` | `SUBMITTED\|APPROVED\|PENDING\|REJECTED` |
| `karma_awarded`, `score` | present | **remove** |
| admin extras | `user_name`, `full_name`, `muid` | `user_id`, `user_name`, `muid` |

```ts
export type TInternTaskStatus =
  | "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"
  | "WAITING_FOR_REVIEW" | "ON_HOLD" | "OVERDUE";

export type TTimesheetStatus = "SUBMITTED" | "APPROVED" | "PENDING" | "REJECTED";

export interface TTimesheetTaskEntry {
  task_id: string;
  title: string;
  status: TInternTaskStatus;
  remark: string | null;
}

export interface TTimesheet {
  id: string;
  entry_date: string;
  task: TTimesheetTaskEntry[] | null;
  description: string;
  hours: string;
  blockers: string | null;
  end_of_day_note: string | null;
  edit_reason: string | null;
  status: TTimesheetStatus;
  review_note: string | null;
  created_at: string;
  user_id?: string;   // admin
  user_name?: string; // admin
  muid?: string;      // admin
}

export interface TTimesheetTaskInput {
  task_id: string;
  status: TInternTaskStatus;
  remark?: string;
}

export interface TTimesheetSubmitPayload {
  entry_date: string;            // today or yesterday, IST
  hours: number;                 // >0, ≤24
  description: string;           // 30–2000
  blockers?: string | null;      // ≤1000
  end_of_day_note?: string | null;
  task?: TTimesheetTaskInput[];
}

export interface TTimesheetUpdatePayload {
  edit_reason: string;           // required, ≤300
  hours?: number;
  description?: string;
  blockers?: string | null;
  end_of_day_note?: string | null;
  task?: TTimesheetTaskInput[];  // replaces list
  entry_date?: string;           // must equal current date if sent
}

export interface TTimesheetPrefill {
  tasks: Array<{
    task_id: string; title: string; category: string; deadline: string;
    status: string; complexity: string; output_link: string | null;
    is_overdue: boolean;
  }>;
  on_leave: boolean;
}
```

- `TInternTask.status` → `TInternTaskStatus` (adds `NOT_STARTED` and `OVERDUE`).
- Delete `TTimesheetReviewPayload`.
- Remove `edit_reason` from the submit payload (not allowed on POST).

### 3.2 Query params

Add `muid`, `date_from` and `date_to` to `TInternQueryParams` and to both `buildQueryString` functions (`intern.api.ts`, `manage-interns.api.ts`).

Remove `sortOrder` from `TInternQueryParams` and both builders (`intern.api.ts` L49, `manage-interns.api.ts` L32). Tables must encode direction as a `-` prefix on `sortBy`. Update every intern table's sort handler (`handleSort` in `timesheet-reviews-client.tsx`, tasks, leave) to produce `sortBy=-field`. The leaderboard stays as it is; if it relies on `sortOrder`, leave its query building alone and flag it.

### 3.3 API

- `intern.api.ts`:
  - `getTimesheetsPrefill` → `Promise<TTimesheetPrefill>`.
  - `getTimesheetToday` → catch `ApiError` 400 ("No timesheet submitted for today.") and return `null`, the same pattern as `getLeaderboardMe`.
- `manage-interns.api.ts`: delete `reviewTimesheet`. That endpoint now always returns 400.

### 3.4 Hooks

- `useTimesheetToday`: data type `TTimesheet | null`, `retry: false`.
- `useSubmitTimesheet` / `useEditTimesheet`: invalidate `timesheets()`, the activity log, `leaderboard()` and `topLeaderboard()` (the leaderboard ranking changes on submit). Success toast: "Timesheet submitted" (no points).
- `use-manage-interns.ts`: **delete `useReviewTimesheet`** (L344–377) and its barrel export.

### 3.5 Intern timesheet page — `intern-timesheet-client.tsx`

1. **Calendar mapping** (L118–126, L159–167): `REJECTED` → missing; any other entry → submitted. Drop the per-entry "pending" state, and keep "pending" only for today with no entry. Update the legend.
2. **IST date bug** (L180): replace `new Date().toISOString().split("T")[0]` with
   ```ts
   new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date())
   ```
   (The UTC version submits for yesterday between 00:00 and 05:30 IST.)
3. **Today | Yesterday** selector (IST). Backend rejects older and future dates.
4. **On leave**: if `prefill.on_leave`, disable the form and show "You are on approved leave today."
5. **Validation** (consider a zod schema): description 30–2000 with a counter, hours >0 and ≤24, blockers/EOD ≤1000.
6. **Blockers** (L187): send `null` when empty instead of `"None"`.
7. **Tasks**:
   - Source from `prefill.tasks` (this ISO week, with an `is_overdue` badge) instead of `tasksData.filter(...)` (L217).
   - Allow multiple entries, with no duplicate `task_id`.
   - Status options: all six from `TInternTaskStatus`.
   - Disable `COMPLETED` when the task has no `output_link`, with the hint "Submit output link from Tasks first".
   - Optional `remark` per task (currently hardcoded `""`).
8. **409** "Timesheet for this date already exists." → open edit mode for that entry.
9. Remove any "awaiting approval" or "pending review" copy.

### 3.6 Activity detail dialog — timesheet branch

- Render `task[]` (title, status, remark) instead of the flat fields.
- Allow edits only until the end of the day after `entry_date` (IST) and when `status !== "REJECTED"`. Otherwise read-only.
- `edit_reason` is required (≤300).
- PATCH can send `task[]`. Warn the user that removed tasks revert to `NOT_STARTED`.
- Activity log rows: show `SUBMITTED` as success.

### 3.7 Admin daily tab (read-only)

`timesheet-reviews-client.tsx` (moved to `timesheets/` in Phase 6):
- Status filter: `ALL`, `SUBMITTED`, plus legacy `APPROVED` / `PENDING` / `REJECTED`. Add `SUBMITTED` to `statusColorClass` (success).
- Filters: `muid`, `date_from`, `date_to`.
- Columns: `entry_date`, intern, `hours`, task titles/count, status, an `edit_reason` indicator. No karma or score.
- Action button always reads **"View"** (L501).
- Subtitle (L376) → "View daily timesheets and evaluate monthly reviews."

`components/timesheet-evaluate-dialog.tsx`, daily branch:
- Remove approve/reject, the review-note textarea and `useReviewTimesheet`.
- Show `task[]`, hours, description, blockers, EOD note, `edit_reason`, and the legacy `review_note` if present.

### ✅ Done when

- Grep for `useReviewTimesheet`, `TTimesheetReviewPayload`, `task_status`, `karma_awarded` (timesheet) and `toISOString().split` in the timesheet client returns nothing.
- Manual check: submit today, submit yesterday, the 409 → edit flow, and the edit-window lock.

**Commit:** `feat(intern): align daily timesheet with no-approval backend`

---

## Phase 4 — Monthly review: data layer (additive)

**Goal:** monthly endpoints, types, API, hooks and schema exist. Weekly code is still in place, so the build stays green.

### 4.1 Endpoints — `src/api/endpoints.ts`

```ts
// intern
monthlyReviews: "/api/v1/dashboard/intern/monthly-reviews/",
monthlyReviewsPrefill: "/api/v1/dashboard/intern/monthly-reviews/prefill/",
monthlyReviewDetail: (id: string) => `/api/v1/dashboard/intern/monthly-reviews/${id}/`,
monthlyReviewCurrent: "/api/v1/dashboard/intern/monthly-reviews/current/",
monthlyReviewHistory: "/api/v1/dashboard/intern/monthly-reviews/history/",

// manageInterns
monthlyReviews: "/api/v1/dashboard/manage-interns/reviews/monthly/",
monthlyReviewDetail: (id: string) =>
  `/api/v1/dashboard/manage-interns/reviews/monthly/${id}/review/`,
```

### 4.2 Types — `api.types.ts`

```ts
export type TMonthlyReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface TMonthlyReviewWindow {
  window_open: boolean;
  year: number;
  month: number;        // 1–12
  month_name: string;
  period_start: string; // YYYY-MM-DD
  period_end: string;
  opens_on: string;
  closes_on: string;
}

export interface TMonthlyTaskRemarks {
  rating: number | null;
  learnings: string | null;
  challenges_faced: string | null;
  next_month_plan: string | null;
}

export interface TMonthlyReviewTaskCompleted {
  task_id: string; title: string; category: string; complexity: string;
  deadline: string; final_status: string; output_link: string | null;
}

export interface TMonthlyReview {
  id: string;
  year: number;
  month: number;
  period_start: string;
  period_end: string;
  team: string;
  tasks_completed: TMonthlyReviewTaskCompleted[];
  monthly_review: string;
  task_remarks: TMonthlyTaskRemarks;
  blockers: string | null;
  leave_days: number;
  suggestions: string | null;
  status: TMonthlyReviewStatus;
  review_note: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TAdminMonthlyReview extends TMonthlyReview {
  user_id: string;
  user_name: string;
  muid: string;
  reviewed_by_id: string | null;
}

export interface TMonthlyReviewPrefill extends TMonthlyReviewWindow {
  existing_review: { id: string; status: TMonthlyReviewStatus; review_note: string | null } | null;
  leave_days: number; // 1st of month → today
  tasks: Array<{
    task_id: string; title: string; category: string; complexity: string;
    deadline: string; status: string; output_link: string | null;
  }>;
}

export interface TMonthlyReviewCurrent {
  window: TMonthlyReviewWindow;
  review: TMonthlyReview | null;
}

/** POST + PATCH. Month, team, leave_days and tasks are filled by the server. */
export interface TMonthlyReviewPayload {
  monthly_review?: string | null;   // ≤5000
  rating?: number | null;           // 1–5
  learnings?: string | null;        // ≤2000
  challenges_faced?: string | null; // ≤2000
  next_month_plan?: string | null;  // ≤2000
  blockers?: string | null;         // ≤2000
  suggestions?: string | null;      // ≤2000
}

export interface TMonthlyReviewReviewPayload {
  action: "approve" | "reject";
  review_note?: string; // ≤300
}
```

Never send: `team`, `is_on_leave`, `hours_committed`, `leave_days`, `week_start_date`, `next_week_plan`, `weekly_review`, `tasks_assigned`, `is_late`, `karma_awarded`, `score`, `iso_year`, `iso_week`.

### 4.3 Query params

Add `year`, `month` and `muid` to `TInternQueryParams` and both `buildQueryString` functions. Sorting uses `sortBy=-field` (Phase 0).

### 4.4 API

`intern.api.ts`:
```ts
getMonthlyReviews(params)       → TPaginatedData<TMonthlyReview>
getMonthlyReviewDetail(id)      → TMonthlyReview
getMonthlyReviewPrefill()       → TMonthlyReviewPrefill
getMonthlyReviewCurrent()       → TMonthlyReviewCurrent   // { window, review | null }
getMonthlyReviewHistory(params) → TPaginatedData<TMonthlyReview>
submitMonthlyReview(payload)    → TMonthlyReview          // POST
updateMonthlyReview(id, payload)→ TMonthlyReview          // PATCH
```

`manage-interns.api.ts`:
```ts
getMonthlyReviews(params)          → TPaginatedData<TAdminMonthlyReview>
getMonthlyReviewDetail(id)         → TAdminMonthlyReview
reviewMonthlyReview(id, payload)   → TAdminMonthlyReview  // PATCH approve/reject
```

### 4.5 Query keys

Add `monthlyReviews`, `monthlyReviewHistory(params)`, `monthlyReviewCurrent`, `monthlyReviewPrefill`, `monthlyReviewDetail(id)` and `manageMonthlyReviews(params)`.

### 4.6 Hooks

`use-intern.ts`:
- `useMonthlyReviews`, `useMonthlyReviewPrefill`, `useMonthlyReviewCurrent`, `useMonthlyReviewHistory`, `useMonthlyReviewDetail(id)`.
- `useSubmitMonthlyReview`:
  - Toast from the response message ("submitted" vs "resubmitted").
  - On **409** ("already submitted"), refetch the prefill.
  - On the **window closed** 400, the error's `response.window` carries the next window; show it.
- `useEditMonthlyReview`: handle "This review can no longer be edited; its submission window has closed." and "Pending monthly review not found." by refetching the prefill.
- All of these invalidate `monthlyReviews`, `monthlyReviewPrefill` and `monthlyReviewCurrent`, and `setQueryData` the returned review.

`use-manage-interns.ts`:
- `useManageMonthlyReviews(params)`.
- `useReviewMonthlyReview(id)`:
  - Toasts: "Monthly review approved" / "Monthly review rejected".
  - Invalidate `manageMonthlyReviews` and `monthlyReviews` only. **No leaderboard invalidation**, since approval doesn't affect ranking.
  - On "Pending monthly review not found.", refetch the list (someone else already reviewed it).

### 4.7 Schema — `intern-form-schema.ts`

```ts
export const monthlyReviewSchema = z
  .object({
    monthlyReview: z.string().max(5000).optional(),
    rating: z.string().optional(),
    learnings: z.string().max(2000).optional(),
    challengesFaced: z.string().max(2000).optional(),
    nextMonthPlan: z.string().max(2000).optional(),
    blockers: z.string().max(2000).optional(),
    suggestions: z.string().max(2000).optional(),
  })
  .superRefine((d, ctx) => {
    const hasText = [d.monthlyReview, d.learnings, d.challengesFaced, d.nextMonthPlan]
      .some((v) => v?.trim());
    if (!hasText) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["monthlyReview"],
        message:
          "Write your monthly review, or fill in learnings, challenges faced or next month's plan.",
      });
    }
  });

export type MonthlyReviewFormValues = z.infer<typeof monthlyReviewSchema>;
```

Add all of the above to the barrel exports.

### ✅ Done when

Typecheck passes and the new hooks can be imported. No UI changes yet.

**Commit:** `feat(intern): add monthly review data layer`

---

## Phase 5 — Monthly review: intern UI

**Goal:** interns use the monthly review page. The weekly page is no longer reachable.

### 5.1 Route

- Create `src/app/(dashboard)/dashboard/intern/monthly-review/page.tsx` and `monthly-review-client.tsx` (`MonthlyReviewPageClient`).
- Delete `src/app/(dashboard)/dashboard/intern/weekly-review/`.
- Links:
  - `active-quests.tsx:51` href → `/dashboard/intern/monthly-review`
  - `active-quests.tsx:59` label "Weekly Timesheet" → "Monthly Review"
- `route-access.ts`: the `/dashboard/intern` prefix already covers the new route. Add an explicit entry only if child routes are enumerated.

### 5.2 Page client

- No `getISOWeekAndYear`. The data comes from `useMonthlyReviewPrefill()`.
- Header: "Monthly Review", plus "{month_name} {year} · window {opens_on} – {closes_on} (IST)".
- Status badge: `Not submitted` / `Pending` / `Approved` / `Rejected`, plus `Window open` or `Opens {opens_on}`.

### 5.3 Form — `components/monthly-review-form.tsx` (replaces `weekly-review-form.tsx`)

Which state to show depends on `window_open` and `existing_review`:

| `window_open` | `existing_review` | UI |
|---|---|---|
| false | any | Closed card: "Next window: {opens_on} – {closes_on}". Below it, the last review from `useMonthlyReviewCurrent()` (read-only) if any. |
| true | null | Empty form → POST |
| true | `PENDING` | Form prefilled via `useMonthlyReviewDetail(id)` → PATCH ("Update Review") |
| true | `REJECTED` | Alert with `review_note`, form prefilled → **POST** (resubmit) |
| true | `APPROVED` | Success card, read-only, no form |

Contents:
- Read-only strip: name, muid, team (overview `guild`), and **Leave days so far** (`prefill.leave_days`, display only and never sent).
- **Tasks this month** (`prefill.tasks`), read-only, with the note "Completed / waiting-for-review tasks are attached automatically."
- Fields: Monthly Rating (1–5), Learnings, Challenges Faced, Next Month's Plan, Monthly Review (optional if the sections above are filled), Blockers, Suggestions.
- Removed: On Leave switch, Hours Committed, Leave Days input, Works Done, and the name/muid/email/team schema fields.

Submit mapping:
```ts
{
  monthly_review: v.monthlyReview?.trim() || null,
  rating: v.rating ? Number(v.rating) : null,
  learnings: v.learnings || null,
  challenges_faced: v.challengesFaced || null,
  next_month_plan: v.nextMonthPlan || null,
  blockers: v.blockers || null,
  suggestions: v.suggestions || null,
}
```

Map backend field errors (`response.<field>`) onto the form with `setError`.

### 5.4 Activity log (`activity-log.tsx`, `activity-log-history.tsx`)

- `useWeeklyReviewHistory` → `useMonthlyReviewHistory`.
- `type: "weekly_review"` → `"monthly_review"` (update the union and every switch on it).
- Title: `Monthly Review - {month_name} {year}`. Description: `monthly_review`.

### 5.5 Activity detail dialog — review branch

- Rename the `wr*` state. Remove `wrHours`, the `tasks_assigned` parsing and the string fallback for `tasks_completed`.
- `next_week_plan` → `next_month_plan` (from `task_remarks`).
- Payload: `TMonthlyReviewPayload`.
- Edits are allowed only when `status === "PENDING"`, `prefill.window_open` is true, and the prefill month and year match the review's. Otherwise read-only.
- Show the period, `leave_days`, the `tasks_completed` list, `review_note` and `reviewed_at`.

### 5.6 Overview

- `intern-stats-cards.tsx`: add a **Monthly Review** card (status plus window dates).
- Optional: an overview banner when the window is open with no review ("Monthly review open until {closes_on}"), or when the review is `REJECTED`.

### ✅ Done when

All five form states are checked manually (mock the prefill if the window is closed today). No intern UI imports any `useWeeklyReview*` hook.

**Commit:** `feat(intern): monthly review page for interns`

---

## Phase 6 — Monthly review: admin UI

**Goal:** admins and intern leads can list, filter, approve and reject monthly reviews at `/dashboard/management/manage-interns/timesheets`.

### 6.1 `timesheet-reviews-client.tsx`

- Type toggle: `DAILY | MONTHLY` (L409 "Weekly Reviews" → "Monthly Reviews").
- Monthly tab:
  - Hook: `useManageMonthlyReviews`.
  - Filters: status (PENDING / APPROVED / REJECTED), **year**, **month** (1–12), `muid`, and search (name, muid, team).
  - Columns:
    - **Month** (`{month_name} {year}`) replaces `iso_week` (L274).
    - **Leave days** replaces `hours_committed` (L313).
    - Add **Rating**, **Team** and **Submitted** (`created_at`).
    - Sortable: `created_at`, `year`, `month`, `status`.
  - Action: "Evaluate" if `PENDING`, otherwise "View".

### 6.2 `timesheet-evaluate-dialog.tsx` — monthly branch (replaces L253–525)

- Header: `{month_name} {year}` (`period_start` – `period_end`).
- Remove: `hours_committed` (L297), `is_on_leave` (L316), the `is_late` badge (L326) and `tasks_assigned` (L390).
- Show:
  - `team`, `leave_days`, rating stars
  - `monthly_review` ("Monthly Summary")
  - the `tasks_completed` list (title, complexity, final_status, output_link)
  - learnings, challenges, `next_month_plan`
  - blockers, suggestions
- Approve/Reject only when `PENDING`. `review_note` has `maxLength={300}` and a counter.
- Once reviewed, show `review_note` and `reviewed_at`.
- Title: "Evaluate Monthly Review". Description: "Evaluate monthly performance, self-rating, and completed tasks."
- Mutation: `useReviewMonthlyReview`.

### 6.3 Rename route → `manage-interns/timesheets`

- Move `src/app/(dashboard)/dashboard/management/manage-interns/timesheet-reviews/` → `.../manage-interns/timesheets/`, including `components/`.
- Rename `TimesheetReviewsPageClient` → `TimesheetsPageClient` and the file `timesheet-reviews-client.tsx` → `timesheets-client.tsx`. `timesheet-evaluate-dialog.tsx` → `review-detail-dialog.tsx` (it now covers a daily view and a monthly evaluation).
- Update the link at `manage-interns-client.tsx:332` → `/dashboard/management/manage-interns/timesheets`.
- `route-access.ts`: if there's an explicit `timesheet-reviews` entry, rename it. Otherwise the `/dashboard/management/manage-interns` prefix covers it.
- Grep for any other `timesheet-reviews` references (tour steps, notifications, the reports pages) and update them.
- No redirect: the old URL will 404.
- Page title "Timesheet Reviews" → "Timesheets & Reviews".

### 6.4 Copy

- `update-dialog.tsx`: the Intern Lead helper text → "Intern Lead can review monthly reviews."

### ✅ Done when

Approve and reject both work, filters hit the right query params, and no admin UI imports `useManageWeeklyReviews` or `useReviewWeeklyReview`.

**Commit:** `feat(intern): monthly review evaluation for admins`

---

## Phase 7 — Delete weekly review code

**Goal:** no weekly review code is left.

| File | Remove |
|---|---|
| `src/api/endpoints.ts` | `intern.reviews`, `reviewsPrefill`, `reviewDetail`, `reviewCurrent`, `reviewHistory`; `manageInterns.reviews`, `weeklyReviewDetail` |
| `types/api.types.ts` | `TWeeklyReview`, `TWeeklyReviewSubmitPayload`, `TWeeklyReviewUpdatePayload`, `TWeeklyReviewReviewPayload`, `TTaskRemarks` |
| `types/intern-form-type.ts` | `TWeeklyReviewForm`, `TWeeklyReviewResult`, `TWeeklyReviewResponse` |
| `api/intern.api.ts` | Weekly section (L138–194) |
| `api/manage-interns.api.ts` | Weekly section (L181–205) |
| `hooks/query-keys.ts` | `reviews`, `reviewHistory`, `reviewCurrent`, `manageReviews` |
| `hooks/use-intern.ts` | `useWeeklyReviews`, `useWeeklyReviewsPrefill`, `useWeeklyReviewHistory`, `useWeeklyReviewCurrent`, `useSubmitWeeklyReview`, `useEditWeeklyReview` |
| `hooks/use-manage-interns.ts` | `useManageWeeklyReviews`, `useReviewWeeklyReview` |
| `schemas/intern-form-schema.ts` + `schemas/index.ts` | `weeklyReviewSchema`, `WeeklyReviewFormValues` |
| `components/weekly-review-form.tsx` + `components/index.ts` | Delete file and export |
| `src/features/intern/index.ts` | All weekly exports (L19–114) |

### ✅ Done when

```bash
grep -rnE "Weekly|weekly_review|iso_week|iso_year|hours_committed|next_week_plan|is_late|tasks_assigned|getISOWeekAndYear" \
  src/features/intern src/api/endpoints.ts \
  "src/app/(dashboard)/dashboard/intern" \
  "src/app/(dashboard)/dashboard/management/manage-interns"
```
Returns nothing. Typecheck and lint pass.

**Commit:** `refactor(intern): remove weekly review`

---

## Phase 8 — Tour, notifications, final verify

### 8.1 Tour — `src/features/tour/steps/pages/intern.ts`

- Weekly block (L271–300) → monthly: route `/dashboard/intern/monthly-review`, ids and `elementId`s `page:intern-monthly-review:*`, and copy explaining the window, the tasks list and the status badge.
- Update the matching `data-tour-id`s in `monthly-review-client.tsx`.
- L7 header comment: "weekly review" → "monthly review".
- Bump the intern entry in `TOUR_VERSIONS` once, covering Phases 1, 2 and 8.

### 8.2 Notifications

- Add `INTERN_MONTHLY_REVIEW_OPEN` and `INTERN_MONTHLY_REVIEW_LAST_DAY` to the notifications type → icon/route map, linking to `/dashboard/intern/monthly-review`.
- Remove any weekly review notification types.

### 8.3 Final checklist

- [ ] The grep checks from Phases 1, 2 and 7 are clean
- [ ] `bun run typecheck`, `bun run lint`, `bun run test` pass
- [ ] Manual run as intern: overview, timesheet (today/yesterday/edit), monthly review (each state), leaderboard unchanged
- [ ] Manual run as admin/lead: daily tab read-only, monthly tab evaluate
- [ ] The tour runs end to end without missing elements

**Commit:** `chore(intern): monthly review tour and notifications`

> No redirects: old `/intern/weekly-review`, `/intern/minutes`, `/manage-interns/minutes` and `/manage-interns/timesheet-reviews` URLs will 404 (decided).

---

## Decisions

| Question | Decision |
|---|---|
| Does monthly approval affect leaderboard ranking? | **No.** No leaderboard invalidation on approve/reject. |
| Sort format | **`sortBy=-field` only.** Remove `sortOrder` everywhere. |
| Admin route | **Rename** `manage-interns/timesheet-reviews` → `manage-interns/timesheets`. |
| Redirects for old URLs | **None.** Old URLs 404. |
| Backend removing streak/score/summary and minutes endpoints? | **No, frontend only.** The backend keeps them (the leaderboard still uses score). The frontend just stops calling and showing them. |
| Admin export for monthly reviews | **Out of scope here.** Already planned/ongoing separately. |
| "Not submitted" list for admins | **Not now.** |

No open questions remain.

---

## File change summary (by phase)

| File | Phase |
|---|---|
| `intern/minutes/`, `manage-interns/minutes/` | 1 (delete) |
| `intern-header.tsx`, `manage-interns-client.tsx`, `update-dialog.tsx` | 1, 6 |
| `route-access.ts` | 1, 5 |
| `intern-stats-cards.tsx` | 2, 5 |
| `intern-timesheet-client.tsx` | 2, 3 |
| `activity-log.tsx`, `activity-log-history.tsx`, `activity-detail-dialog.tsx` | 2, 3, 5 |
| `src/api/endpoints.ts` | 1, 2, 4, 7 |
| `types/api.types.ts`, `types/index.ts`, `src/features/intern/index.ts` | 1, 2, 3, 4, 7 |
| `api/intern.api.ts`, `api/manage-interns.api.ts` | 1, 2, 3, 4, 7 |
| `hooks/query-keys.ts`, `hooks/use-intern.ts`, `hooks/use-manage-interns.ts` | 1, 2, 3, 4, 7 |
| `schemas/intern-form-schema.ts` | 4, 7 |
| `intern/weekly-review/` → `intern/monthly-review/` | 5 |
| `components/weekly-review-form.tsx` → `monthly-review-form.tsx` | 5, 7 |
| `active-quests.tsx` | 5 |
| `manage-interns/timesheet-reviews/` → `manage-interns/timesheets/` (client + dialog renamed) | 3, 6 |
| Intern table sort handlers (`sortOrder` removal) | 3 |
| `tour/steps/pages/intern.ts`, `TOUR_VERSIONS` | 1, 2, 8 |
| Notifications type map | 8 |
| `leaderboard.tsx`, `intern/leaderboard/*` | **No change** |
