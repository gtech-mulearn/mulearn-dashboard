# mulearn-dashboard

## 5.0.0

The μLearn Dashboard has been rebuilt from the ground up. This is a full rewrite faster, more secure, and significantly broader in scope than before. It keeps everything the community already relies on (authentication, profiles, μJourney, interest groups, learning circles, leaderboards) while adding role-aware home pages, a dedicated Company portal, a complete Mentor portal, an Intern workspace, rebuilt task management, new analytics, and hardened security and performance under the hood.

## Highlights

- **Role-aware home pages** — the dashboard now adapts to who you are, with a role selector to switch between the views available to you.
- **Company portal (new)** — a full workspace for companies: job posting, applicant tracking, task and mentor nomination, IG requests, and analytics.
- **Mentor portal (new)** — sessions, task requests, mentee management, and a verification workflow.
- **Intern workspace (new)** — a dedicated space for interns and intern leads.
- **Google Sign-In** — a new authentication option alongside email/MuID and OTP.
- **Rebuilt task management, new analytics, Talent Pool, Projects, Weekly Twitches, and Event reporting.**
- **Security & performance overhaul** — cookie-based auth, edge-level route protection, server rendering, and image optimization.
- **Dark mode** and an **in-app changelog**.

---

# New Features

## Google Sign-In

You can now sign in with Google OAuth, in addition to the existing email/MuID password login and OTP login.

### A home page that knows who you are

Your dashboard home now adapts to your role, with a dedicated role selector to switch between the views available to you , no more one size fits all landing page.

- **Learners** — karma streak, quick-action shortcuts, upcoming learning circle meetings, followed interest groups, and a live karma feed.
- **Enablers** — a dedicated view with campus relevant highlights.
- **Mentors** — upcoming sessions, IG roles, a mentee overview, and your mentor application status (pending or verified).
- **Companies** — talent pool, open job counts, and quick company stats.
- **Campus Leads / Enablers** — campus circle health, member funnel analytics, and recent campus activity, with a selector to switch between Student and Campus Lead views.

## Company Branch — a portal built for companies

Companies now have their own dedicated section of the dashboard:

- **Job Management** — post openings with a step by step form, set eligibility rules, and track applicants through each hiring stage.
- **Task Management** — create community tasks with karma points, submitted for admin approval.
- **Mentor Management** — nominate mentors from the community for admin review.
- **IG Requests** — submit interest group requests directly.
- **Analytics & Performance** — a dedicated view of your company's engagement.

**For learners:** browse open roles from all verified companies, apply with a resume and cover letter, and track every application from **My Applications** — with search, filtering, and detailed job descriptions.

**For admins:** a new company management page to review, verify, or reject company registrations, with a full company profile view.

## Mentor Portal

Mentors now have a complete, role specific experience:

- **Sessions** — create and manage mentoring sessions, add participants, copy session IDs, and delete sessions. Learners can browse, request, join, and track sessions, including joining online meetings.
- **Task Requests** — create community tasks (pending admin approval), then edit or delete them at any time.
- **Mentees** — see everyone who has joined your sessions, submit feedback for completed sessions, and manage your mentee list.
- **Status banner** — your mentor application status (pending review / verified) appears right on your home page.
- **All scopes active at once** — every scope a mentor holds (Company, Campus, and Interest Group) is live simultaneously, with per-scope grants managed by admins — no view-switching required.

**For learners:** a dedicated Sessions page to browse and join mentor sessions using a session ID.

**For admins:** a Mentor Verification portal to search applications, review applicant profiles, and approve qualified mentors.

## Intern Dashboard

A brand new section for interns and intern leads, a dedicated space with tasks, timesheets, minutes, leave requests, a quest log, weekly reviews, and an intern leaderboard, plus a management counterpart for reviews and reporting.

## Task Management — fully rebuilt

The admin task-management experience has been completely overhauled:

- Create, edit, and delete tasks using clean dialog based forms with proper validation.
- Verify tasks submitted by mentors and companies, with improved filtering and workflow.
- Manage task types from a dedicated dialog.
- Bulk-import tasks in one go with the new batch import tool.

## Talent Pool

Mentors and companies can now browse the Talent Pool, a curated view of learners across the community — completing a new recruitment loop with the jobs board.

## Projects

- **Project Showcase** — publish projects, browse community submissions, vote, comment, and discover new work.

## Weekly Twitches Hub

