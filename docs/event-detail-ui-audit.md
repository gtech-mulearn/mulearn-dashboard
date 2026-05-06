# Event Detail Page — UI Audit & Revamp Specification

> **Scope:** `src/features/events/components/event-detail-view.tsx` → `/dashboard/events/[id]`  
> **Goal:** Rebuild the event detail page to match the dashboard design language — semantically correct token usage, full dark mode support, Apple-level visual hierarchy, UI psychology to drive registration intent.  
> **Authored:** 2026-05-06

---

## 1. Design System Reference

### 1.1 Token Tiers — The Law of Color Choice

Every color decision falls into one of three tiers. **Always start at Tier 1. Only drop to Tier 2 or 3 when Tier 1 cannot express the intent.**

```
Tier 1 — Semantic tokens   → Adapt automatically to light/dark mode. Always prefer.
Tier 2 — Brand palette     → Stable across modes; require dark: variants on text.
Tier 3 — Absolute colors   → Only for photo overlays and always-dark panels.
```

Mixing tiers arbitrarily is the root cause of every dark mode bug in the current code.

---

### 1.2 Tier 1 — Semantic Tokens (CSS Custom Properties)

These are defined in `globals.css` and mapped via `@theme inline`. Use the Tailwind class, never the raw hex.

| Tailwind class | Light value | Dark value | When to use |
|---|---|---|---|
| `bg-background` | `#fefefe` | `oklch(0.145 0 0)` | Page root surface |
| `bg-card` | `#fefefe` | `oklch(0.185 0 0)` | Cards, panels — slightly elevated from bg in dark |
| `bg-muted` | `#f1f5f9` | `oklch(0.23 0 0)` | Chip backgrounds, de-emphasized surfaces |
| `text-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Primary text |
| `text-muted-foreground` | `oklch(0.556 0 0)` | `oklch(0.72 0 0)` | Secondary/caption text |
| `text-card-foreground` | same as foreground | same as foreground | Text inside cards |
| `border-border` | `#e2e8f0` | `oklch(0.26 0 0)` | All card and component borders |
| `bg-primary` | `#000000` | `#fefefe` | ⚠️ Primary buttons, active fills — INVERTS between modes |
| `text-primary` | `#000000` | `#fefefe` | ⚠️ On bg-primary — also inverts |
| `text-primary-foreground` | `oklch(0.985 0 0)` | `oklch(0.145 0 0)` | Text ON a bg-primary surface |
| `bg-destructive` | `#f44336` | `#f44336` | Errors, cancelled, blocked |
| `text-destructive` | `#f44336` | `#f44336` | Destructive text (stable, no dark variant needed) |
| `bg-accent` | `#f1f5f9` | `oklch(0.23 0 0)` | Hover states |
| `text-accent-foreground` | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` | Text on accent |

> **⚠️ Critical:** `bg-primary` and `text-primary` INVERT between modes — black on light, white on dark. Never use `text-primary` as a readable label on `bg-card`. Use `text-foreground` instead. Only use `text-primary` on `bg-primary` surfaces, where `text-primary-foreground` handles the contrast.

---

### 1.3 Tier 1 — Extended Semantic Tokens

These are registered in `@theme inline` from globals.css and are directly usable:

| Tailwind class | Value (both modes) | When to use |
|---|---|---|
| `bg-success` / `text-success` | `#4caf50` | Success states, confirmed-going, eligible-karma |
| `bg-warning` / `text-warning` | `#ff8d0c` | Deadline warnings, bonus karma time alerts |
| `bg-brand-purple` / `text-brand-purple` | `#8f44ed` | IG-specific accents, task section branding |
| `bg-brand-blue` / `text-brand-blue` | `#2e85fe` | Scope/campus chips |

> These are stable across modes (same hex in both). Prefer these over raw Tailwind palette colors like `bg-emerald-500` when the intent is semantic. Example: karma eligibility = `text-success`, not `text-emerald-600`.

---

### 1.4 Tier 2 — Brand Palette (Tailwind fixed colors)

Use these when Tier 1 doesn't express the exact visual intent. These are fixed hues — they don't change between modes — so **text always needs a `dark:` variant** because the chip background shifts between modes.

| Color family | bg chip | text (light) | text (dark) | Use for |
|---|---|---|---|---|
| indigo | `bg-indigo-500/15` | `text-indigo-600` | `dark:text-indigo-400` | Primary CTA accent, scope chips |
| emerald | `bg-emerald-500/15` | `text-emerald-600` | `dark:text-emerald-400` | Going count, active state, open roles |
| amber | `bg-amber-500/15` | `text-amber-600` | `dark:text-amber-400` | Deadlines, bonus karma, warnings |
| violet | `bg-violet-500/15` | `text-violet-600` | `dark:text-violet-400` | Tasks, IG, karma points |
| rose | `bg-rose-500/15` | `text-rose-600` | `dark:text-rose-400` | Blocked registration, closed |
| blue | `bg-blue-500/15` | `text-blue-600` | `dark:text-blue-400` | Upcoming status, campus scope |
| slate | `bg-slate-500/15` | `text-slate-600` | `dark:text-slate-400` | Ended/neutral status |
| zinc | `bg-zinc-500/15` | `text-zinc-600` | `dark:text-zinc-400` | Inline-office remote policy |

**Pattern for all color chips in this codebase:**
```tsx
// ✅ Correct — readable in both modes
<span className="rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
  Campus Event
</span>

// ❌ Wrong — text-indigo-600 is too dark on the dark-mode chip background
<span className="rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-xs font-semibold text-indigo-600">
  Campus Event
</span>
```

