# Add per-route bundle budgets to CI

| | |
|---|---|
| ID | 0029 |
| Phase / milestone | Phase 2: Serving and runtime |
| Module | platform |
| Size | M |
| Labels | arch, phase:2, module:platform, type:chore, size:M |
| Depends on | none |
| Backend | none |
| Blocks | none |
| Repos | mulearn-dashboard |

## Why

The dashboard is used on mid-range phones over mobile data, and nothing stops a pull request from adding a large dependency to every page. A per-route budget makes growth visible and deliberate ([09-performance.md](../09-performance.md#bundle-budgets)).

## Before you start

- Read [Bundle budgets](../09-performance.md#bundle-budgets).
- Run `bun run build` and look at what it writes to `.next/`.

## What to do

1. Create `scripts/check-bundle-budgets.ts`. After `bun run build`, it reads the per-route client JavaScript from the build output in `.next/`, and sums the gzipped size of what each route group loads first. Record in the script's header comment which Next 16.2 build files it reads. Follow the [Rules for the check scripts](README.md#rules-for-the-check-scripts).
2. Create `scripts/allowlists/bundle-budgets.json` from the first measurement, plus 5% headroom per route group.
3. Exit 1 when a route group goes over its budget, printing the route and both sizes.
4. Add a step to the `build` job in `.github/workflows/ci.yml` that runs it after the build.
5. If the build output doesn't give reliable per-route sizes (Next 16 builds with Turbopack), stop after step 1: post what the output contains on the issue. It then becomes a spike, and the maintainers decide how to measure.

## Acceptance criteria

- [ ] The step prints each route group's size on this pull request.
- [ ] On a throwaway branch, importing a large library into the shared layout fails the step.

## How to test

```sh
bun run build
bun scripts/check-bundle-budgets.ts
```

## Out of scope

- Reducing any bundle.

## Notes for reviewers

Check the measurement is stable between two builds of the same commit.
