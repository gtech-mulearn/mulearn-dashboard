# ADR-015: The design system is a building block

Status: Accepted
Date: 2026-11-21
Implementation status at dev 6d6cb30b: in flight, outside the pin: design-system work exists on a separate branch and as uncommitted files; `src/components/ui` holds today's components.

## Context

A design system is being prepared separately, and its screen changes wait for the maintainer's approval of the design. The architecture shouldn't duplicate it or set visual rules of its own.

## Options considered

- **Treat the design system as a building block with its own page, and keep screen changes in one epic gated on approval.**
- **Write visual rules into the architecture docs.** Would compete with the design work.

## Decision

- A new `src/components/design-system/` folder is the target home; features use components from there once it lands.
- No architecture issue changes screens; the "Adopt the design system" epic waits for the approval.

## Consequences

- Feature work in the 12 weeks doesn't restyle anything.

## Revisit when

- The design is approved.

## Related ADRs

- [ADR-001: One app with strict feature modules](ADR-001-one-app-strict-feature-modules.md)