The `/15` opacity on the background adapts automatically — on light mode it's a soft indigo tint; on dark mode over `bg-card` (`oklch(0.185)`) it's a slightly visible tint. The text is what needs explicit adjustment.

---

### 1.5 Tier 3 — Absolute Colors (photo overlays only)

Use these ONLY when overlaying text on a photograph or an always-dark surface. Never on cards.

| Class | Why absolute | Use for |
|---|---|---|
| `bg-zinc-900` | Explicit dark — same in both modes | Dark hero panels, company hero card |
| `from-black/{opacity}` | Pure black — identical in both modes | Photo gradients |
| `bg-black/{opacity}` | Pure black overlay | Frosted glass backing for photo overlays |
| `bg-white/{opacity}` | Pure white frosted glass | Text chips over photos |
| `text-white` | Always white — use only on dark/photo backgrounds | Title text over dark banner |

> **Never use `bg-foreground`, `from-foreground`, or `bg-primary` for photo overlays.** These tokens invert in dark mode — `--foreground` is near-black in light and near-white in dark. `from-foreground/85` over a photo means the gradient goes near-white in dark mode, making the image invisible. This is the #1 bug in the current event detail view.

---

### 1.6 Utility Classes from globals.css

These are available and should be used instead of duplicating their values:

```css
.lc-card-shadow      → 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)
.lc-card-shadow-hover → 0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)
.lc-fade-in          → opacity 0→1 over 300ms ease
.lc-slide-up         → fade + translateY(12px→0) over 400ms cubic-bezier
.lc-gradient-cta     → linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%) — indigo→violet
.ig-status-active    → color-mix(--chart-2, --background) — semantic, adapts to mode
.ig-status-requested → color-mix(--chart-4, --background) — semantic, adapts to mode
.ig-status-rejected  → color-mix(--destructive, --background) — semantic, adapts
```

> **Note:** `lc-card-shadow` uses `rgba(0,0,0,…)` — this is invisible in dark mode (black shadow on dark card). In dark mode, elevation is expressed through `bg-card` being lighter than `bg-background` (already set in the token system), not through shadows. Use `shadow-sm` (Tailwind) which is `box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)` — still works in dark, just subtler, which is correct behavior.

---

### 1.7 Anti-Patterns — What Must Never Appear in the Revamp

| Anti-pattern | Why broken | Fix |
|---|---|---|
| `from-foreground/85` on photos | Inverts: near-white gradient in dark mode | `from-black/70` |
| `bg-[color-mix(in_srgb,var(--primary)_12%,var(--background))]` inline | One-off, unauditable, duplicates utility layer | Use `bg-primary/10` or add a named utility |
| `bg-gray-50` hardcoded | Invisible in dark mode (`gray-50` ≈ white) | `bg-muted` |
| `text-gray-500` hardcoded | Doesn't adapt; use semantic `text-muted-foreground` | `text-muted-foreground` |
| `border border-black/6` or `lc-card-border` | `rgba(0,0,0,0.06)` invisible on dark | `border-border` |
| `lc-section-label` with hardcoded `color: #9ca3af` | Fixed gray, loses fidelity in dark mode | `text-muted-foreground text-xs font-semibold uppercase tracking-wider` |
| `text-indigo-600` without `dark:text-indigo-400` | Fails contrast on dark chip backgrounds | Add `dark:text-indigo-400` |
| `text-emerald-600` without `dark:text-emerald-400` | Same | Add `dark:text-emerald-400` |

---

### 1.8 Card Anatomy (canonical — use everywhere)

```tsx
// ✅ Every section card uses this exact shell
<div className="rounded-2xl border border-border bg-card shadow-sm">
  {/* Header */}
  <div className="flex items-center gap-2.5 px-5 py-4">
    <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-500/10">
      <Icon className="size-4 text-indigo-500" />
    </div>
    <h2 className="text-base font-bold text-foreground">Section Title</h2>
  </div>
  {/* Content */}
  <div className="px-5 pb-5 pt-0">
    {/* content */}
  </div>
</div>
```

- `bg-card` — not `bg-white`, not `bg-background`
- `border-border` — not hardcoded, not `lc-card-border`
- `shadow-sm` — not `lc-card-shadow` (the lc shadow is invisible in dark mode)
- `text-foreground` on section title — not `text-gray-900` or `text-black`

---

### 1.9 Spacing Rhythm

```
Page sections gap:   space-y-5
Card internal:       px-5 py-4 (header), px-5 pb-5 pt-0 (content)
Grid gutter:         gap-5
Main layout:         grid lg:grid-cols-[minmax(0,1fr)_360px] gap-5
Sidebar gap:         space-y-4 (tighter than page — sidebar items are related)
```

---

## 2. Executive Audit — What's Broken & Why It Matters

### 2.1 Banner gradient — broken in dark mode

**Current:**
```tsx
<div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/50 to-transparent" />
```

**The bug:**
`--foreground` is `oklch(0.985 0 0)` in dark mode — near-white. So in dark mode, the gradient goes from 85% near-white at the bottom to transparent at the top. The result: the bottom half of the hero image is covered by a bright white wash. The title text (`text-primary-foreground`) on top of this near-white overlay — also white — becomes invisible. The entire hero is broken in dark mode.

**Psychology problem beyond dark mode:**  
The gradient at `from-foreground/85` is also too heavy in light mode (near-black at 85%). It kills the event photo — the single strongest trust signal on the page. Apple never dims their product photography below 50% opacity at the bottom. The image is supposed to sell the event; burying it in black defeats the purpose.

