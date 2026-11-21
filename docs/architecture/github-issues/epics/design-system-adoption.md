# Adopt the design system

| | |
|---|---|
| Epic | design-system-adoption |
| Phase / milestone | Later: on demand |
| Labels | arch, phase:later, type:epic |

## What it will contain

- Land the design system in a new `src/components/design-system/` folder.
- Move shared components from `src/components/ui` to it, one component family per issue.
- Restyle screens module by module, with the accessibility baseline in [07-ui-and-design-system.md](../../07-ui-and-design-system.md) checked on each.

## Entry conditions

The maintainers approve the design.

## Exit criteria

- Every screen uses the design system's components and tokens.
- `src/components/ui` holds nothing the design system replaces.
