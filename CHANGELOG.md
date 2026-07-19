# mulearn-dashboard

## 5.0.0

The μLearn Dashboard has been rebuilt from the ground up. This is a full rewrite — faster, more secure, and significantly broader in scope than before. It keeps everything the community already relies on (authentication, profiles, μJourney, interest groups, learning circles, leaderboards) while adding role-aware home pages, a dedicated Company portal, a complete Mentor portal, an Intern workspace, rebuilt task management, new analytics, and hardened security and performance under the hood.

### Highlights

- **Role-aware home pages** — the dashboard now adapts to who you are, with a role selector to switch between the views available to you.
- **Company portal (new)** — a full workspace for companies: job posting, applicant tracking, task and mentor nomination, IG requests, and analytics.
- **Mentor portal (new)** — sessions, task requests, mentee management, and a verification workflow.
- **Intern workspace (new)** — a dedicated space for interns and intern leads.
- **Google Sign-In** — a new authentication option alongside email/MuID and OTP.
- **Rebuilt task management, new analytics, Talent Pool, Projects, Weekly Twitches, and Event reporting.**
- **Security & performance overhaul** — cookie-based auth, edge-level route protection, server rendering, and image optimization.
- **Dark mode** and an **in-app changelog**.

---

### New Features

#### Google Sign-In

You can now sign in with Google OAuth, in addition to the existing email/MuID password login and OTP login.

#### A home page that knows who you are

Your dashboard home now adapts to your role, with a dedicated role selector to switch between the views available to you — no more one-size-fits-all landing page.

- **Learners** — karma streak, quick-action shortcuts, upcoming learning circle meetings, followed interest groups, and a live karma feed.
- **Students** — a focused summary of your activity and progress.
- **Enablers** — a dedicated view with campus-relevant highlights.
- **Mentors** — upcoming sessions, IG roles, a mentee overview, and your mentor application status (pending or verified).
- **Companies** — talent pool, open job counts, and quick company stats.
- **Campus Leads / Enablers** — campus circle health, member-funnel analytics, and recent campus activity, with a selector to switch between Student and Campus Lead views.

#### Company Branch — a portal built for companies

Companies now have their own dedicated section of the dashboard:

- **Job Management** — post openings with a step-by-step form, set eligibility rules, and track applicants through each hiring stage.
- **Task Management** — create community tasks with karma points, submitted for admin approval.
- **Mentor Management** — nominate mentors from the community for admin review.
- **IG Requests** — submit interest group requests directly.
- **Analytics & Performance** — a dedicated view of your company's engagement.

**For learners:** browse open roles from all verified companies, apply with a resume and cover letter, and track every application from **My Applications** — with search, filtering, and detailed job descriptions.

**For admins:** a new company management page to review, verify, or reject company registrations, with a full company profile view.

#### Full Mentor Portal

Mentors now have a complete, role-specific experience:

- **Sessions** — create and manage mentoring sessions, add participants, copy session IDs, and delete sessions. Learners can browse, request, join, and track sessions, including joining online meetings.
- **Task Requests** — create community tasks (pending admin approval), then edit or delete them at any time.
- **Mentees** — see everyone who has joined your sessions, submit feedback for completed sessions, and manage your mentee list.
- **Status banner** — your mentor application status (pending review / verified) appears right on your home page.
- **All scopes active at once** — every scope a mentor holds (Company, Campus, and Interest Group) is live simultaneously, with per-scope grants managed by admins — no view-switching required.

**For learners:** a dedicated Sessions page to browse and join mentor sessions using a session ID.

**For admins:** a Mentor Verification portal to search applications, review applicant profiles, and approve qualified mentors.

#### Intern Dashboard

A brand-new section for interns and intern leads — a dedicated space with tasks, timesheets, minutes, leave requests, a quest log, weekly reviews, and an intern leaderboard, plus a management counterpart for reviews and reporting.

#### Task Management — fully rebuilt

The admin task-management experience has been completely overhauled:

- Create, edit, and delete tasks using clean dialog-based forms with proper validation.
- Verify tasks submitted by mentors and companies, with improved filtering and workflow.
- Manage task types from a dedicated dialog.
- Bulk-import tasks in one go with the new batch import tool.

#### Talent Pool

Mentors and companies can now browse the Talent Pool — a curated view of learners across the community — completing a new recruitment loop with the jobs board.

#### Projects & Reports

- **Project Showcase** — publish projects, browse community submissions, vote, comment, and discover new work.
- **Reports** — a new admin reporting surface, plus an **Event Report Generator** that produces structured, exportable (PDF) event reports for standardized documentation and archiving.

#### Weekly Twitches Hub