**Fix:**
```tsx
// from-black is absolute zero — same in both modes, safe on photos
<div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
```

---

### 2.2 Info architecture — no visual hierarchy

**Current:**  
Date, time, venue, scope, format, and organizer all share one `flex-wrap` row at the banner bottom with identical `text-sm text-white/90` weight. The eye has nowhere to land.

**Psychology problem:**  
F-pattern reading: users scan top-left to bottom-right. When everything is the same size and color, the brain can't prioritize. The most important questions ("Is this for me? When? Where?") drown in the meta soup.

**Fix:** Move all meta out of the banner into a structured identity bar below it. The banner becomes pure emotion — just the title and tags. The bar handles information.

---

### 2.3 CTA sidebar — weak intent signal

**Current:**  
"Quick Actions" card with a plain `Register Now` button. Karma gate hidden behind a tooltip icon. No deadline visibility. No urgency signal.

**Psychology problems:**
- "Quick Actions" is a developer noun. Users need: "How do I join?"
- Karma gate discovered only after clicking a disabled button — error after intent, not before
- Registration deadline is in the API; showing it as a countdown is a trivial implementation that directly converts

**Fix:** Purpose-built Registration Card — status pill, deadline countdown bar, karma gate inline, social proof adjacent to the CTA button.

---

### 2.4 Sidebar cards — wrong token usage

**Current:**  
`bg-[color-mix(in_srgb,var(--primary)_12%,var(--background))]` inline on the analytics panel — unauditable, not reusable, not dark-mode-tested. Sidebar cards use no icon boxes — inconsistent with every other dashboard section.

**Fix:** Canonical card anatomy. Every card gets the `size-9 rounded-xl bg-{color}/10` icon box header. Remove all inline `color-mix` values.

---

### 2.5 Linked tasks — semantic failure

**Current:**
```tsx
<div className="rounded-md border p-3">
  <p className="font-mono text-xs text-muted-foreground">#{task.hashtag}</p>
  <Badge variant="secondary">{task.karma} karma</Badge>
</div>
```

`rounded-md border p-3` — not rounded-xl, not bg-card, no token usage. `Badge variant="secondary"` has no color meaning for karma. The task feels like a database entry, not a reward.

**Fix:** `rounded-xl border-border bg-muted/40 p-4` per task. Karma chip uses `bg-emerald-500/15 text-emerald-600 dark:text-emerald-400`. Bonus uses `bg-amber-500/15 text-amber-600 dark:text-amber-400`. Hashtag gets a styled pill, not monospace text.

---

### 2.6 Collaborator orgs — invisible content

**Current:**  
`rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm` — text-only chip, no logo, no type indicator. Collaborating orgs are a significant trust signal. A user from "WebDev IG @ College of Engineering" will scan for their campus.

**Fix:** Logo (initials fallback with gradient) + name + collab type label per row.

---

### 2.7 Map section — wrong column

**Current:**  
Map iframe (192px) is in the sidebar. Sidebar width is 360px on desktop; map at 360px minus padding = ~320px visible. On mobile, the map is hidden with the sidebar.

**Fix:** Move map to the main content column. Full-width (`w-full h-52 rounded-xl overflow-hidden`). "Get Directions" button below. On mobile it becomes visible and full-bleed — event attendees on mobile are the primary map users.

---

### 2.8 Mobile sticky bar — disorienting

**Current:**  
A full-width Register + Interest button bar. No event context. A user who has scrolled 80% of the page sees two buttons with no label — they don't know what they're registering for.

**Fix:** Left panel: truncated event title + date chip. Right: single indigo "Register →" pill.

---

### 2.9 Loading skeleton — no spatial promise

**Current:**  
Three `<Skeleton>` elements: one 192px block, one text line, one 96px block. Gives no information about what the layout will look like.

**Fix:** Skeleton mirrors the actual layout — banner aspect ratio, identity bar pill row, two-column split, sidebar card outlines.

---

### 2.10 Missing elements

| Missing | User impact |
|---|---|
| Event status (Upcoming / Live / Ended) | User has no context on temporal relevance |
| Registration deadline countdown | The most direct conversion lever — absent entirely |
| Karma gate inline before CTA | Users blocked from registering discover this only after clicking |
| Back navigation | No breadcrumb or back button — disorienting in deep navigation |
| Featured badge with proper visual weight | Buried `<Badge>` — same visual weight as a tag |

---

## 3. Section-by-Section Revamp Specification

### Section A — Hero Banner

**Token contract:**
- `bg-zinc-900` as fallback (always dark, safe in both modes)
- `from-black/75 via-black/30 to-transparent` for gradient (absolute, not semantic)
- `text-white` for all text over the photo (absolute, for photo context)
- `bg-black/30 backdrop-blur-sm border border-white/15` for frosted glass overlays
- `bg-white/15 backdrop-blur-sm border border-white/20` for tag chips (light frosted glass)
- `bg-amber-400/90 text-amber-900` for featured badge (readable on both light/dark photos)

```
┌─────────────────────────────────────────────────────────────────┐
│ [← back]  [✦ Featured]              [↗ Share]  [Logo · OrgName] │  top row
│                                                                   │
│         EVENT PHOTO  bg-zinc-900 fallback                         │
│                                  ↑ from-black/75 gradient rising  │
│                                                                   │
│                                        [● Live Now] status pill   │
│  [tag]  [tag]                                                     │
│  Event Title                                                      │
│  text-3xl sm:text-4xl font-black text-white tracking-tight        │
└─────────────────────────────────────────────────────────────────┘
```

