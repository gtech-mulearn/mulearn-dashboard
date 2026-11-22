# Dashboard — Intern Monthly Review

**Intern base path:** `/api/v1/dashboard/intern/monthly-reviews/`  
**Admin base path:** `/api/v1/dashboard/manage-interns/reviews/monthly/`


---

## Table of Contents

| # | Endpoint | Method(s) | Role |
|---|----------|-----------|------|
| 1 | [`monthly-reviews/prefill/`](#1-monthly-reviewsprefill) | `GET` | Intern |
| 2 | [`monthly-reviews/`](#2-monthly-reviews) | `GET`, `POST` | Intern |
| 3 | [`monthly-reviews/<review_id>/`](#3-monthly-reviewsreview_id) | `GET`, `PATCH` | Intern |
| 4 | [`monthly-reviews/current/`](#4-monthly-reviewscurrent) | `GET` | Intern |
| 5 | [`monthly-reviews/history/`](#5-monthly-reviewshistory) | `GET` | Intern |
| 6 | [`manage-interns/reviews/monthly/`](#6-admin-list-monthly-reviews) | `GET` | Admin, Intern Lead |
| 7 | [`manage-interns/reviews/monthly/<review_id>/review/`](#7-admin-review-detail-approve-reject) | `GET`, `PATCH` | Admin, Intern Lead |

---

## Overview

### How the monthly review works

- An intern submits **one review per calendar month**.
- It can only be submitted during the **submission window**: the last 2 days of the month plus the first 2 days of the next month (IST). All four days count toward the month that is ending.
- The month a review is for is decided by the current window; it isn't sent in the request.
- A review starts as `PENDING`. An Admin or Intern Lead approves or rejects it.
- A `PENDING` review can be edited while its window is open.
- After a **rejection**, the intern can submit again while the window is still open. That replaces the rejected review and sends it back to `PENDING`.
- There is no streak, hours field or late flag.

### Window examples

| Month reviewed | Window opens | Window closes |
|----------------|--------------|---------------|
| October 2026 (31 days) | 2026-10-30 | 2026-11-02 |
| November 2026 (30 days) | 2026-11-29 | 2026-12-02 |
| December 2026 | 2026-12-30 | 2027-01-02 |
| February 2027 (28 days) | 2027-02-27 | 2027-03-02 |

### Review status

| `status` | Meaning |
|----------|---------|
| `PENDING` | Submitted, waiting for review. Editable while the window is open |
| `APPROVED` | Approved. Final |
| `REJECTED` | Rejected. The intern can resubmit while the window is open |

### Leave days

`leave_days` is **not entered by the intern**. It is calculated from the intern's leave:
- It counts every **APPROVED** leave request (all leave types, WFH included) that falls inside the review month, in calendar day
- A leave that spans two months counts only the days inside each month. For example, 30 Oct – 2 Nov counts 2 days for October and 2 for November.
- On the **prefill**, it counts from the 1st of the month **up to today**.
- On the saved review (intern and admin views), it counts the **whole month**.

### Notifications

Interns get these in-app notifications:

| Type | Sent to | When |
|------|---------|------|
| `INTERN_MONTHLY_REVIEW_OPEN` | Every intern who isn't `INACTIVE` | The window's first day |
| `INTERN_MONTHLY_REVIEW_LAST_DAY` | Interns with no review for the month, or a rejected one | The window's last day |

Each is sent at most once per intern per month.

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
    "rating": ["Ensure this value is less than or equal to 5."]
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
| `sortBy` | — | See each endpoint, e.g. `year`, `-created_at` |

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

### Window object

Returned by prefill and current:

| Field | Type | Notes |
|-------|------|-------|
| `window_open` | boolean | Whether submissions are accepted today |
| `year`, `month` | integer | The month being reviewed |
| `month_name` | string | e.g. `"November"` |
| `period_start`, `period_end` | date | First and last day of that month |
| `opens_on`, `closes_on` | date | First and last day of the window (inclusive) |

### Review object

Returned by the intern endpoints:

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Review id |
| `year`, `month` | integer | Month reviewed |
| `period_start`, `period_end` | date | |
| `team` | string | The intern's team when the review was submitted |
| `tasks_completed` | array | Snapshot of the month's completed tasks: `task_id`, `title`, `category`, `complexity`, `deadline`, `final_status`, `output_link` |
| `monthly_review` | string | The review text |
| `task_remarks` | object | `rating`, `learnings`, `challenges_faced`, `next_month_plan` |
| `blockers` | string \| null | |
| `leave_days` | integer | See [Leave days](#leave-days) |
| `suggestions` | string \| null | |
| `status` | string | `PENDING`, `APPROVED` or `REJECTED` |
| `review_note` | string \| null | Note from the reviewer |
| `reviewed_at` | datetime \| null | UTC |
| `created_at`, `updated_at` | datetime | UTC |

---

## 1. `monthly-reviews/prefill/`

### Get the form data

**`GET /api/v1/dashboard/intern/monthly-reviews/prefill/`**

Returns the window state, the month's tasks, leave days so far, and the intern's existing review for that month (if any).
- When the window is open, it describes the open window.
- When it is closed, it describes the next window, with `window_open: false`.

`tasks` lists the intern's non-archived tasks whose deadline falls in the month.

**Roles:** `Intern`

**Request body:** None

**Success response (window open):**

```json
{
  "hasError": false,
  "statusCode": 200,
  "message": { "general": [] },
  "response": {
    "window_open": true,
    "year": 2026,
    "month": 11,
    "month_name": "November",
    "period_start": "2026-11-01",
    "period_end": "2026-11-30",
    "opens_on": "2026-11-29",
    "closes_on": "2026-12-02",
    "existing_review": null,
    "leave_days": 2,
    "tasks": [
      {
        "task_id": "task-uuid-001",
        "title": "Build the login page",
        "category": "UI Components",
        "complexity": "MEDIUM",
        "deadline": "2026-11-20",
        "status": "COMPLETED",
        "output_link": "https://github.com/example/repo/pull/12"
      }
    ]
  }
}
```

When a review already exists for the month, `existing_review` is set:

```json
"existing_review": {
  "id": "review-uuid-001",
  "status": "REJECTED",
  "review_note": "Please add links to your outputs."
}
```

---

## 2. `monthly-reviews/`

### List my reviews

**`GET /api/v1/dashboard/intern/monthly-reviews/`**

The intern's own reviews, newest month first.

**Roles:** `Intern`

**Query params:**

| Param | Required | Description |
|-------|----------|-------------|
| `pageIndex`, `perPage` | No | Pagination |
| `search` | No | Searches `status`, `team` |
| `sortBy` | No | `year`, `month`, `status`, `created_at` |

**Success response:** a paginated list of [review objects](#review-object). See [section 3](#get-one-review) for one item.

---

### Submit a review

**`POST /api/v1/dashboard/intern/monthly-reviews/`**

Submits the review for the month whose window is open. If that month's review was rejected, this replaces it and sends it back for review.

**Roles:** `Intern` (must be an active intern)

**Request body:**

```json
{
  "rating": 4,
  "learnings": "Learned how to structure React forms and handle API errors.",
  "challenges_faced": "Balancing intern tasks with coursework.",
  "next_month_plan": "Finish the dashboard charts.",
  "monthly_review": null,
  "blockers": "Waiting on design for the settings page.",
  "suggestions": "More pairing sessions."
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `monthly_review` | No* | Free-text review, max 5000 characters |
| `rating` | No | 1–5 |
| `learnings` | No* | Max 2000 characters |
| `challenges_faced` | No* | Max 2000 characters |
| `next_month_plan` | No* | Max 2000 characters |
| `blockers` | No | Max 2000 characters |
| `suggestions` | No | Max 2000 characters |

\* Some review text is required: either `monthly_review`, or at least one of `learnings`, `challenges_faced`, `next_month_plan`. If `monthly_review` is empty, it is built from those answers:

```text
Learnings: ...

Challenges Faced: ...

Next Month Plan: ...
```

`team`, the month, `leave_days` and `tasks_completed` (tasks due in the month with status `COMPLETED` or `WAITING_FOR_REVIEW`) are filled in automatically.

**Success response:**

```json
{
  "hasError": false,
  "statusCode": 200,
  "message": { "general": ["Monthly review submitted successfully."] },
  "response": {
    "id": "review-uuid-001",
    "year": 2026,
    "month": 11,
    "period_start": "2026-11-01",
    "period_end": "2026-11-30",
    "team": "Frontend Team",
    "tasks_completed": [
      {
        "task_id": "task-uuid-001",
        "title": "Build the login page",
        "category": "UI Components",
        "complexity": "MEDIUM",
        "deadline": "2026-11-20",
        "final_status": "COMPLETED",
        "output_link": "https://github.com/example/repo/pull/12"
      }
    ],
    "monthly_review": "Learnings: Learned how to structure React forms and handle API errors.\n\nChallenges Faced: Balancing intern tasks with coursework.\n\nNext Month Plan: Finish the dashboard charts.",
    "task_remarks": {
      "rating": 4,
      "learnings": "Learned how to structure React forms and handle API errors.",
      "challenges_faced": "Balancing intern tasks with coursework.",
      "next_month_plan": "Finish the dashboard charts."
    },
    "blockers": "Waiting on design for the settings page.",
    "leave_days": 2,
    "suggestions": "More pairing sessions.",
    "status": "PENDING",
    "review_note": null,
    "reviewed_at": null,
    "created_at": "2026-11-29T10:15:00Z",
    "updated_at": "2026-11-29T10:15:00Z"
  }
}
```

After a rejection, the message is `"Monthly review resubmitted successfully."`. The same `id` is kept, `status` returns to `PENDING`, and `review_note` / `reviewed_at` are cleared.

**Error — window closed:**

```json
{
  "hasError": true,
  "statusCode": 400,
  "message": {
    "general": ["The monthly review window is closed. The November 2026 review opens on 29 Nov 2026 and closes on 02 Dec 2026."]
  },
  "response": {
    "window": {
      "window_open": false,
      "year": 2026,
      "month": 11,
      "month_name": "November",
      "period_start": "2026-11-01",
      "period_end": "2026-11-30",
      "opens_on": "2026-11-29",
      "closes_on": "2026-12-02"
    }
  }
}
```

**Error — already submitted (409):** the month has a `PENDING` or `APPROVED` review.

```json
{
  "hasError": true,
  "statusCode": 409,
  "message": { "general": ["A review for November 2026 has already been submitted."] },
  "response": {}
}
```

**Error — not an active intern:** `Not an active intern.`

**Validation error example:**

```json
{
  "hasError": true,
  "statusCode": 400,
  "message": { "general": [] },
  "response": {
    "monthly_review": ["Write your monthly review, or fill in learnings, challenges faced or next month's plan."]
  }
}
```

**Error — review id in the URL:** `POST monthly-reviews/<review_id>/` returns `Submit to monthly-reviews/ without a review id. Use PATCH to edit a review.`

---

## 3. `monthly-reviews/<review_id>/`

### Get one review

**`GET /api/v1/dashboard/intern/monthly-reviews/<review_id>/`**

**Roles:** `Intern` (own reviews only)

**Success response:**

```json
{
  "hasError": false,
  "statusCode": 200,
  "message": { "general": [] },
  "response": {
    "id": "review-uuid-001",
    "year": 2026,
    "month": 11,
    "period_start": "2026-11-01",
    "period_end": "2026-11-30",
    "team": "Frontend Team",
    "tasks_completed": [],
    "monthly_review": "Learnings: Learned how to structure React forms and handle API errors.",
    "task_remarks": {
      "rating": 4,
      "learnings": "Learned how to structure React forms and handle API errors.",
      "challenges_faced": null,
      "next_month_plan": null
    },
    "blockers": null,
    "leave_days": 2,
    "suggestions": null,
    "status": "APPROVED",
    "review_note": "Good month.",
    "reviewed_at": "2026-12-01T06:00:00Z",
    "created_at": "2026-11-29T10:15:00Z",
    "updated_at": "2026-12-01T06:00:00Z"
  }
}
```

**Error:** `Monthly review not found.`

---

### Edit a review

**`PATCH /api/v1/dashboard/intern/monthly-reviews/<review_id>/`**

Partial update of a `PENDING` review while its window is open. Fields not sent keep their current values. If the review text was built from the answers, it is rebuilt when an answer changes.

**Roles:** `Intern` (own reviews only)

**Request body:** any of the [submit fields](#submit-a-review).

```json
{
  "blockers": "Waiting on API access.",
  "learnings": "Learned how to structure React forms and handle API errors."
}
```

**Success response:** `"Monthly review updated successfully."` with the updated [review object](#review-object) in `response`.

**Errors:**

| Case | Message |
|------|---------|
| Not found, not yours, or not `PENDING` | `Pending monthly review not found.` |
| Its window has closed | `This review can no longer be edited; its submission window has closed.` |
| No review id in the URL | `A review id is required to edit a review.` |

---

## 4. `monthly-reviews/current/`

### Current review

**`GET /api/v1/dashboard/intern/monthly-reviews/current/`**

The review for the open window's month. When no window is open, it returns the most recent month whose window has closed. `review` is `null` if nothing was submitted for that month.

**Roles:** `Intern`

**Success response:**

```json
{
  "hasError": false,
  "statusCode": 200,
  "message": { "general": [] },
  "response": {
    "window": {
      "window_open": false,
      "year": 2026,
      "month": 10,
      "month_name": "October",
      "period_start": "2026-10-01",
      "period_end": "2026-10-31",
      "opens_on": "2026-10-30",
      "closes_on": "2026-11-02"
    },
    "review": null
  }
}
```

When a review exists, `review` is a [review object](#review-object).

---

## 5. `monthly-reviews/history/`

### Review history

**`GET /api/v1/dashboard/intern/monthly-reviews/history/`**

Same data, pagination, search and sorting as [`GET monthly-reviews/`](#list-my-reviews).

**Roles:** `Intern`

---

## 6. Admin: list monthly reviews

**`GET /api/v1/dashboard/manage-interns/reviews/monthly/`**

Every intern's monthly reviews, newest month first.

**Roles:** `Admin`, `Intern Lead`

**Query params:**

| Param | Required | Description |
|-------|----------|-------------|
| `status` | No | `PENDING`, `APPROVED`, `REJECTED` |
| `year` | No | 2000–2100 |
| `month` | No | 1–12 |
| `muid` | No | Exact intern muid |
| `search` | No | Searches intern name, muid, team |
| `sortBy` | No | `created_at`, `year`, `month`, `status` |
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
        "id": "review-uuid-001",
        "user_id": "user-uuid-001",
        "user_name": "Jane Doe",
        "muid": "jane-doe@mulearn",
        "year": 2026,
        "month": 11,
        "period_start": "2026-11-01",
        "period_end": "2026-11-30",
        "team": "Frontend Team",
        "tasks_completed": [],
        "monthly_review": "Learnings: Learned how to structure React forms and handle API errors.",
        "task_remarks": {
          "rating": 4,
          "learnings": "Learned how to structure React forms and handle API errors.",
          "challenges_faced": null,
          "next_month_plan": null
        },
        "blockers": null,
        "leave_days": 2,
        "suggestions": null,
        "status": "PENDING",
        "reviewed_by_id": null,
        "reviewed_at": null,
        "review_note": null,
        "created_at": "2026-11-29T10:15:00Z",
        "updated_at": "2026-11-29T10:15:00Z"
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

**Error — bad filter:** `Invalid month. Use a number from 1 to 12.` / `Invalid year. Use a number from 2000 to 2100.`

---

## 7. Admin: review detail, approve, reject

### Get one review

**`GET /api/v1/dashboard/manage-interns/reviews/monthly/<review_id>/review/`**

**Roles:** `Admin`, `Intern Lead`

**Success response:** one item in the same shape as the [admin list](#6-admin-list-monthly-reviews).

**Error:** `Monthly review not found.`

---

### Approve or reject

**`PATCH /api/v1/dashboard/manage-interns/reviews/monthly/<review_id>/review/`**

Only `PENDING` reviews can be reviewed. Reviewing is also allowed after the window has closed, but the intern can only resubmit a rejected review while the window is open.

An approved review shows in the intern's Quest Log.

**Roles:** `Admin`, `Intern Lead`

**Request body:**

```json
{
  "action": "approve",
  "review_note": "Good month."
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `action` | Yes | `approve` or `reject` |
| `review_note` | No | Text, max 300 characters |

**Success response:**

```json
{
  "hasError": false,
  "statusCode": 200,
  "message": { "general": ["Monthly review approved successfully."] },
  "response": {
    "id": "review-uuid-001",
    "user_id": "user-uuid-001",
    "user_name": "Jane Doe",
    "muid": "jane-doe@mulearn",
    "year": 2026,
    "month": 11,
    "period_start": "2026-11-01",
    "period_end": "2026-11-30",
    "team": "Frontend Team",
    "tasks_completed": [],
    "monthly_review": "Learnings: Learned how to structure React forms and handle API errors.",
    "task_remarks": {
      "rating": 4,
      "learnings": "Learned how to structure React forms and handle API errors.",
      "challenges_faced": null,
      "next_month_plan": null
    },
    "blockers": null,
    "leave_days": 2,
    "suggestions": null,
    "status": "APPROVED",
    "reviewed_by_id": "admin-uuid-001",
    "reviewed_at": "2026-12-01T06:00:00Z",
    "review_note": "Good month.",
    "created_at": "2026-11-29T10:15:00Z",
    "updated_at": "2026-12-01T06:00:00Z"
  }
}
```

With `"action": "reject"`, `status` becomes `REJECTED`.

**Errors:**

| Case | Message |
|------|---------|
| `action` missing or not `approve` / `reject` | `Invalid action. Must be 'approve' or 'reject'.` |
| `review_note` not text | `review_note must be text.` |
| `review_note` too long | `review_note cannot exceed 300 characters.` |
| Not found, or not `PENDING` | `Pending monthly review not found.` |