A centralized space for recurring programs — Office Hours, Salt Mango Tree, and Inspiration Station Radio — with browsing, search, and filtering across completed and upcoming sessions.

#### Zonal & District Dashboards

- **Zonal Dashboard** — Zonal Administrators can monitor regional rankings, total members, and activity levels, and compare campuses within a zone.
- **District Dashboard** — District Coordinators can monitor district rankings, member statistics, and participation metrics, and support campus activity across the district.

#### Event Management (Admin)

- Administrators and organizers can create, publish, draft, and manage the full event lifecycle — including invitations, pending approvals, search, filtering, and schedules.
- The **Events Hub** (formerly Special Events) now supports event registration and participation tracking for users, in addition to browsing and viewing schedules.

#### μVerse (coming soon)

A dedicated space for an upcoming immersive dimension of μLearn — learning, collaboration, networking, and community engagement. Stay tuned.

#### Quality-of-life additions

- **Dark mode** — follows your system preference automatically, or toggle it manually.
- **In-app changelog** — every future release will appear at `/dashboard/changelog`, so you never have to hunt for what's new.
- **Learning Streak** — learner analytics now track an active learning streak alongside karma totals and rank.
- **Member Funnel Analysis** — Campus Leads and Enablers can visualize the learner journey from registered users through onboarded, active, and Level 2+ learners to circle leads.

---

### Improvements

#### μJourney (redesigned Learning Paths)

The Learning Paths module has been reimagined as **μJourney** — a cleaner, faster experience for tracking learning progress and discovering new paths.

#### Global search & filter

Global search now covers **Projects** and **Events**, alongside the existing Interest Groups, Learning Circles, Learners, Mentors, and Campuses.

#### Campus management

Campus Leads gain direct management actions — managing Campus Leads and Enablers and downloading campus reports — on top of existing performance and karma insights. Campus-level analytics are reorganized under **Campus Lead Analytics**, now with an **Active Learning Circles** metric alongside Active Members, Campus Karma, and Campus Rank.

#### Consolidated Learning Circles

The two parallel Learning Circle implementations have been merged into a single, coherent module — fewer routes, consistent navigation, and properly nested meeting pages, with unit-tested meeting-link and meeting-time validation.

#### Unified data layer & UI

- **Faster, smarter data handling** — data is now cached, deduplicated, refreshed in the background, and updated optimistically for a snappier feel.
- **Consistent tables and forms** — sorting, filtering, pagination, and validation now behave the same way across every admin screen.
- **Accessible components** — dialogs, dropdowns, tabs, and selects ship with keyboard navigation, focus management, and ARIA semantics by default.

---

### Security

Security has been substantially hardened in this release:

- **Auth moved off `localStorage` to cookies** with `SameSite=Strict`, closing a class of cross-site request forgery vectors. The **refresh token is `HttpOnly`** and never exposed to page scripts.
- **Edge-level route protection** — every page load is authorized at the edge before any application code reaches your browser, so unauthorized users no longer download or briefly render protected pages.
- **Security headers on every request** — Content-Security-Policy, HSTS, `X-Frame-Options: DENY`, and related protections are now set platform-wide.
- **Sanitized rich text** — Markdown rendering runs through a sanitizer, closing an XSS vector.
- **Validated environment configuration** — required configuration is schema-validated at build time, so a misconfiguration fails the build instead of surfacing as a runtime error.
- **Public vs. protected routes** — a small set of routes (interest group pages, public profiles, and other public surfaces) remain accessible without login; everything else requires authentication and role verification.

---

### Performance

- **Server rendering** — pages that don't need interactivity are rendered on the server, so content appears faster with less JavaScript to download.
- **Route-level code splitting** — each route loads only the code it needs.
- **Image optimization** — images are automatically served as AVIF/WebP for significantly smaller files at the same quality.
- **Smart caching** — data loads faster on repeat visits and refreshes automatically in the background.
- **Lighter dependency footprint** — several large legacy dependencies were removed from the client bundle.

> Performance baselines (Lighthouse / Core Web Vitals / bundle size) are being captured against production and will be published in a follow-up.

---

### Reliability

The application now ships with error boundaries and illustrated empty/error states throughout, so a single failing component no longer takes down the page — users see a clear, recoverable state instead of a blank screen.

Every deployment is also tagged to its exact commit (surfaced in the in-app version badge), so a reported issue can be traced back to the precise build that shipped it.

---

### Breaking Changes

#### All users will be signed out once

Authentication moved from `localStorage` to secure cookies. As a result, **every existing session is invalidated on release** and users will need to sign in again. This is expected and one-time.

#### Several page URLs have changed