```tsx
// Gradient — correct across both modes
<div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />

// Fallback when no image
<div className="relative aspect-[16/9] md:aspect-[21/8] w-full overflow-hidden rounded-2xl bg-zinc-900">

// Back button — frosted glass, always readable over photo
<button className="absolute left-4 top-4 z-20 flex size-8 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm border border-white/15 text-white">
  <ChevronLeft className="size-4" />
</button>

// Status pill — top-right, color-coded
// Upcoming:
<span className="rounded-full bg-blue-500/90 px-3 py-1 text-xs font-bold text-white">Upcoming</span>
// Ongoing (with pulse):
<span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-bold text-white">
  <span className="size-1.5 rounded-full bg-white animate-pulse" />
  Live Now
</span>
// Ended:
<span className="rounded-full bg-black/40 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white/70">Ended</span>

// Tag chips — frosted glass, always readable over photos
<span className="rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-3 py-1 text-xs text-white">
  {tag}
</span>

// Featured badge — warm amber, fully opaque (not frosted — must pop)
<span className="inline-flex items-center gap-1 rounded-full bg-amber-400/90 px-3 py-1 text-xs font-bold text-amber-900">
  <Star className="size-3" /> Featured
</span>
```

> **Why `bg-amber-400/90 text-amber-900`?** This reads clearly over both dark photos (dark bg → amber pops) and light/bright photos (amber is warm enough to distinguish). `text-amber-900` provides AAA contrast on the amber background in both modes.

---

### Section B — Identity Bar (new component)

Extracted entirely from the banner. Pure information, no decoration.

**Token contract:**
- `bg-card border-border shadow-sm` — semantic, adapts to mode
- `text-muted-foreground` — secondary text, adapts
- `text-foreground` — primary text on the bar
- Chips: Tier 2 pattern with `dark:` variant

```tsx
<div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-border bg-card px-5 py-3.5 shadow-sm">
  {/* Date */}
  <span className="inline-flex items-center gap-1.5 text-sm text-foreground font-medium">
    <CalendarDays className="size-3.5 text-indigo-500" />
    {formatEventDateRange(start, end)}
  </span>

  <span className="h-3 w-px bg-border" />  {/* divider — uses border token */}

  {/* Time */}
  <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
    <Clock className="size-3.5" />
    {formatEventTime(start)} onwards
  </span>

  <span className="h-3 w-px bg-border" />

  {/* Location */}
  <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
    <MapPin className="size-3.5" />
    {city ?? "Location TBA"}
  </span>

  {/* Format chip */}
  <span className="rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
    {venueTypeLabel}  {/* In-Person | Online | Hybrid */}
  </span>

  {/* Scope chip */}
  <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
    {scopeLabel}  {/* Campus Event | Global | IG Event */}
  </span>
</div>
```

---

### Section C — Main Content Column

#### C1. About This Event

**Token contract:** All Tier 1. No hardcoded colors.

```tsx
<div className="rounded-2xl border border-border bg-card shadow-sm">
  <div className="flex items-center gap-2.5 px-5 py-4">
    <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-500/10">
      <FileText className="size-4 text-indigo-500" />
    </div>
    <h2 className="text-base font-bold text-foreground">About This Event</h2>
  </div>
  <div className="px-5 pb-5 pt-0">
    {/* Description — semantic text tokens */}
    <p className="text-sm leading-7 text-muted-foreground whitespace-pre-wrap line-clamp-7">
      {event.description}
    </p>
    {/* Expand if >7 lines */}
    <button className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
      Read more
    </button>
  </div>
</div>
```

- `text-muted-foreground` — not `text-gray-500`, not `text-secondary`
- Expand gradient fade: `from-card to-transparent` — uses the card token so the fade matches the card background in both modes

```tsx
// Expand fade overlay — must use bg-card token, not bg-white
<div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent pointer-events-none" />
```

#### C2. Linked Tasks — "Earn Karma at This Event"

**Token contract:** Tier 1 for surfaces; Tier 2 with `dark:` for colored chips.

```tsx
// Section header
<div className="flex size-9 items-center justify-center rounded-xl bg-violet-500/10">
  <Zap className="size-4 text-violet-500" />
</div>
<h2 className="text-base font-bold text-foreground">Earn Karma at This Event</h2>

// Per task card — Tier 1 surfaces only
<div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2">

  {/* Row 1: hashtag + karma */}
  <div className="flex items-center justify-between">
    <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2.5 py-1 font-mono text-xs text-violet-600 dark:text-violet-400">
      #{task.hashtag}
    </span>
    <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
      +{task.karma} karma
    </span>
  </div>

  {/* Row 2: task name */}
  <p className={cn(
    "text-sm font-medium",
    task.active ? "text-foreground" : "text-muted-foreground line-through"
  )}>
    {task.title}
  </p>

  {/* Row 3: IG + bonus */}
  <div className="flex items-center justify-between">
    <span className="text-xs text-muted-foreground">{task.ig?.name}</span>
    {task.bonus_time && task.active && (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
        <Clock className="size-3" />
        +{task.bonus_karma} before {formatBonusDeadline(task.bonus_time)}
      </span>
    )}
    {!task.active && (
      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
        Closed
      </span>
    )}
  </div>
</div>
```

> **`bg-muted/40` on task cards:** `bg-muted` is `#f1f5f9` in light (soft gray) and `oklch(0.23 0 0)` in dark (near-black). At `/40` opacity over `bg-card` (`oklch(0.185)`), it gives a subtle depth difference in dark mode without jarring contrast — correct behavior.

