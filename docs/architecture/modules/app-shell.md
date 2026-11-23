# app-shell

Describes `dev` at 6d6cb30b (17 Nov 2026), and what changes.

## Purpose

The app's frame: layouts, route groups, loading and error boundaries, navigation and the sidebar.

## Backend module

None: a shared layer.

## Feature folders and routes

- Code: `src/app/` layouts and route groups, `src/app/error.tsx`, `src/app/global-error.tsx`, `src/app/not-found.tsx`, `src/components/layout/`, `src/components/dashboard/`.

## Page access

Not applicable: this is a shared layer.

## Backend endpoints called today

Not applicable: a shared layer.

## Imported from outside

- Shared layer: imported throughout the app. It must never import a feature ([Import rules](../04-module-rules.md#import-rules), rule 4).

## What changes

- [0019](../github-issues/0019-request-id-in-error-states.md) Show the request id in error states
- [0025](../github-issues/0025-error-boundaries.md) Add error boundaries to dashboard sections

## Tests this module needs

- Error-boundary tests: a failing section shows `SectionErrorFallback` with a retry and the rest of the page stays usable (issue 0025).
- A test that error fallbacks and error toasts show the request id when there is one (issue 0019).

## Open questions

None yet.