A centralized space for recurring programs, Office Hours, Salt Mango Tree, and Inspiration Station Radio with browsing, search, and filtering across completed and upcoming sessions.

## Zonal & District Dashboards

- **Zonal Dashboard** — Zonal Administrators can monitor regional rankings, total members, and activity levels, and compare campuses within a zone.
- **District Dashboard** — District Coordinators can monitor district rankings, member statistics, and participation metrics, and support campus activity across the district.

## Event Management (Admin)

- Administrators and organizers can create, publish, draft, and manage the full event lifecycle including invitations, pending approvals, search, filtering, and schedules.
- The **Events Hub** (formerly Special Events) now supports event registration and participation tracking for users, in addition to browsing and viewing schedules.

## μVerse (coming soon)

A dedicated space for an upcoming immersive dimension of μLearn; learning, collaboration, networking, and community engagement. Stay tuned.

## Quality-of-life additions

- **Dark mode** — follows your system preference automatically, or toggle it manually.
- **In-app changelog** — every future release will appear at `/dashboard/changelog`, so you never have to hunt for what's new.
- **Learning Streak** — learner analytics now track an active learning streak alongside karma totals and rank.
- **Member Funnel Analysis** — Campus Leads and Enablers can visualize the learner journey from registered users through onboarded, active, and Level 2+ learners to circle leads.

---

# Improvements

## μJourney (redesigned Learning Paths)

The Learning Paths module has been reimagined as **μJourney**; a cleaner, faster experience for tracking learning progress and discovering new paths.

## Global search & filter

Global search now covers **Projects** and **Events**, alongside the existing Interest Groups, Learning Circles, Learners, Mentors, and Campuses.

## Campus management

Campus Leads gain direct management actions managing Campus Leads and Enablers and downloading campus reports — on top of existing performance and karma insights. Campus-level analytics are reorganized under **Campus Lead Analytics**, now with an **Active Learning Circles** metric alongside Active Members, Campus Karma, and Campus Rank.

## Consolidated Learning Circles

The two parallel Learning Circle implementations have been merged into a single, coherent module — fewer routes, consistent navigation, and properly nested meeting pages, with unit-tested meeting link and meeting time validation.

## Unified data layer & UI

- **Faster, smarter data handling** — data is now cached, deduplicated, refreshed in the background, and updated optimistically for a snappier feel.
- **Consistent tables and forms** — sorting, filtering, pagination, and validation now behave the same way across every admin screen.
- **Accessible components** — dialogs, dropdowns, tabs, and selects ship with keyboard navigation, focus management, and ARIA semantics by default.

---

## Security

Security has been substantially hardened in this release:

- **Auth moved off `localStorage` to cookies** with `SameSite=Strict`, closing a class of cross-site request forgery vectors. The **refresh token is `HttpOnly`** and never exposed to page scripts.
- **Edge-level route protection** — every page load is authorized at the edge before any application code reaches your browser, so unauthorized users no longer download or briefly render protected pages.
- **Security headers on every request** — Content Security Policy, HSTS, `X-Frame-Options: DENY`, and related protections are now set platform-wide.
- **Sanitized rich text** — Markdown rendering runs through a sanitizer, closing an XSS vector.
- **Validated environment configuration** — required configuration is schema-validated at build time, so a misconfiguration fails the build instead of surfacing as a runtime error.
- **Public vs. protected routes** — a small set of routes (interest group pages, public profiles, and other public surfaces) remain accessible without login; everything else requires authentication and role verification.

---

## Performance

- **Server rendering** — pages that don't need interactivity are rendered on the server, so content appears faster with less JavaScript to download.
- **Route-level code splitting** — each route loads only the code it needs.
- **Image optimization** — images are automatically served as AVIF/WebP for significantly smaller files at the same quality.
- **Smart caching** — data loads faster on repeat visits and refreshes automatically in the background.
- **Lighter dependency footprint** — several large legacy dependencies were removed from the client bundle.

> Performance baselines (Lighthouse / Core Web Vitals / bundle size) are being captured against production and will be published in a follow-up.

---

## Reliability

The application now ships with error boundaries and illustrated empty/error states throughout, so a single failing component no longer takes down the page users see a clear, recoverable state instead of a blank screen.

Every deployment is also tagged to its exact commit (surfaced in the in-app version badge), so a reported issue can be traced back to the precise build that shipped it.

---