#### C3. Venue (main column, not sidebar)

```tsx
// Section icon: rose — venue is physical
<div className="flex size-9 items-center justify-center rounded-xl bg-rose-500/10">
  <MapPin className="size-4 text-rose-500" />
</div>

// Map — no border, border comes from parent card
<div className="overflow-hidden rounded-xl">
  <iframe className="h-52 w-full" ... />
</div>

// Address
<p className="flex items-center gap-1.5 text-sm text-muted-foreground">
  <MapPin className="size-3.5 shrink-0" />
  {address}, {city}
</p>

// CTA
<a
  href={mapsUrl}
  className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-600"
>
  Get Directions <ExternalLink className="size-3" />
</a>
```

#### C4. Partnering Organizations

```tsx
<div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10">
  <Handshake className="size-4 text-blue-500" />
</div>

// Per org row
<div className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-2.5">
  {/* Logo or initials */}
  {logo ? (
    <img src={logo} className="size-8 rounded-lg object-contain" />
  ) : (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
      <span className="text-[10px] font-black text-white">{initials}</span>
    </div>
  )}
  <div className="min-w-0">
    <p className="truncate text-sm font-medium text-foreground">{name}</p>
    <p className="text-xs text-muted-foreground">{collabTypeLabel}</p>
  </div>
</div>
```

---

### Section D — Sticky Sidebar

#### D1. Registration Card

The entire conversion intent of the page. No `CardHeader` with icon box — this card leads with content, not a label.

```tsx
<div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">

  {/* 1. Status pill */}
  {/* Upcoming */}
  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
    <CalendarDays className="size-3" /> Upcoming
  </span>
  {/* Ongoing */}
  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
    Happening Now
  </span>
  {/* Ended */}
  <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
    Event Ended
  </span>
  {/* Cancelled */}
  <span className="inline-flex items-center rounded-full bg-rose-500/15 px-3 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
    Cancelled
  </span>

  {/* 2. Registration deadline countdown — only if deadline exists */}
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">Registration closes</span>
      <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
        {daysLeft === 0 ? "Today" : `${daysLeft}d left`}
      </span>
    </div>
    {/* Progress bar — uses Tier 1 for track, Tier 2+dark for fill */}
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-amber-500 transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  </div>

  {/* 3. Register button */}
  {/* Open */}
  <a
    href={event.registration_url}
    className="flex w-full items-center justify-center rounded-full bg-indigo-500 py-3 text-sm font-semibold text-white hover:bg-indigo-600 transition-colors"
  >
    Register Now
  </a>
  {/* Closed — not disabled; explained */}
  <div className="space-y-1">
    <div className="flex w-full cursor-not-allowed items-center justify-center rounded-full bg-muted py-3 text-sm font-semibold text-muted-foreground">
      Registration Closed
    </div>
    <p className="text-center text-[11px] text-muted-foreground">
      Closed on {format(deadline, "d MMM yyyy")}
    </p>
  </div>
  {/* Blocked by karma — muted indigo signals "almost there" */}
  <div className="space-y-1">
    <div className="flex w-full cursor-not-allowed items-center justify-center rounded-full bg-indigo-500/20 py-3 text-sm font-semibold text-indigo-400">
      Karma Requirement Not Met
    </div>
    <p className="text-center text-[11px] text-muted-foreground">
      {event.viewer_access_blocked_reason}
    </p>
  </div>

  {/* 4. I'm Going button */}
  {/* Not going */}
  <button className="flex w-full items-center justify-center gap-2 rounded-full border border-border py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
    <Heart className="size-4" />
    I'm Going · {count}
  </button>
  {/* Going — emerald tint, no dark: needed as bg-emerald-500/15 is readable in both */}
  <button className="flex w-full items-center justify-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/15 py-2.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 transition-colors">
    <HeartFilled className="size-4" />
    Going · {count}
  </button>

  {/* 5. Karma gate — only if min_karma > 0 */}
  <div className="space-y-2 border-t border-border pt-4">
    <div className="flex items-center justify-between">
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Zap className="size-3.5 text-amber-500" />
        Requires {event.min_karma.toLocaleString()} karma
      </span>
      {/* Eligible */}
      <span className="text-[11px] font-semibold text-success">✓ Eligible</span>
      {/* Ineligible */}
      <span className="text-[11px] font-semibold text-destructive">Need {gap} more</span>
    </div>
    {/* Karma progress bar */}
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn("h-full rounded-full transition-all", eligible ? "bg-success" : "bg-destructive")}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
    <p className="text-[11px] text-muted-foreground">
      Your karma: {userKarma?.toLocaleString() ?? "—"}
    </p>
  </div>
</div>
```

> **Token choices explained:**
> - `bg-muted` for the countdown track → adapts: soft gray in light, dark muted in dark mode  
> - `bg-amber-500` for countdown fill → absolute; `text-amber-600 dark:text-amber-400` for the label  
> - `bg-indigo-500` for register → absolute, brand accent (same in both modes)  
> - `bg-muted` for closed state → semantic, adapts to mode  
> - `bg-emerald-500/15 text-emerald-600 dark:text-emerald-400` for going state → standard Tier 2 pattern  
> - `text-success` and `text-destructive` for karma eligibility → Tier 1, designed for exactly this purpose  
> - `bg-muted` for karma track, `bg-success` / `bg-destructive` for fill → semantic throughout

#### D2. Organizer Card

