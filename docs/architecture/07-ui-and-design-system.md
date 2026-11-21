# UI and the design system

How components are organised, where the design system fits, and the accessibility baseline every screen keeps. This page sets no visual rules; those belong to the design system ([ADR-015](adr/ADR-015-design-system-building-block.md)). Facts about today describe `dev` at 6d6cb30b.

## Components today

- **`src/components/ui`** is the base set. It is built on Radix primitives with Tailwind CSS and `class-variance-authority`, and holds shared pieces such as `StateDisplay` (`src/components/ui/state-display.tsx`) for not-found, no-results and no-tasks states, and the error fallbacks in `src/components/ui/errors/`.
- **`src/components/layout`, `dashboard`, `charts` and `auth`** hold the app shell, dashboard widgets, charts (Recharts) and auth screens' shared parts.
- **Feature components** live in each feature's `components/` folder and are exported through its `index.ts` when other code needs them.

## The design system

- A design system is being prepared separately: on its own branch, and as files not yet in `dev`.
- **Its target home** is a new `src/components/design-system/` folder. Once it lands, shared components come from there, and `src/components/ui` shrinks as pieces move.
- **Screen changes wait for the maintainers to approve the design.** No architecture issue restyles a screen. That work is one epic, "Adopt the design system" ([github-issues/](github-issues/README.md)), with approval as its entry condition.

## Rules for components

1. **Reuse before adding.** Check `src/components/ui` (and the design system once it lands) before writing a new shared component.
2. **A component used by two features is shared,** and lives in `src/components/`, not in one of the features.
3. **Components don't fetch.** They read hooks ([05-data-fetching-and-state.md](05-data-fetching-and-state.md)).
4. **Components don't decide access themselves.** Page access comes from the route map and `requireRole`. Inside a page, `RoleGate` and `src/hooks/use-permissions.ts` hide what a user can't use, with named role groups, never inline role names ([08-auth-and-access.md](08-auth-and-access.md)).
5. **Every list has a loading, an empty and an error state,** using `SectionErrorFallback` or `InlineErrorFallback` for the error and `StateDisplay` for the empty state.

## Accessibility baseline

Every new or changed screen keeps these:
- **Keyboard:** every action can be reached and used with the keyboard, focus is visible, and dialogs trap and return focus. The Radix primitives do most of this; don't override it.
- **Labels:** every input has a visible label or an `aria-label`, and icon-only buttons have an accessible name.
- **Structure:** one `h1` per page, headings in order, and landmarks from the app shell.
- **Feedback:** errors are announced next to the field they belong to, not only as a toast.
- **Motion:** animations respect `prefers-reduced-motion`.
- **Colour** is never the only signal. Contrast comes from the design system's tokens.

## Rendering user content

Markdown from users is rendered through `react-markdown` with `rehype-sanitize`. Never insert user or backend content as raw HTML. This is also part of the token-storage decision ([ADR-008](adr/ADR-008-token-storage.md)).
