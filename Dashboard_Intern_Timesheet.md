# Dashboard — Intern Daily Timesheet

**Intern base path:** `/api/v1/dashboard/intern/timesheets/`  
**Admin base path:** `/api/v1/dashboard/manage-interns/reviews/`


---

## Table of Contents

| # | Endpoint | Method(s) | Role |
|---|----------|-----------|------|
| 1 | [`timesheets/prefill/`](#1-timesheetsprefill) | `GET` | Intern |
| 2 | [`timesheets/`](#2-timesheets) | `GET`, `POST` | Intern |
| 3 | [`timesheets/<timesheet_id>/`](#3-timesheetstimesheet_id) | `GET`, `PATCH` | Intern |
| 4 | [`timesheets/today/`](#4-timesheetstoday) | `GET` | Intern |
| 5 | [`timesheets/history/`](#5-timesheetshistory) | `GET` | Intern |
| 6 | [`timesheets/summary/`](#6-timesheetssummary) | `GET` | Intern |
| 7 | [`manage-interns/reviews/timesheets/`](#7-admin-list-timesheets) | `GET` | Admin, Intern Lead |
| 8 | [`manage-interns/reviews/timesheets/<timesheet_id>/review/`](#8-admin-timesheet-detail) | `GET`, `PATCH` (deprecated) | Admin, Intern Lead |

---

## Overview

### How daily timesheets work

- An intern submits one timesheet per day. It **counts as soon as it is submitted**; there is no admin approval.
- A timesheet can be submitted for **today or yesterday** (IST). Older and future dates are refused.
- It can be edited until the **end of the day after its date** (IST). An `edit_reason` is required for every edit.
- On submit, the intern's streak is updated and any streak milestone karma is awarded.
- Each counted timesheet adds **25 points** to the intern's leaderboard score.
- The intern's status (`ACTIVE` / `AT_RISK` / `INACTIVE`) is updated once a day, not at the moment of submitting.

### Timesheet status

| `status` | Meaning |
|----------|---------|
| `SUBMITTED` | Every new timesheet. Counts toward streak and score. |
| `APPROVED`, `PENDING` | Older timesheets from before approval was removed. Also counted. |
| `REJECTED` | Older timesheets rejected under the old flow. Not counted, and cannot be edited. |

### Response envelope

**Success:**

```json
{
  "hasError": false,
  "statusCode": 200,
  "message": { "general": ["success message"] },
  "response": {}
}
```

**Failure:**

```json
{
  "hasError": true,
  "statusCode": 400,
  "message": { "general": ["Error summary"] },
  "response": {}
}
```

**Failure (field validation):** field errors are returned in `response`, keyed by field name.

```json
{
  "hasError": true,
  "statusCode": 400,
  "message": { "general": [] },
  "response": {
    "description": ["Description must be at least 30 characters."]
  }
}
```

Any field not listed for an endpoint is rejected with `"Unknown field."`.

### Authentication

```http
Authorization: Bearer <access_token>
```

Required on all endpoints. A missing or invalid token returns HTTP 403:

```json
{
  "hasError": true,
  "message": { "general": ["Invalid token header"] },
  "statusCode": 1000
}
```

A valid token without the required role returns HTTP 400:

```json
{
  "hasError": true,
  "statusCode": 400,
  "message": { "general": ["You do not have the required role to access this page."] },
  "response": {}
}
```

### Pagination & search (list endpoints)

| Query param | Default | Description |
|-------------|---------|-------------|
| `pageIndex` | `1` | Page number |
| `perPage` | `10` | Items per page (max 1000) |
| `search` | — | See each endpoint |
| `sortBy` | — | See each endpoint, e.g. `entry_date`, `-entry_date` |

**Paginated response shape:**

```json
{
  "hasError": false,
  "statusCode": 200,
  "message": { "general": [] },
  "response": {
    "data": [],
    "pagination": {
      "count": 0,
      "totalPages": 1,
      "isNext": false,
      "isPrev": false,
      "nextPage": null
    }
  }
}
```

### Timesheet object

Returned by the intern endpoints (detail, list, today, history):

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Timesheet id |
| `entry_date` | date | The day the timesheet is for |
| `task` | array \| null | Snapshot of task updates: `task_id`, `title`, `status`, `remark` |
| `description` | string | What the intern did |
| `hours` | decimal string | e.g. `"4.00"` |
| `blockers` | string \| null | |
| `end_of_day_note` | string \| null | |
| `edit_reason` | string \| null | Reason given on the last edit |
| `status` | string | See [Timesheet status](#timesheet-status) |
| `review_note` | string \| null | Only set on older reviewed timesheets |
| `created_at` | datetime | UTC |
| `score` | integer | `25` if counted, `0` if `REJECTED` |

---

## 1. `timesheets/prefill/`

### Get this week's tasks for the form

**`GET /api/v1/dashboard/intern/timesheets/prefill/`**

Returns the intern's tasks for the current ISO week (Monday–Sunday, IST), to fill the task section of the form. A task is included if its deadline falls in this week, it isn't archived, and it isn't both completed and verified. Sorted by deadline.

**Roles:** `Intern`

**Request body:** None

**Success response:**

```json
{
  "hasError": false,
  "statusCode": 200,
  "message": { "general": [] },
  "response": {
    "tasks": [
      {
        "task_id": "task-uuid-001",
        "title": "Build the login page",
        "category": "UI Components",
        "deadline": "2026-11-27",
        "status": "IN_PROGRESS",
        "complexity": "MEDIUM",
        "output_link": null,
        "is_overdue": false
      }
    ],
    "on_leave": false
  }
}
```

**While the intern is on approved leave:**

```json
{
  "hasError": false,
  "statusCode": 200,
  "message": { "general": [] },
  "response": { "tasks": [], "on_leave": true }
}
```

**Error — not an active intern:**

```json
{
  "hasError": true,
  "statusCode": 400,
  "message": { "general": ["Not an active intern."] },
  "response": {}
}
```

---

## 2. `timesheets/`

### List my timesheets

**`GET /api/v1/dashboard/intern/timesheets/`**

The intern's own timesheets, newest date first.

**Roles:** `Intern`

**Query params:**

| Param | Required | Description |
|-------|----------|-------------|
| `pageIndex`, `perPage` | No | Pagination |
| `search` | No | Searches `entry_date`, `status` |
| `sortBy` | No | `entry_date`, `status` (prefix `-` for descending) |

**Success response:**

```json
{
  "hasError": false,
  "statusCode": 200,
  "message": { "general": [] },
  "response": {
    "data": [
      {
        "id": "timesheet-uuid-001",
        "entry_date": "2026-11-24",
        "task": [
          {
            "task_id": "task-uuid-001",
            "title": "Build the login page",
            "status": "IN_PROGRESS",
            "remark": "Form layout done, validation pending."
          }
        ],
        "description": "Built the login form layout and wired up the API client for sign-in.",
        "hours": "6.50",
        "blockers": null,
        "end_of_day_note": "Validation tomorrow.",
        "edit_reason": null,
        "status": "SUBMITTED",
        "review_note": null,
        "created_at": "2026-11-24T12:30:00Z",
        "score": 25
      }
    ],
    "pagination": {
      "count": 1,
      "totalPages": 1,
      "isNext": false,
      "isPrev": false,
      "nextPage": null
    }
  }
}
```

---

### Submit a timesheet

**`POST /api/v1/dashboard/intern/timesheets/`**

Submits the timesheet for a day. It counts immediately.

**Roles:** `Intern`

**Request body:**

```json
{
  "entry_date": "2026-11-24",
  "hours": 6.5,
  "description": "Built the login form layout and wired up the API client for sign-in.",
  "blockers": null,
  "end_of_day_note": "Validation tomorrow.",
  "task": [
    {
      "task_id": "task-uuid-001",
      "status": "IN_PROGRESS",
      "remark": "Form layout done, validation pending."
    }
  ]
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `entry_date` | Yes | `YYYY-MM-DD`. Today or yesterday (IST) only |
| `hours` | Yes | Greater than 0, at most 24 |
| `description` | Yes | 30–2000 characters |
| `blockers` | No | Max 1000 characters |
| `end_of_day_note` | No | Max 1000 characters |
| `task` | No | Task updates. Each entry: `task_id` (required), `status` (required), `remark` (optional) |

Task entry rules:
- `status` is one of `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`, `WAITING_FOR_REVIEW`, `ON_HOLD`, `OVERDUE`.
- The task must be assigned to the intern and not already verified.
- `COMPLETED` needs the task's `output_link` to be set first (through the task submit endpoint).
- The same `task_id` can't appear twice.
- Each entry also updates the task's own status.

**Success response:**

```json
{
  "hasError": false,
  "statusCode": 200,
  "message": { "general": ["Timesheet submitted successfully."] },
  "response": {}
}
```

**Error — already submitted for that date (409):**

```json
{
  "hasError": true,
  "statusCode": 409,
  "message": { "general": ["Timesheet for this date already exists."] },
  "response": {}
}
```

**Error — on approved leave:**

```json
{
  "hasError": true,
  "statusCode": 400,
  "message": { "general": ["You are currently on approved leave and cannot submit a timesheet."] },
  "response": {}
}
```

**Validation error examples:**

```json
{
  "hasError": true,
  "statusCode": 400,
  "message": { "general": [] },
  "response": {
    "entry_date": ["Timesheets can only be submitted for today or yesterday."]
  }
}
```

| Field | Message |
|-------|---------|
| `entry_date` | `Future dates are not allowed.` |
| `entry_date` | `Timesheets can only be submitted for today or yesterday.` |
| `description` | `Description must be at least 30 characters.` |
| `hours` | `Hours must be greater than 0.` / `Hours cannot exceed 24 in a single day.` |
| `task` | `Task 'task-uuid-009' is not assigned to you or does not exist.` |
| `task` | `Task 'Build the login page' requires an output_link before marking COMPLETED. Use the task submit endpoint first.` |

---

## 3. `timesheets/<timesheet_id>/`

### Get one timesheet

**`GET /api/v1/dashboard/intern/timesheets/<timesheet_id>/`**

**Roles:** `Intern` (own timesheets only)

**Success response:** a single [timesheet object](#timesheet-object) in `response`.

```json
{
  "hasError": false,
  "statusCode": 200,
  "message": { "general": [] },
  "response": {
    "id": "timesheet-uuid-001",
    "entry_date": "2026-11-24",
    "task": [
      {
        "task_id": "task-uuid-001",
        "title": "Build the login page",
        "status": "IN_PROGRESS",
        "remark": "Form layout done, validation pending."
      }
    ],
    "description": "Built the login form layout and wired up the API client for sign-in.",
    "hours": "6.50",
    "blockers": null,
    "end_of_day_note": "Validation tomorrow.",
    "edit_reason": null,
    "status": "SUBMITTED",
    "review_note": null,
    "created_at": "2026-11-24T12:30:00Z",
    "score": 25
  }
}
```

**Error — not found or not yours:**

```json
{
  "hasError": true,
  "statusCode": 400,
  "message": { "general": ["Timesheet not found."] },
  "response": {}
}
```

---

### Edit a timesheet

**`PATCH /api/v1/dashboard/intern/timesheets/<timesheet_id>/`**

Partial update. Allowed until the end of the day after `entry_date` (IST).

**Roles:** `Intern` (own timesheets only)

**Request body:**

```json
{
  "edit_reason": "Added the blocker I forgot.",
  "blockers": "Waiting for the auth API to be deployed."
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `edit_reason` | Yes | Max 300 characters |
| `hours`, `description`, `blockers`, `end_of_day_note` | No | Same rules as submit |
| `task` | No | Replaces the task list. A task removed from the list is set back to `NOT_STARTED` (unless verified) |
| `entry_date` | No | Can't be changed. If sent, it must equal the timesheet's current date |

**Success response:**

```json
{
  "hasError": false,
  "statusCode": 200,
  "message": { "general": ["Timesheet updated successfully."] },
  "response": {}
}
```

**Errors:**

| Case | `message.general` / field error |
|------|---------------------------------|
| Past the edit window | `The edit window for this timesheet has closed.` |
| A `REJECTED` timesheet | `This timesheet can no longer be edited.` |
| Nothing changed | `No editable fields provided or no changes detected.` |
| No `edit_reason` | `edit_reason`: `edit_reason is mandatory for all modifications.` |
| Different `entry_date` | `entry_date`: `entry_date cannot be changed.` |

---

## 4. `timesheets/today/`

### Get today's timesheet

**`GET /api/v1/dashboard/intern/timesheets/today/`**

The timesheet for today's date (IST), if submitted.

**Roles:** `Intern`

**Success response:** a single [timesheet object](#timesheet-object), as in [section 3](#get-one-timesheet).

**Error — nothing submitted today:**

```json
{
  "hasError": true,
  "statusCode": 400,
  "message": { "general": ["No timesheet submitted for today."] },
  "response": {}
}
```

---

## 5. `timesheets/history/`

### Timesheet history

**`GET /api/v1/dashboard/intern/timesheets/history/`**

Same data, pagination, search and sorting as [`GET timesheets/`](#list-my-timesheets).

**Roles:** `Intern`

---

## 6. `timesheets/summary/`

### Streak summary

**`GET /api/v1/dashboard/intern/timesheets/summary/`**

**Roles:** `Intern`

**Success response:**

```json
{
  "hasError": false,
  "statusCode": 200,
  "message": { "general": [] },
  "response": {
    "current_streak": 4,
    "longest_streak": 9
  }
}
```

---

## 7. Admin: list timesheets

**`GET /api/v1/dashboard/manage-interns/reviews/timesheets/`**

Every intern's timesheets, newest first. Read-only.

**Roles:** `Admin`, `Intern Lead` (plain interns are refused; they read their own through `intern/timesheets/`)

**Query params:**

| Param | Required | Description |
|-------|----------|-------------|
| `muid` | No | Exact intern muid |
| `date_from` | No | `entry_date` on or after, `YYYY-MM-DD` |
| `date_to` | No | `entry_date` on or before, `YYYY-MM-DD` |
| `status` | No | `SUBMITTED`, or legacy `APPROVED` / `PENDING` / `REJECTED` |
| `search` | No | Searches intern name, muid, status |
| `sortBy` | No | `created_at`, `entry_date`, `status` |
| `pageIndex`, `perPage` | No | Pagination |

**Success response:**

```json
{
  "hasError": false,
  "statusCode": 200,
  "message": { "general": [] },
  "response": {
    "data": [
      {
        "id": "timesheet-uuid-001",
        "user_id": "user-uuid-001",
        "user_name": "Jane Doe",
        "muid": "jane-doe@mulearn",
        "entry_date": "2026-11-24",
        "task": [
          {
            "task_id": "task-uuid-001",
            "title": "Build the login page",
            "status": "IN_PROGRESS",
            "remark": "Form layout done, validation pending."
          }
        ],
        "description": "Built the login form layout and wired up the API client for sign-in.",
        "hours": "6.50",
        "blockers": null,
        "end_of_day_note": "Validation tomorrow.",
        "edit_reason": null,
        "status": "SUBMITTED",
        "review_note": null,
        "created_at": "2026-11-24T12:30:00Z"
      }
    ],
    "pagination": {
      "count": 1,
      "totalPages": 1,
      "isNext": false,
      "isPrev": false,
      "nextPage": null
    }
  }
}
```

**Error — bad date filter:**

```json
{
  "hasError": true,
  "statusCode": 400,
  "message": { "general": ["Invalid date_from. Use YYYY-MM-DD."] },
  "response": {}
}
```

---

## 8. Admin: timesheet detail

### Get one timesheet

**`GET /api/v1/dashboard/manage-interns/reviews/timesheets/<timesheet_id>/review/`**

**Roles:** `Admin`, `Intern Lead`

**Success response:** one item in the same shape as the [admin list](#7-admin-list-timesheets).

**Error:** `Timesheet not found.`

### Approve / reject (deprecated)

**`PATCH /api/v1/dashboard/manage-interns/reviews/timesheets/<timesheet_id>/review/`**

Timesheets no longer need approval. This endpoint always fails:

```json
{
  "hasError": true,
  "statusCode": 400,
  "message": {
    "general": ["Daily timesheets no longer require approval; they count as soon as they are submitted."]
  },
  "response": {}
}
```