```tsx
<div className="rounded-2xl border border-border bg-card shadow-sm">
  <div className="flex items-center gap-2.5 px-5 py-4">
    <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-500/10">
      <Building2 className="size-4 text-indigo-500" />
    </div>
    <h2 className="text-base font-bold text-foreground">Organizer</h2>
  </div>
  <div className="flex items-center gap-3 px-5 pb-5">
    {/* Logo */}
    {logo ? (
      <img src={logo} className="size-12 rounded-xl object-contain" />
    ) : (
      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
        <span className="text-sm font-black text-white">{initials}</span>
      </div>
    )}
    <div className="min-w-0">
      <p className="truncate text-sm font-bold text-foreground">{organizerName}</p>
      <p className="text-xs capitalize text-muted-foreground">{organizerTypeLabel}</p>
    </div>
  </div>
</div>
```

---

### Section E — Mobile Sticky Bar

**Token contract:** `bg-background/95` (semantic — adapts to mode for the backdrop), `border-border` for the top border, `text-foreground` and `text-muted-foreground` for the left text, `bg-indigo-500` for the CTA.

```tsx
<div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm px-4 py-3 lg:hidden">
  <div className="flex items-center justify-between gap-4">
    {/* Left — event context */}
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold text-foreground">{event.title}</p>
      <p className="text-[11px] text-muted-foreground">
        {formatEventDate(event.start_datetime)}
      </p>
    </div>
    {/* Right — CTA */}
    {registrationOpen ? (
      <a
        href={event.registration_url}
        className="shrink-0 rounded-full bg-indigo-500 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-600"
      >
        Register
      </a>
    ) : (
      <span className="shrink-0 rounded-full bg-muted px-4 py-2 text-xs font-semibold text-muted-foreground">
        {registrationClosed ? "Closed" : "Ended"}
      </span>
    )}
  </div>
</div>
```

> `bg-background/95` — not `bg-white/95`. On dark mode, `--background` is near-black, so the bar will be a dark frosted panel — correct macOS/iOS behavior.

---

### Section F — Loading Skeleton

```tsx
function EventDetailSkeleton() {
  return (
    <div className="space-y-5 lc-fade-in">
      {/* Banner */}
      <Skeleton className="aspect-[16/9] md:aspect-[21/8] w-full rounded-2xl" />
      {/* Identity bar */}
      <div className="flex flex-wrap gap-3 rounded-2xl border border-border bg-card px-5 py-3.5">
        <Skeleton className="h-5 w-36 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-5 w-32 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      {/* Grid */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <Skeleton className="h-52 w-full rounded-2xl" />
          <Skeleton className="h-36 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-72 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
```

> `Skeleton` from `@/components/ui/skeleton` already uses `bg-muted animate-pulse` internally — it adapts correctly to dark mode via the muted token. No changes needed to the Skeleton component itself.

---

## 4. Component Decomposition

Split the 511-line monolith into focused files:

```
src/features/events/components/
├── event-detail-view.tsx           ← orchestrator, ~80 lines
├── event-detail-skeleton.tsx       ← update to mirror real layout
├── event-hero-banner.tsx           ← NEW: banner, gradient, badges, frosted overlays
├── event-identity-bar.tsx          ← NEW: date/time/venue/scope chips below banner
├── event-about-section.tsx         ← NEW: description + collapse logic
├── event-tasks-section.tsx         ← NEW: karma tasks, replaces raw card
├── event-venue-section.tsx         ← NEW: map moved to main column
├── event-collaborators-section.tsx ← NEW: org pills with logo
├── event-registration-card.tsx     ← NEW: full CTA sidebar card
├── event-organizer-card.tsx        ← NEW: canonical card pattern
├── event-mobile-bar.tsx            ← NEW: mobile sticky bar
├── interest-button.tsx             ← UPDATE: emerald toggle state
└── event-analytics-panel.tsx       ← DEPRECATE: going count moves to registration card
```

---

## 5. UI Psychology — Decision Log

