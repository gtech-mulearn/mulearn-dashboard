# shared-lib

Describes `dev` at 6d6cb30b (17 Nov 2026), and what changes.

## Purpose

Framework-light helpers, shared hooks, UI stores, error logging and test utilities.

## Backend module

None: a shared layer.

## Feature folders and routes

- Code: `src/lib/` (except `auth/`), `src/hooks/`, `src/stores/`, `src/test-utils/`, `src/lib/error-handling/`.

## Page access

Not applicable: this is a shared layer.

## Backend endpoints called today

Not applicable: a shared layer.

## Imported from outside

- Shared layer: imported throughout the app. It must never import a feature ([Import rules](../04-module-rules.md#import-rules), rule 4).

## What changes

- [0026](../github-issues/0026-sentry-adapter.md) Add a Sentry adapter to the error-logging service

## Tests this module needs

- The Sentry adapter keeps personal fields out of reports (issue 0026).

## Open questions

None yet.
