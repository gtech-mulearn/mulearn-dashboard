# contributions

Describes `dev` at 6d6cb30b (17 Nov 2026), and what changes.

## Purpose

Discord moderator karma actions, and the task-verification screens that approve or reject submitted work.

## Backend module

[contributions](https://github.com/gtech-mulearn/mulearnbackend/blob/dev/docs/architecture/modules/contributions.md): submissions, appraisal and the karma ledger.

## Feature folders and routes

- `src/features/discord-moderation/`: Discord moderator karma actions; the backend moves this to contributions. Routes: `/dashboard/management/discord-moderation`.
- Also: `src/features/tasks/` (owned by learning) calls this module's endpoints: task management; its verification screens call contributions endpoints.

## Page access

Decided today by the page-access layers in `src/lib/auth`, from every role a user holds: the route map that `src/proxy.ts` checks, `requireRole` on server pages, and `RoleGate` in components. The target rule is in [Page access](../08-auth-and-access.md#page-access).

## Backend endpoints called today

Endpoint groups from `src/api/endpoints.ts`, most used first:

- `endpoints.admin` (for example `/api/v1/dashboard/task/`)
- `endpoints.discordModeration` (for example `/api/v1/dashboard/discord-moderator/pendingcounts/`)

## Imported from outside

Nothing outside the module imports it.

## What changes

No dashboard issue in the first 12 weeks. Later work is in the epics ([github-issues/](../github-issues/README.md)).

## Tests this module needs

- Component tests for the moderation and verification actions: success, refusal, and a temporary 503.
- Contract tests for the moderation endpoints' responses.

## Open questions

- The backend moves karma writes onto its ledger (its Phase 4) without changing these routes or responses; if a response changes later, it gets a tracker row.