| Decision | Principle | Rationale |
|---|---|---|
| Banner = emotion only; identity bar = information | **One job per zone** | Separation of concerns for the eye — clarity before detail |
| `from-black/70` not `from-foreground/85` | **Deference (Apple HIG)** | Let photography sell the event |
| Deadline countdown bar in amber | **Urgency (Cialdini scarcity)** | Temporal scarcity is the strongest conversion lever |
| Karma gate inline before clicking | **Error prevention (Nielsen #5)** | Show the barrier before the action, never after |
| "Going · 147" next to Register | **Social proof (Cialdini)** | Social validation reduces hesitation |
| "Earn Karma at This Event" not "Linked Tasks" | **Benefit language** | Lead with reward, not mechanism |
| Status pill with pulse on Ongoing | **System status visibility (Nielsen #1)** | Real-time awareness — is this happening now? |
| Featured badge = amber, fully opaque | **Visual hierarchy** | Featured must visually outweigh tags; opacity-based badges merge with background |
| Collapse description at 7 lines | **Progressive disclosure** | Content reveals on intent, not on page load |
| Mobile bar shows title + date | **Spatial context** | 80% scroll from header = user needs a reminder of what they're registering for |
| `cursor-not-allowed` div for closed reg | **Affordance** | A visually closed-looking element communicates "can't click" better than disabled |

---

## 6. Design Token Semantics & Dark Mode Contract

### 6.1 The Three Failure Modes in the Current Code

**Failure 1: Using semantic tokens as if they were fixed colors**
```tsx
// Current — catastrophic in dark mode
// --foreground is oklch(0.985) in dark mode = near-white
<div className="bg-gradient-to-t from-foreground/85 ...">

// Fix — black is absolute, safe on photos in both modes
<div className="bg-gradient-to-t from-black/75 ...">
```

**Failure 2: Using hardcoded light-mode colors**
```tsx
// Current — invisible or near-invisible in dark mode
<div className="bg-gray-50 p-8">...</div>  // gray-50 ≈ #f9fafb, nearly white on dark bg

// Fix — muted token adapts
<div className="bg-muted p-8">...</div>
```

**Failure 3: Colored text without dark: variant**
```tsx
// Current — text-indigo-600 is too dark on dark chip background
<span className="bg-indigo-500/15 text-indigo-600">Campus Event</span>

// Fix — lighter tint on dark mode
<span className="bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">Campus Event</span>
```

---

### 6.2 Complete Color Decision Matrix

Every element in the revamp, with its correct class in both modes:

| Element | bg class | text class | dark text override |
|---|---|---|---|
| Page background | `bg-background` | — | — |
| Card surface | `bg-card` | `text-card-foreground` | not needed (token adapts) |
| Muted surface / chip bg | `bg-muted` | `text-muted-foreground` | not needed |
| All borders | `border-border` | — | not needed |
| Primary text | — | `text-foreground` | not needed |
| Secondary text | — | `text-muted-foreground` | not needed |
| Photo gradient | `from-black/75 via-black/30` | — | not needed (absolute) |
| Banner title | — | `text-white` | not needed (on photo) |
| Frosted glass chip | `bg-white/15 backdrop-blur-sm` | `text-white` | not needed (on photo) |
| Featured badge | `bg-amber-400/90` | `text-amber-900` | not needed (own bg) |
| Event status: Upcoming | `bg-blue-500/15` | `text-blue-600` | `dark:text-blue-400` |
| Event status: Ongoing | `bg-emerald-500/15` | `text-emerald-600` | `dark:text-emerald-400` |
| Event status: Ended | `bg-muted` | `text-muted-foreground` | not needed |
| Event status: Cancelled | `bg-rose-500/15` | `text-rose-600` | `dark:text-rose-400` |
| Register button: open | `bg-indigo-500 hover:bg-indigo-600` | `text-white` | not needed |
| Register button: closed | `bg-muted` | `text-muted-foreground` | not needed |
| Register button: blocked | `bg-indigo-500/20` | `text-indigo-400` | not needed (already light) |
| Going button: inactive | `border-border hover:bg-muted` | `text-foreground` | not needed |
| Going button: active | `bg-emerald-500/15 border-emerald-500/30` | `text-emerald-600` | `dark:text-emerald-400` |
| Deadline bar track | `bg-muted` | — | not needed |
| Deadline bar fill | `bg-amber-500` | — | not needed |
| Deadline label | — | `text-amber-600` | `dark:text-amber-400` |
| Karma eligible | `bg-success` (bar fill) | `text-success` | not needed (stable token) |
| Karma ineligible | `bg-destructive` (bar fill) | `text-destructive` | not needed (stable token) |
| Task card surface | `bg-muted/40` | — | not needed |
| Task hashtag chip | `bg-violet-500/10` | `text-violet-600` | `dark:text-violet-400` |
| Karma chip | `bg-emerald-500/15` | `text-emerald-600` | `dark:text-emerald-400` |
| Bonus karma chip | `bg-amber-500/15` | `text-amber-600` | `dark:text-amber-400` |
| Task closed badge | `bg-muted` | `text-muted-foreground` | not needed |
| Scope chip: campus | `bg-blue-500/15` | `text-blue-600` | `dark:text-blue-400` |
| Scope chip: global | `bg-indigo-500/15` | `text-indigo-600` | `dark:text-indigo-400` |
| Venue type: In-Person | `bg-indigo-500/15` | `text-indigo-600` | `dark:text-indigo-400` |
| Venue type: Online | `bg-emerald-500/15` | `text-emerald-600` | `dark:text-emerald-400` |
| Venue type: Hybrid | `bg-amber-500/15` | `text-amber-600` | `dark:text-amber-400` |
| Mobile bar background | `bg-background/95 backdrop-blur-sm` | — | not needed (token adapts) |
| Organizer initials | `from-indigo-500 to-violet-600` | `text-white` | not needed |
| Icon box: indigo | `bg-indigo-500/10` | `text-indigo-500` | not needed (indigo-500 reads in both) |
| Icon box: violet | `bg-violet-500/10` | `text-violet-500` | not needed |
| Icon box: rose | `bg-rose-500/10` | `text-rose-500` | not needed |
| Icon box: blue | `bg-blue-500/10` | `text-blue-500` | not needed |

> **Why icon box text colors don't need `dark:` variants:**  
> The icon itself (`text-indigo-500`) is rendered over `bg-indigo-500/10` (a very light/dark indigo tint). `indigo-500` (#6366f1) has enough saturation to be visible at both the light-mode and dark-mode chip background values. Chips that hold text labels are different — text must be more legible, which is why `-600` in light and `-400` in dark.

---

### 6.3 Shadow Strategy for Dark Mode

```
Light mode: shadow-sm (box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05))
Dark mode:  elevation expressed through bg-card being lighter than bg-background
            — bg-card = oklch(0.185) vs bg-background = oklch(0.145)
            — the 0.04 lightness difference IS the elevation
            — no shadow needed or expected
```

Do not use `lc-card-shadow` (`rgba(0,0,0,0.06)`) — it's transparent on dark surfaces. Use `shadow-sm` which Tailwind keeps minimal and dark-mode-appropriate.

---

### 6.4 Gradient Backgrounds (globals.css utilities)

The codebase has `.gradient-1` through `.gradient-6` and `.card-bg-*` utilities that use `color-mix(in srgb, var(--chart-N) N%, var(--background))`. These are **semantically correct** — they mix chart colors with the background token, so they adapt to both modes.

For the event detail page, these could be used for:
- The stats row behind a "Going" counter card: `.gradient-2` (teal/cyan tint)
- A featured event indicator strip: `.gradient-5` (amber/gold tint)

But do not use them for text areas — `color-mix` backgrounds can have unpredictable contrast with `text-foreground` depending on the chart color strength.

---

## 7. Accessibility Checklist

- [ ] Banner `<Image alt={event.title}>` — correct
- [ ] Back button: `aria-label="Go back"`
- [ ] Status pill (Ongoing): `role="status"` 
- [ ] Countdown bar: `role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Registration deadline"`
- [ ] Map iframe: `title="Event location map"` — correct
- [ ] All icon-only buttons: `title` or `aria-label`
- [ ] Registration blocked div (not button): `aria-disabled="true"` — avoids focus trap
- [ ] Mobile sticky bar: `aria-live="polite"` for status changes
- [ ] Karma progress bar: `role="progressbar"` with labeled values
- [ ] Frosted glass elements over photo: contrast ratio checked — `text-white` on `bg-black/30` = AAA

---

## 8. What Must Not Change

| Item | Reason |
|---|---|
| `useEventDetail` hook | No API changes needed |
| `useToggleInterest` mutation | Logic correct |
| `formatEventDateRange`, `formatEventTime` | Working utilities |
| `ExpandableMapDialog` | Keep; trigger from `event-venue-section` |
| Route `events/[id]/page.tsx` | No change |
| `EventDetail` type | No schema changes |

---

## 9. Stitch Prompt (for visual prototyping)

```
Design system (must follow exactly):
- Background: #fefefe light / near-black dark (oklch 0.145)
- Card surface: same as background in light / slightly lifted (oklch 0.185) in dark
- All borders: #e2e8f0 light / oklch(0.26) dark
- Muted surfaces: #f1f5f9 light / oklch(0.23) dark
- Primary text: near-black light / near-white dark (always use foreground token)
- Secondary text: mid-gray light / lighter gray dark (muted-foreground token)
- Primary CTA accent: indigo #6366f1 (fixed, same both modes)
- Success/going: emerald #10b981 (fixed)
- Warning/deadline: amber #f59e0b (fixed)
- Task/IG accent: violet #8b5cf6 (fixed)
- Always-dark hero panel: zinc-900 #18181b
- Photo gradients: pure black at partial opacity (from-black/75) — NOT from-foreground

Colored chips: always bg-{color}/15 with text-{color}-600 in light, text-{color}-400 in dark.

Show the page in BOTH light and dark mode side by side.

Desktop layout (1440px), event detail page:

HERO — full-bleed image, 16:9 to 21:8 ratio. Gradient from-black/75 at bottom 40%, transparent at top. Top-left: back chevron frosted glass pill (bg-black/30 backdrop-blur). Top-right: frosted organizer pill (logo + name). Bottom-left over gradient: frosted tag chips, then large white title (Bricolage Grotesque, 40-48px, font-black). Top-right corner of image: status badge — "Upcoming" in opaque blue pill, or "Live Now" with green pulse dot in opaque emerald pill.

IDENTITY BAR — below banner, full-width card (rounded-2xl, border, bg-card). Horizontal row: calendar icon + date range, thin separator, clock icon + time, thin separator, pin icon + city, then indigo "In-Person" chip, blue "Campus Event" chip. All text in muted-foreground; icons in matching accent color.

TWO-COLUMN layout below (main flex-1, sidebar 360px):

LEFT COLUMN (space-y-5):
1. "About This Event" card — indigo icon box (FileText), muted text with 7-line collapse + "Read more" in indigo
2. "Earn Karma at This Event" card — violet icon box (Zap), each task in a rounded-xl muted/40 panel: violet hashtag pill, emerald karma chip, amber bonus chip, muted IG name
3. "Venue" card — rose icon box (MapPin), full-width map iframe (rounded-xl), address + indigo "Get Directions" pill button
4. "Partnering Organizations" card — blue icon box (Handshake), each org as avatar row (square 32px logo or initials gradient) + name + type label

RIGHT SIDEBAR (sticky top-6, space-y-4):
1. Registration card — no header. Top: status pill. Then: amber deadline countdown (label + thin amber progress bar). Then: large full-width indigo rounded-full "Register Now" button (48px height). Then: outlined full-width "♥ Going · 147" button — turns emerald when toggled. Then: divider + karma gate (amber Zap icon, requirement text, emerald/rose progress bar, eligibility label using success/destructive colors).
2. Organizer card — indigo icon box (Building2). Square 48px org logo or indigo-violet gradient initials. Name bold foreground, type label muted-foreground.

DARK MODE must show:
- Card surfaces as slightly lighter than background (elevated)
- All chip text in lighter shade (-400 not -600)
- Mobile bar backdrop as dark blurred surface
- Muted backgrounds visibly differentiated from card backgrounds

MOBILE sticky bar (show at bottom, mobile frame):
bg-background/95 backdrop-blur, border-top. Left: event title truncated (font-semibold foreground) + date (muted-foreground, 11px). Right: indigo "Register →" rounded-full pill OR muted "Closed" pill.

Apple design principles: large titles, generous whitespace, purposeful color, every element earns its space, typography carries the hierarchy.
```

---

*End of audit. Total estimated implementation: 6–8 hours across 12 component files.*
