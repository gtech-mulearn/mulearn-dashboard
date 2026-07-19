# Task → Event Linkage: Migrating off the Legacy `event` String

**Date:** 2026-07-19
**Status:** Approved, ready for implementation planning

## Problem

The task create/edit form's "Event" dropdown offers `None / LearningFest / Top100`. Those
three values come from a hardcoded Python enum, not the database, so events created in the
events module can never appear there.

`api/dashboard/task/dash_task_view.py:943`

```python
def get(self, request):
    events = Events.get_all_values()
    return CustomResponse(response=events).get_success_response()
```

`utils/types.py:120`

```python
class Events(Enum):
    LEARNING_FEST  = "LearningFest"
    TOP_100_CODERS = "Top100"
```

The enum is also out of sync with reality: production queries `"launchpad"` and `'TOP100'`,
neither of which the dropdown offers (note the casing difference from `Top100`). An admin
picking from this control cannot produce a value any consumer matches.

## Two separate concepts

`TaskList` carries both fields already (`db/task.py:138-140`):

```python
event    = models.CharField(max_length=50, null=True)
event_fk = models.ForeignKey("db.Event", on_delete=models.SET_NULL, null=True, blank=True,
                             db_column="event_id", related_name="task_list_events")
```

| | `event` (legacy) | `event_fk` (new) |
| --- | --- | --- |
| Type | free string, max 50 | FK to `events` table, indexed |
| Meaning | campaign tag | real scheduled event |
| Values | `launchpad`, `TOP100` | UUIDs |
| Set via | task form dropdown | nothing — unexposed in UI |

## The legacy field is live

It is not dead code. Verified consumers:

- **Launchpad — 24 sites.** `task__event="launchpad"` appears 17 times across
  `api/launchpad/launchpad_views.py` and `api/launchpad/serializers.py`, plus
  `TaskList.objects.filter(event="launchpad")` at `launchpad_views.py:2226`.
- **Achievement rule engine.** `api/dashboard/achievement/rule_engine.py:136` registers an
  `"event"` rule type; line 299 evaluates `task__event=event_name, appraiser_approved=True`.
- **Top100.** `api/top100_coders/top100_view.py:65` — raw SQL, `tl.event = 'TOP100'`.

Company jobs do **not** use it. The only hit in the company module is a passthrough entry in
a serializer `fields` list (`company/task_serializers.py:110`); no company code filters on it.

## Decisions

1. **End state:** coexist, then retire. The legacy string is frozen — nothing writes to it
   after this change — and the column is dropped once the campaigns reading it end. There is
   no dual-writing: a task carries either a campaign tag (historical) or an event link (new),
   never both.
2. **Backfill:** new tasks only. Historical rows keep their string and a null `event_fk`.
3. **Form:** the legacy control is **removed entirely**. Only the new event linkage is
   offered. Future Top 100 or Launchpad-style campaigns are created as real events.
4. **Picker scope:** events the caller is permitted to manage.
5. **Coupling:** none. `event` and `event_fk` do not validate against each other.

### Consequence accepted

No new Launchpad/Top100 tasks can be created through the UI. Existing ones keep their tags
and keep working. This is intentional: new campaigns use the events module instead.

## The backend is already migrated

This is a frontend change plus one additive endpoint and one validator.

`api/dashboard/task/dash_task_serializer.py:16,43,92` already accept the linkage:

```python
event_id = serializers.CharField(source="event_fk_id", required=False, allow_null=True)
```

`api/dashboard/task/dash_task_view.py` already reads through it end to end: selects
`event_fk` (line 70), filters `event_fk_id` (142), scopes to `accessible_event_ids`
(149, 166), searches `event_fk__title` (212), sorts by it (228), and separates event-linked
from regular tasks with correct visibility rules (152-168).

No reader migration is required. A task created after this ships has `event = NULL` and
`event_fk = <uuid>`, so `task__event="launchpad"` simply does not match it — which is
correct, because it is not a Launchpad task.

## Design

### New endpoint

`GET /api/v1/dashboard/events/meta/linkable-events/`

Returns events the caller may attach tasks to. Reuses the predicate the task list already
trusts: `get_live_events()` filtered by the caller's `scope_filter`, status in
`PUBLISHED`/`ONGOING`. Supports `?search=`.

```json
[{ "id": "<uuid>", "title": "MuFiFA 2026", "start_datetime": "2026-08-01T10:00:00Z" }]
```

Sharing the predicate is load-bearing. If the picker offered an event that the task view's
`accessible_event_ids` check later rejected, an admin could create a task that immediately
disappeared from their own list.

### Form changes

| Control | Before | After |
| --- | --- | --- |
| Event | `Events` enum → `event` string | removed |
| Linked Event | — | searchable picker → `event_id` |

The picker shows title and start date to disambiguate repeated event names, and allows
"None" because `event_id` is optional.

### Payload rule

```
create:  { ...task, event_id: <uuid> | null }
edit:    { ...changed fields, event_id: <uuid> | null }
```

The `event` key must be **absent** from both payloads — not `null`, not `""`.

`dash_task_view.py:478` builds the update with `partial=True`, so an omitted key is left
untouched, preserving campaign tags on historical tasks. Sending `event: ""` would erase
the tag on every edit of a Launchpad task. This is the single most important implementation
constraint.

### Validation gap to close

`event_id` is a bare `CharField` with no existence or access check. A non-existent UUID hits
the FK constraint and surfaces as a 500; a valid-but-inaccessible UUID creates a task the
admin cannot then see.

Add `validate_event_id` to `TaskModifySerializer`, resolving against the same
`get_live_events()` + scope predicate as the picker, returning 400 otherwise. Additive and
safe: the field stays optional, so existing callers are unaffected.

### Error handling

If `linkable-events` fails, the picker shows an inline error and remains usable with "None"
selected. Task creation must not be blocked, because the linkage is optional.

## Testing

The payload rule can cause data loss, so it gets a real test:

- Editing a task whose `event` is `'launchpad'` produces a payload with no `event` key —
  `expect(payload).not.toHaveProperty("event")`
- `event_id` is present when an event is picked
- `event_id` is `null` when the selection is cleared

Vitest covers the frontend. **The backend has no test harness** — no pytest, no `tests.py`,
no conftest. `validate_event_id` will be verified by hand against a real UUID, a bogus UUID,
and an inaccessible one. No automated backend coverage is claimed.

## Rollback

Every piece is additive: a new endpoint, a new optional field, one control removed from a
form. Reverting the frontend commit restores prior behaviour with no data migration, because
nothing writes to `event` either way.

## Explicitly out of scope

- Backfilling `event_fk` on historical rows
- Touching the Launchpad, achievement, or Top100 readers
- Mutual-exclusion validation between `event` and `event_fk`
- Dropping the `event` column
- The empty `categories` lookup table used by the events wizard — unrelated, tracked
  separately