The dashboard's information architecture was reorganized, so a number of routes moved. Notable examples:

| Old URL | New URL |
| --- | --- |
| `/dashboard/home` | `/dashboard` |
| `/dashboard/interestgroups` | `/dashboard/interest-groups` |
| `/dashboard/mulearners` | `/dashboard/search/students` |
| `/dashboard/mentors` | `/dashboard/search/mentors` |
| `/dashboard/campus` (search) | `/dashboard/search/campuses` |
| `/dashboard/special-events` | `/dashboard/events` |
| `/dashboard/zonal-dashboard` | `/dashboard/zonal` |
| `/dashboard/district-dashboard` | `/dashboard/district` |
| `/dashboard/campus-details` | `/dashboard/campus/manage` |
| `/dashboard/tasks` | `/dashboard/management/tasks/list` |
| `/register/organization` | `/onboarding/organization` |
| `/register/interests` | `/onboarding/interests` |
| `/profile/:id` | `/profile/[muid]` |

Many admin/management routes were also consolidated under `/dashboard/management/...`.

**What to do:** update any saved bookmarks, and update links that point at legacy dashboard paths (e.g. Discord-bot messages, saved admin links, or emails). Teams shipping this release should include a redirect map so legacy links resolve automatically — see [Upgrade & Migration Notes](#upgrade--migration-notes).

---

### Upgrade & Migration Notes

> These notes are for operators deploying the dashboard. There are **no database migrations** — this is a frontend rewrite against the existing backend contract.

**Recommended rollout order**

1. **Deploy the backend first.** New Mentor (scope-grant), Company, and Intern endpoints must be live before the frontend that depends on them.
2. **Ship the redirect map.** Add redirects for the changed routes above (in `next.config.ts`) so legacy bookmarks and external links don't 404. This is the single highest-volume user-visible risk in the release.
3. **Deploy to staging and run full QA**, especially the new Mentor, Company, and Intern workspaces.
4. **Announce the one-time forced logout** to users ahead of the release.
5. **Deploy to production behind a rollback plan.**

**Configuration & tooling changes**

- **Environment variables** moved from `VITE_*` to `NEXT_PUBLIC_*` (and server-only names). Configuration is validated at build time, so **a missing variable now fails the build** rather than surfacing as `undefined` at runtime. Reconcile every legacy variable before deploying.
- **Package manager:** npm → **Bun** (`bun.lock` is committed).
- **Deployment platform:** Vercel → **Netlify** (`netlify.toml` + `@netlify/plugin-nextjs`), driven by a GitHub Actions pipeline: pushes to `staging` and `master` deploy to the staging and production sites respectively, with lint/typecheck/build gating every pull request. Full setup is documented in `docs/DEPLOYMENT.md`.

---

### Removed & Deprecated

- **Legacy duplicate routes removed.** Many admin screens that were reachable under two different paths now have a single canonical URL (see Breaking Changes).
- **Public marketing pages** (Home, Manifesto, Team, and related) are no longer served from the dashboard — they live on the separate μLearn home property.
- **Concluded programmes retired.** Programme-specific surfaces that are no longer active have been removed as part of the rewrite.
- **Placeholder and developer-only pages** (e.g. "coming soon" stubs and internal test pages) have been removed.

> If your team depends on any legacy programme URL or an integration that linked into the old dashboard, confirm the replacement path before the release.

---

### Known Limitations

- **Bookmarks to legacy URLs** will need updating until a redirect map is in place (see above).
- **Performance baselines** are still being measured and will be published in a follow-up.
- **SEO metadata** (Open Graph tags, canonical URLs, sitemap) for the handful of publicly viewable pages is being finalized.
- **μVerse** is a preview surface — it's visible but not yet fully live.

---

### Under the Hood

For engineers and integrators, this release is a complete platform modernization:

| Area | Before | After |
| --- | --- | --- |
| Framework | Vite 5 + React 18 (SPA) | Next.js 16 (App Router) + React 19 |
| Styling | Chakra UI + mixed CSS | Tailwind v4 + shadcn/ui on Radix |
| Routing | 355-line client router | File-system routing + single nav config |
| Auth | Client-side guard, `localStorage` tokens | Edge middleware + secured cookies |
| Data fetching | Hand-rolled Axios services | TanStack Query v5 with caching |
| Forms | Formik + Yup | React Hook Form + Zod (shared with API validation) |
| Tables | Bespoke table components | TanStack Table v8, shared layer |
| Tooling | ESLint + npm | Biome + Bun, Husky, commitlint, Changesets |
| Testing / CI | None | Vitest suite; GitHub Actions CI (lint/typecheck/build) + Netlify deploy pipeline |

---
