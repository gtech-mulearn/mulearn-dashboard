# Performance

What keeps the dashboard fast on the devices learners actually use, many of them mid-range phones on mobile data. Facts about today describe `dev` at 6d6cb30b.

## Targets

| Measure | Target | Where it's checked |
|---|---|---|
| JavaScript a route loads first | within the route's budget in CI (set from the first measured build, then only lowered) | the bundle-budget issue's CI step |
| Largest Contentful Paint on the dashboard home, mid-range phone, 4G | under 2.5 s | manual check before a release, until a lab run is automated |
| Rows a list requests at once | at most 100 | review, and the backend's planned page cap |
| A user waiting on a cut-off request | sees a retry option within the backend's 10 s limit | [11-reliability-and-observability.md](11-reliability-and-observability.md) |

## What the app does well today

- **Response compression** is on, the `X-Powered-By` header is off, and images use AVIF and WebP (`next.config.ts`).
- **Server data is cached** by TanStack Query, and results count as fresh for 60 seconds (`src/app/providers.tsx`), so moving between pages doesn't refetch everything.
- **Some heavy parts load on demand:** 7 files use `next/dynamic`.

## Rules

1. **Load heavy components on demand.** Charts (Recharts, used in 12 files), editors, croppers and QR generation load with `next/dynamic` on the pages that use them, not in shared layouts.
2. **Keep shared layouts light.** Anything imported by the app shell or `src/app/(dashboard)/layout.tsx` is paid for on every page.
3. **Page long lists.** Request at most 100 rows. For lists users scroll through, use `useInfiniteQuery`. Render very long lists with windowing, so only visible rows are in the DOM.
4. **Don't build big files in the browser.** Exports over a few thousand rows become backend jobs (the backend's Phase 8). Until then an export page states its limit.
5. **Prefer server rendering for the first view of data-heavy pages** only where it measurably helps. The default stays client-side, as today ([ADR-007](adr/ADR-007-browser-calls-backend-directly.md)).
6. **Measure before and after.** A performance change states the measure it moved.

## Bundle budgets

- **Measure first.** A CI step records the JavaScript each route loads, from the production build's output.
- **Set budgets from the first measurement,** per route group.
- **A pull request that goes over a budget fails,** with the routes and sizes in the log. Raising a budget needs a reviewer to agree, and the pull request says why.
