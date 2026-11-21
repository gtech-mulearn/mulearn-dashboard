# design-system

Describes `dev` at 6d6cb30b (17 Nov 2026), and what changes.

## Purpose

Shared components today, and the design system once it is approved.

## Backend module

None: a shared layer.

## Feature folders and routes

- Code: `src/components/ui/` today; a new `src/components/design-system/` folder as the target.

## Page access

Not applicable: this is a shared layer.

## Backend endpoints called today

Not applicable: a shared layer.

## Imported from outside

- Shared layer: imported throughout the app. It must never import a feature ([Import rules](../04-module-rules.md#import-rules), rule 4).

## What changes

No dashboard issue in the first 12 weeks. Later work is in the epics ([github-issues/](../github-issues/README.md)).

## Tests this module needs

- Accessibility checks on each component (keyboard, labels, focus), as in [07-ui-and-design-system.md](../07-ui-and-design-system.md).

## Open questions

- The design's approval gates the "Adopt the design system" epic.
