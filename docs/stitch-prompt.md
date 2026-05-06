# muLearn Profile Pages — Google Stitch Design Prompts

**For:** Google Stitch (AI UI generation)
**Date:** 2026-05-06
**Companion doc:** `profile-pages-feature-audit.md`

---

## How to Use This File

Each section below is a self-contained prompt. Copy the entire block under a role heading into Google Stitch as your generation prompt. The **Design System Reference** section applies to every prompt — paste it first as a "system context" or pin it as a style reference before generating individual screens.

Generate screens in this order:
1. Student Profile (Desktop) — establishes the baseline
2. Student Profile (Mobile) — validates the responsive pattern
3. Mentor Profile (Desktop)
4. Company Profile (Desktop)
5. Enabler Profile (Desktop)
6. Individual Components (at the end of this file)

---

## Design System Reference

> Paste this block as the shared style context in Stitch before generating any screen.

### Brand & Identity
muLearn is a gamified learning community for students in India. The product personality is: **credible but warm, achievement-oriented, modern without being cold.** Think Linear meets Notion meets a college leaderboard. Not a cold SaaS product. Not a noisy social app. Somewhere in between — high-signal, purposeful.

### Color Palette (exact values)

**Semantic tokens:**
- Background: `#fefefe` (off-white, not pure white)
- Card surface: `#fefefe` with `border: #e2e8f0` (slate-200)
- Muted surface: `#f1f5f9` (slate-100)
- Foreground / primary text: near-black `oklch(0.145 0 0)`
- Muted foreground: `oklch(0.556 0 0)` — medium gray for labels, captions
- Border: `#e2e8f0`
- Primary (buttons, active states): `#000000`
- Ring / focus: `#0961f5` (vivid blue)
- Destructive: `#f44336`

**Brand accent colors — use these for visual interest, not for body text:**
- Brand Purple: `#8f44ed` — gradients, level badges, IG chips
- Brand Blue: `#2e85fe` — primary CTA, links, active tabs
- Success / Open states: `#4caf50`
- Warning / Pending: `#ff8d0c`

**Named gradient presets (use these in headers and icon boxes):**
- Violet-to-purple: `linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)`
- Blue-to-purple (trusty): `linear-gradient(135deg, #2e85fe 0%, #8f44ed 100%)`
- Teal-to-cyan: `linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)`
- Amber-to-orange: `linear-gradient(135deg, #f59e0b 0%, #f97316 100%)`
- Slate hero (mentor): `linear-gradient(135deg, #1e293b 0%, #0f172a 100%)`
- Emerald-to-teal: `linear-gradient(135deg, #10b981 0%, #0d9488 100%)`

### Typography

**Display font:** Bricolage Grotesque — used for names, page headings, big numbers, stat values
**Body font:** Plus Jakarta Sans — used for everything else: labels, descriptions, tab names, badge text, captions

**Type scale:**
- Display Large: Bricolage Grotesque, 32px, weight 700
- Display Medium: Bricolage Grotesque, 28px, weight 700
- Display Small: Bricolage Grotesque, 24px, weight 700
- H1: 20px, weight 700
- H2: 18px, weight 600
- H3: 16px, weight 600
- H4: 14px, weight 600
- Body Large: Plus Jakarta Sans, 16px, weight 400, line-height 28px
- Body Medium: Plus Jakarta Sans, 14px, weight 400, line-height 28px
- Body Small: Plus Jakarta Sans, 12px, weight 400, line-height 28px
- Label / Caption: Plus Jakarta Sans, 11–12px, weight 500–600, letter-spacing 0.04–0.08em, often uppercase

**Big stat numbers on profile:** Bricolage Grotesque, 30–36px, weight 700

### Shape & Elevation

**Border radius tokens:**
- Inputs, dropdowns: `8px` (rounded-md)
- Buttons: `9999px` (rounded-full) for primary actions; `8px` for icon-only
- Cards: `18px` (rounded-2xl)
- Icon boxes: `14px` (rounded-xl)
- Badges / chips: `9999px` (rounded-full)
- Avatar on student/mentor: `18px` (rounded-2xl) for the avatar frame; see per-role
- Modal / dialog: `22px` (rounded-3xl)

**Shadow system:**
- Card resting: `box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)`
- Card hover: `box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)`
- Button (primary): `box-shadow: inset 0 6px 11px rgba(255,255,255,0.33), inset 0 -6px 17px rgba(0,0,0,0.18), 0 4px 7px rgba(0,0,0,0.18)`
- Floating / modal: `box-shadow: 0 20px 60px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.08)`

### Component Patterns

**Cards:**
White background, `border: 1px solid #e2e8f0`, `border-radius: 18px`, resting shadow. Inner padding: 24px. Card headers use: icon box (36×36px, rounded-xl, light tinted bg) + title (H3) + optional right-side action link.

**Buttons:**
- Primary (default): Black bg, white text, rounded-full, px-16px py-8px, shadow
- Trusty (hero CTA): Blue-to-purple gradient bg, white text, rounded-full, elevated shadow
- Outline: 2px solid `#0961f5`, text `#0961f5`, rounded-full, bg transparent
- Ghost: Transparent bg, gradient text (purple-to-blue), rounded-full
- All buttons: Plus Jakarta Sans, 14px, weight 600

**Badges / Chips:**
Rounded-full, px-10px py-4px, Plus Jakarta Sans 12px weight 600.
Color system for chips: each has a `{color}/10` or `{color}/15` background with matching text color.
Examples: emerald chip (bg `#ecfdf5`, text `#065f46`), violet chip (bg `#f5f3ff`, text `#5b21b6`), blue chip (bg `#eff6ff`, text `#1e40af`), amber chip (bg `#fffbeb`, text `#92400e`), slate chip (bg `#f8fafc`, text `#475569`).

**Icon boxes:**
Square, 36×36px or 44×44px, rounded-xl, light tinted background, centered icon at 18–20px. The background is a 10% opacity tint of the icon color.
Examples: violet icon box (bg `#f5f3ff`, icon `#7c3aed`), blue icon box (bg `#eff6ff`, icon `#2e85fe`), emerald (bg `#ecfdf5`, icon `#059669`), amber (bg `#fffbeb`, icon `#d97706`).

**Avatar:**
Student/Mentor: Rounded-2xl (18px) avatar frame, 80×80px on desktop. White 3px border. Positioned partially overlapping the bottom of the banner.
Company: Square logo, 64×64px, rounded-2xl, white background, subtle shadow. Not an avatar — it is a brand mark.

**Tabs:**
Tab strip: `background: #f1f5f9`, rounded-xl, padding 4px. Each tab: Plus Jakarta Sans 14px weight 500, rounded-lg, padding 8px 16px. Active: white background, shadow-sm, near-black text. Inactive: muted-foreground text.

**Stat Cards:**
White card, rounded-2xl, p-20px, shadow-sm. Left side: small label (10–11px uppercase muted), then big number (Bricolage Grotesque 32–36px bold), then a small trend or sub-label. Right side: icon box (44×44px).

### Layout Shell
- Sidebar width: 256px (expanded), 64px (collapsed)
- Content area: fills remaining width, min 320px
- Content padding: 16px (mobile), 24px (desktop)
- Content inner container: white background, rounded-2xl, shadow-sm, padding 16–24px
- Max content width: none (fills viewport), but profile page content is max ~1200px within the shell
- Mobile breakpoint: 768px. Below this, sidebar collapses to bottom nav or hidden. Profile becomes single-column.

---

## Prompt 1 — Student Profile (Desktop)

> **Viewport:** 1440×900px desktop, dark sidebar visible on left (256px). Content area is 1184px wide.
> **Theme:** Light mode.

---

Design a **muLearn student profile page** for a desktop browser. This is the public-facing profile of a student/learner named **Arjun Menon** (MUID: `arjun@mulearn`). The profile is set to public.

Use the following design system exactly:
- Fonts: Bricolage Grotesque (headings, numbers), Plus Jakarta Sans (body, labels)
- Background: `#fefefe`
- Cards: white, `border: 1px solid #e2e8f0`, `border-radius: 18px`
- Brand colors: purple `#8f44ed`, blue `#2e85fe`

---

### PROFILE HEADER CARD

The header is a full-width card (rounded-2xl, shadow-sm) with two layers:

**Banner area (top layer):**
Height: 180px. Background: a rich gradient mesh — `linear-gradient(135deg, #7c3aed 0%, #2e85fe 60%, #06b6d4 100%)` overlaid with a very subtle noise/grain texture (5% opacity white dots) for depth. Do NOT use a photograph here — the gradient IS the banner.

**Profile identity bar (bottom of header card, below the banner):**
White background area, height ~100px, padding 0 24px 20px 24px. Content layout is a horizontal flex row.

Left cluster:
- Avatar: 96×96px, rounded-2xl, Arjun's face photo. White 3px border. Positioned so it sits half-inside the banner and half below (top edge at banner bottom minus 48px). Has a small pill badge in the bottom-right corner of the avatar: "⚡ Lvl 4" — rounded-full, gradient violet-to-purple bg, white text, 11px font, 4px 8px padding.
- To the right of the avatar, vertically stacked:
  - Name: "Arjun Menon" — Bricolage Grotesque 24px weight 700, near-black
  - MUID: "arjun@mulearn" — 12px muted-foreground, with a small copy icon to the right
  - Join date: "Member since March 2023" — 11px muted-foreground
  - Bio / tagline: "Full-stack developer · passionate about open source and developer tools" — 14px, `#475569`, italic-style or slightly lighter weight. This is the single most important text addition — it gives the student a voice.
  - "Open to" chips row: small rounded-full chips with icons. Show 3: a green chip "Internship" (briefcase icon), a blue chip "Collaboration" (handshake icon), a purple chip "Mentorship" (graduation cap icon). Each chip: 11px font, weight 600, colored background at 10–15% opacity, matching text color, 4px 10px padding. Chips have 6px gap between them.

Right cluster (flush right, vertically centered):
- "Resume" button: outline variant, rounded-full, `border: 1.5px solid #e2e8f0`, "↓ Resume" text, 13px
- "Share Profile" button: ghost variant, rounded-full, share icon, "Share" text
- "Edit Profile" button: default variant (black bg, white text), rounded-full, pencil icon, "Edit Profile"
- Buttons arranged horizontally with 8px gap

---

### STATS STRIP

Immediately below the header card, a horizontal strip of 3 stat cards. Each card is white, rounded-2xl, shadow-sm, 1px border, padding 20px. They sit in a 3-column grid with 16px gap.

**Card 1 — Total Karma:**
- Top: Small icon box (44×44px, rounded-xl, bg `#faf5ff`, violet icon ⚡) aligned right
- Label: "Total Karma" — 11px, uppercase, letter-spacing 0.06em, `#94a3b8`
- Value: "12,847" — Bricolage Grotesque 36px weight 700, near-black
- Sub-label: "↑ +340 this month" — 12px, `#10b981`, with upward arrow

**Card 2 — Global Rank:**
- Icon box: 44×44px, bg `#eff6ff`, blue icon 🏆
- Label: "Global Rank"
- Value: "#284"
- Sub-label: "Top 3 percentile"

**Card 3 — Current Level:**
- Icon box: 44×44px, bg `#fff7ed`, amber icon 🎯
- Label: "Current Level"
- Value: "Level 4"
- Sub-label: small horizontal progress bar (8px tall, rounded-full, bg `#f1f5f9`, filled portion in violet gradient showing 70% progress) + "2,153 karma to Level 5"

---

### MAIN CONTENT AREA (below stats strip)

Two-column layout: left content area (flex-1, ~780px) + right sidebar (280px). Gap: 24px.

#### LEFT — TAB NAVIGATION + CONTENT

**Tab strip:** "Portfolio" (active) · "Journey" · "Achievements" · "Activity"
Tab strip is `bg: #f1f5f9`, rounded-xl, padding 4px, full-width.

**PORTFOLIO TAB (shown as default active):**

Section 1 — Featured Projects:
- Section heading: "Featured Projects" — 16px weight 600, near-black. Right side: "+ Add Project" link in blue (only visible on own profile)
- Below: 2-column grid, gap 16px, showing 2 project cards (with space for 2 more shown as dashed-border "Add project" empty states)

Project Card design: white card, rounded-2xl, border, shadow-sm, padding 20px. Layout:
- Top row: project title (16px weight 600) left + small tech stack chips right (3 max, rounded-full, bg `#f1f5f9`, text muted-foreground 11px)
- Below title: 2-line description text (14px, muted-foreground, clamped)
- Bottom row: GitHub icon link + Live Demo icon link (both 12px blue links) left side; a small project vote count right side (upward chevron + number, muted)
- Optional: a subtle cover image strip at the top of the card (60px tall, rounded-t-2xl, gradient bg if no image)

Show card 1: "DevTrack — Open source developer time tracker" with tags "React", "TypeScript", "Supabase"
Show card 2: "KappaBot — Discord bot for community karma tracking" with tags "Python", "discord.py"

Section 2 — Certifications:
- Section heading: "Certifications"
- Horizontal list of 2 certification chips: each a horizontal card row (not a grid) — icon (the issuer's logo placeholder), cert name, issuer, issued date, and a small "Verify ↗" link in blue. Height ~56px, border-bottom divider between items (not separate cards for space efficiency).

Show: "AWS Cloud Practitioner · Amazon Web Services · Dec 2024" and "Google UX Design · Coursera · Aug 2024"

---

#### RIGHT — SIDEBAR

Sidebar is a vertical stack of cards with 16px gap.

**Card 1 — Currently Building:**
- Header: small flame icon 🔥 (amber icon box) + "Currently Building" title
- Body: a freeform text block — "Building a peer code review tool for college hackathon teams. Looking for a backend collaborator." — 14px, `#374151`, styled like a sticky note or a highlighted text block (very light amber tint bg `#fffbeb`, left border accent 3px solid `#f59e0b`, rounded-r-xl, padding 12px)

**Card 2 — Interest Groups:**
- Header: icon box (violet, layers icon) + "Interest Groups"
- List of 3 IGs: each item is a flex row with a colored dot (6px circle), IG name (14px weight 500), karma count right-aligned (12px muted). Use colors: indigo dot for "Web Development · 4,200 karma", purple for "Open Source · 3,100 karma", blue for "DevOps · 1,547 karma"

**Card 3 — On the Web (Socials):**
- Header: icon box (blue, globe icon) + "On the Web"
- List of social links: each is a flex row with the service icon (20px, muted), handle text (13px, `#374151`), external link arrow. Show: GitHub "arjunmenon", LinkedIn "arjun-menon-dev", Twitter "@arjunbuilds"

**Card 4 — Roles & Badges (Sub-role card):**
- Header: icon box (emerald, shield icon) + "Roles"
- Show a role badge item:
  - "🏛 Campus Lead" — emerald chip
  - Below it: "Government Engineering College, Thrissur" — 12px, muted, with a right-arrow link
  - "Campus Lead since Jan 2024 · 1 year 4 months" — 11px, muted-foreground
  - "128 students managed" — small stat, 12px, weight 600, emerald-colored
  - Then a normal badge: "IG Lead — Web Dev" — violet chip, similar treatment

---

## Prompt 2 — Student Profile (Mobile)

> **Viewport:** 390×844px (iPhone 14). Single column. No sidebar.

Design the **mobile view of the same muLearn student profile** (Arjun Menon) for a 390px viewport.

Use identical design system (colors, fonts, shadows). Adapt the layout as follows:

**Header card:**
- Banner: 140px tall (shorter than desktop)
- Avatar: 72×72px, positioned same way (overlapping banner bottom)
- Name, MUID, bio: stacked, full-width below avatar
- Bio text wraps naturally
- "Open to" chips scroll horizontally (no line break) — horizontal scroll with `overflow-x: auto`, no scrollbar visible
- Action buttons: collapsed. Show only a share icon button and a "Edit" icon button in the top-right corner of the banner overlaid as icon-only buttons (32×32px, white bg/15 blur, rounded-full)

**Stats strip:**
- Change 3-col to a horizontal scroll strip of 3 compact stat pills. Each pill: white card, rounded-2xl, border, px-16px py-12px, min-width 140px. Scrolls horizontally.

**Tab strip:**
- Full width, horizontal scroll, tabs do NOT wrap

**Content (below tabs):**
- Featured Projects: single column (not 2-col). Cards full-width.
- Certifications: same list layout, full-width.

**No sidebar.** Sidebar content ("Currently Building", Interest Groups, Socials) appears at the BOTTOM of the page, below the tab content, as full-width cards stacked vertically. "Currently Building" is shown first since it's the highest-engagement element.

**Bottom sticky bar:**
A white bar pinned to the bottom of the viewport, `box-shadow: 0 -1px 0 #e2e8f0, 0 -4px 12px rgba(0,0,0,0.06)`, height 72px including safe-area padding. Contains: Tab navigation (4 icons with labels). Portfolio icon, Journey icon, Achievements icon, Activity icon. Active tab in black, inactive in muted-foreground.

---

## Prompt 3 — Mentor Profile (Desktop)

> **Viewport:** 1440×900px desktop.
> **Key design mandate:** This profile's primary purpose is to help a student decide whether to request mentorship. Every design decision flows from that goal. The "Request Mentorship" CTA must be visible without scrolling.

Design a **muLearn mentor profile page** for a desktop browser. The mentor is **Priya Krishnan** (MUID: `priya@mulearn`), a Senior Software Engineer at Google with 8 years of experience. She is **Open to new mentees**.

This profile is fundamentally different from the student profile. Do NOT show karma rank or level progression. The currency here is professional credibility and availability.

---

### MENTOR PROFILE HEADER CARD

**Banner area:**
Height: 180px. Background: dark professional gradient — `linear-gradient(135deg, #1e293b 0%, #0f172a 100%)` (deep slate/navy). On top of this gradient, add a very subtle abstract pattern: lightly visible concentric arcs or a mesh grid in white at 4% opacity. This signals professionalism, not a gaming/learning context.

**Profile identity bar:**
White background, padding 0 24px 20px 24px.

Left cluster:
- Avatar: 96×96px, **rounded-full** (circular, not square — more professional convention for mentor), white 3px border. Positioned overlapping banner.
- Name: "Priya Krishnan" — Bricolage Grotesque 24px weight 700
- **Professional headline** (replaces level badge): "Senior Software Engineer · Google · 8 YOE" — 14px weight 600, `#374151`. This is the first thing you read after the name.
- Expertise tags: a row of 4 tags beneath the headline — "React" (blue chip), "System Design" (violet chip), "Career Switch" (emerald chip), "Interview Prep" (amber chip). These are 11px rounded-full chips.
- MUID: "priya@mulearn" — 11px muted-foreground

Right cluster:
- **Availability status pill:** This is the most important element on the right side. A large pill, `background: #ecfdf5`, `border: 1.5px solid #bbf7d0`, `color: #065f46`. Inside: green dot (8px, `#10b981`), "Open to Mentees" text (13px weight 700). Make this pill feel important — it is the student's green light to reach out.
- Below the availability pill: "Typically responds within 2 days" — 11px, muted-foreground, with a clock icon
- **Request Mentorship button:** Trusty variant — `background: linear-gradient(135deg, #2e85fe 0%, #8f44ed 100%)`, white text, rounded-full, 14px weight 600, px-20px py-10px, elevated shadow. Text: "Request Mentorship →". This is the PRIMARY CTA.
- Secondary actions below: "Schedule a Call" (outline, smaller) and share icon button

---

### MENTOR STATS STRIP

4-column stat strip (narrower cards than student, adjusted for 4 items):

**Card 1 — Mentees Helped:**
- Icon box: emerald, users icon
- Value: "47"
- Sub: "Total mentees"

**Card 2 — Avg Rating:**
- Icon box: amber, star icon
- Value: "4.9"
- Sub: "Based on 38 ratings" — below, show 5 small star icons (4 full, 1 90%-filled), amber color, 14px

**Card 3 — Completion Rate:**
- Icon box: blue, check-circle icon
- Value: "94%"
- Sub: "Sessions completed"

**Card 4 — Active Since:**
- Icon box: violet, calendar icon
- Value: "14 mo"
- Sub: "On muLearn · since Mar 2025"

---

### MAIN CONTENT AREA

Two-column: left content (~780px) + right sidebar (280px).

#### LEFT CONTENT — TABS

Tabs: "Expertise" (active) · "Track Record" · "About" · "Resources"

**EXPERTISE TAB:**

Section 1 — What I Mentor:
- Section heading: "What I can help you with"
- Grid of 6 expertise tags in a slightly larger chip format (not tiny 11px chips — these are 13px, 8px 14px padding, icon + label, rounded-full). Show: "⚛️ React & Frontend", "🏗 System Design", "🔄 Career Switching", "🎯 Interview Prep", "🧵 API Design", "🌐 Open Source Contributions"

Section 2 — Mentoring Format:
- Heading: "How I work with mentees"
- 3 format cards in a horizontal row: each a small white card (rounded-xl, border, p-16px). Show:
  - "1:1 Sessions" — with a person icon, "Weekly 45-min video calls"
  - "Async Q&A" — with a message icon, "Reply within 48 hours"
  - "Project Review" — with a code icon, "PR reviews & feedback"
- Active/offered formats shown with a subtle emerald checkmark in the top-right corner of the card.

Section 3 — My Mentees (teaser):
- Heading: "Mentees I've worked with" — with a "View Track Record →" link
- A horizontal strip of 4 avatar circles (40px, circular, with name below, and their level badge). Overlapping style like an avatar group. Following each other with -8px margin. Shows 4 mentees, then a "+43 more" count circle.

**ABOUT TAB (preview, not active — shown collapsed):**
Not shown since Expertise is active.

---

#### RIGHT SIDEBAR

**Card 1 — Book a Session (Sticky CTA card):**
This card has a light gradient background: `background: linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)`, border `1.5px solid #c7d2fe`, rounded-2xl. It is the visual anchor of the sidebar.
- Top: "Availability" heading (14px weight 600)
- Availability info: "2–3 slots per week" with a calendar icon. Below: "Sessions: 45 min · Video call"
- Languages: "English, Malayalam" with globe icon
- Divider
- "Request Mentorship" button: trusty gradient, full-width, rounded-full, white text, "Request Mentorship →"
- Below button: small text "Free · No credit card" (11px, muted-foreground)

**Card 2 — Mentoring Languages:**
Simple list. "English", "Malayalam". Each with a flag emoji and check.

**Card 3 — Professional Background:**
- Current: Google logo placeholder (circle with G) + "Senior SWE" + "Google" — 14px
- Industry: "Engineering / Software"
- Experience: "8 Years"
- LinkedIn link: "View LinkedIn ↗" in blue, 13px

**Card 4 — Articles & Talks:**
- 2 items, each: title (13px weight 500, link style, blue), source (11px muted). Show: "How I transitioned from service companies to product", "System Design for Frontend Engineers (Talk @ GDG 2025)"

---

### MENTOR PROFILE — IMPORTANT VISUAL NOTES

- The dark slate banner (unlike the vibrant gradient on student profiles) signals seriousness. The student sees this and understands: this is a professional, not a peer.
- The "Open to Mentees" green pill should be immediately eye-catching — it answers the student's most important question before they read anything else.
- The sidebar "Book a Session" card should have a soft gradient that makes it feel premium without being distracting. It is the single most important element on the right side.
- Do NOT show karma, level, or gaming elements anywhere on the mentor profile. Those belong to the student identity.

---

## Prompt 4 — Company Profile (Desktop)

> **Viewport:** 1440×900px desktop.
> **Key design mandate:** This is a talent brand page, not a personal profile. It is architecturally closer to a LinkedIn company page. It uses full-width sections instead of the card+sidebar layout. Students should see it and immediately know if they want to work here.

Design the **muLearn company profile page** for **NovaTech Solutions**, a verified tech company on muLearn.

---

### COMPANY PROFILE HEADER

The header is a full-width card (rounded-2xl, shadow-sm) structured as two sub-sections:

**Hero banner:**
Height: 220px (taller than personal profiles — this is a brand moment). Background: the company's brand image, OR (if no image) a clean abstract geometric pattern on a deep indigo/slate background: `linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)` with subtle geometric wireframe shapes (hexagons or circuits) at 8% white opacity. This feels corporate but modern.

**Company identity bar (below banner):**
White background, padding 0 24px 24px 24px.

Left cluster:
- **Company logo:** 72×72px square, rounded-2xl, white background, subtle shadow `0 2px 8px rgba(0,0,0,0.12)`, border `1px solid #e2e8f0`. Positioned overlapping the banner (same technique as avatar). Logo is the brand mark, not an avatar. If no logo: initials in a brand gradient.
- Company name: "NovaTech Solutions" — Bricolage Grotesque 28px weight 700
- Tagline: "Building developer tools that ship faster" — 15px, `#475569`, below the name
- Meta row (below tagline, horizontal flex, gap 16px, 12px Plus Jakarta Sans, `#64748b`):
  - 🏭 "Software / B2B SaaS" (industry)
  - 👥 "50–200 employees" (size chip)
  - 📍 "Bengaluru, India" (location)
  - 📅 "Founded 2018"
  - 🌐 "Hybrid · 3 days/week" (remote policy chip, blue outline chip)
- **Verified badge:** Inline in the meta row or just below the name — emerald chip with checkmark icon: "✓ Verified by muLearn" — `bg: #ecfdf5`, `color: #065f46`, `border: 1px solid #bbf7d0`, 12px weight 600.

Right cluster (flush right):
- "3 Open Roles" — large, Bricolage Grotesque 24px weight 700, emerald-colored, with a right arrow
- Below: small text "Updated 2 days ago" — 11px muted
- Action buttons row: "View Open Roles" (primary black, rounded-full) + "Follow" (outline, rounded-full, + icon) + share icon button

---

### COMPANY CONTENT AREA — FULL WIDTH SECTIONS (no sidebar)

This is NOT a sidebar layout. All sections are full-width (or 2-column where appropriate). This is a page, not a card with a sidebar.

**Section 1 — Active Jobs (most important for students)**

Position this IMMEDIATELY below the header card (above culture, above about). A student's first question is "can I work here?" Answer it immediately.

Section header: "Open Roles" — H2, near-black, with "View all →" link right-aligned in blue

A 3-column card grid of job listing cards. Each job card: white, rounded-2xl, border, shadow-sm, padding 20px, hover state (shadow-md, slight lift).

Job card content:
- Top: Job type chip (rounded-full, 11px) — "Internship" in amber, or "Full-time" in emerald, or "Contract" in blue
- Job title: 16px weight 600, near-black
- Sub-row: 📍 location (12px muted) · 💰 "₹8,000–12,000/mo" or "₹8–15 LPA" (12px muted)
- Tags: small tech stack chips (11px, rounded-full, bg `#f1f5f9`) — "React", "Node.js", "PostgreSQL" (max 3 shown)
- Footer row: "Posted 3 days ago" (11px muted-foreground left) + "Apply →" button (small, outline variant, right)

Show 3 cards. One internship, one full-time, one freelance/contract.
Below the grid: "No match? Follow NovaTech to get notified of new openings" — soft callout text with a Follow button.

**Section 2 — Culture & Identity**

2-column layout: left (text) + right (image gallery).

Left (60% width):
- Section heading: "Life at NovaTech" — H2
- Culture text: "We believe in shipping fast and learning faster. Our team is 60 engineers who obsess over developer experience — we use the tools we build, which means every decision is real." — 15px, `#374151`, line-height 1.7
- Perks: horizontal wrap of perk chips — "🕐 Flexible Hours", "📚 Learning Budget", "💻 MacBook Pro", "🏥 Health Insurance", "🏠 Remote Friendly", "⚡ Fast Growth". Each: rounded-full, bg `#f8fafc`, border `1px solid #e2e8f0`, 12px, weight 500, black text with emoji prefix. Gap 8px.
- Below perks: "Tech Stack" sub-heading + tech tag chips: "React", "Next.js", "Go", "PostgreSQL", "AWS", "Figma" — same chip style but bg `#f5f3ff`, text `#5b21b6` (violet tint).

Right (40% width):
- Image gallery: 2×2 grid of image tiles (each ~200px tall, rounded-xl, object-cover). Show as placeholder gradient tiles in different colors (not blank boxes — use the brand gradient variants). Below the 2×2: a small "+8 more" button.

**Section 3 — muLearn Credibility (platform-specific trust signals)**

Full-width card with a light gradient bg: `linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)`, rounded-2xl, border `1px solid #ddd6fe`, padding 24px 32px.

Horizontal flex layout with 4 stats and a description:

Left: heading "muLearn × NovaTech" (Bricolage Grotesque 20px) + 1-line context "Verifying talent, building trust" (14px muted).

Right: 4 inline stats:
- "12 muLearn hires" — Bricolage Grotesque 28px bold, violet colored. Below: "Students hired via platform" — 11px muted
- "Avg 6,200 karma" — Bricolage Grotesque 28px bold. Below: "Average karma of hires" — 11px muted
- "3 Campus events" — Bricolage Grotesque 28px bold. Below: "Events hosted on muLearn" — 11px muted
- "Member since 2024" — 16px weight 600. Below: "Verified partner" — 11px muted

Separate these 4 stats with light vertical dividers.

**Section 4 — Employee Testimonials**

Section heading: "Hear from muLearn alumni at NovaTech" — H2

Horizontal scroll of 3 testimonial cards (shown in a row, not a grid). Each testimonial card: white, rounded-2xl, border, shadow-sm, p-24px, min-width 320px.
Card content:
- Large open-quote character "❝" in violet (`#8f44ed`), 40px
- Quote text: 14px, `#374151`, italic style, 3–4 lines
- Bottom row: avatar (40px, circular) + name (13px weight 600) + "Lvl 4 · Web Development" (11px, violet chip) + "Joined via muLearn 2024" (11px muted)

Show 2 complete testimonials, 1 partially visible to signal scrollability.

---

### COMPANY PROFILE — VISUAL NOTES

- The full-width layout (no sidebar) is intentional. A company profile has no "at-a-glance stats" for the student to assess — they need to browse. Give them room.
- Job listings FIRST. Every student visiting a company page wants to know if there's a role for them. Don't bury this under a "About Us" wall of text.
- The platform credibility section (muLearn hires, avg karma) is a unique differentiator that no other job board has. Make it feel like a feature, not a footnote.
- The verified badge should be small but unmistakable — next to the company name, not buried in a metadata row.

---

## Prompt 5 — Enabler Profile (Desktop)

> **Viewport:** 1440×900px desktop.
> **Key design mandate:** The enabler's profile leads with impact, not identity. The primary audience is campus leads deciding whether to reach out. Stats about reach (campuses, students) should dominate the above-the-fold experience.

Design the **muLearn enabler profile page** for **Riya Thomas**, a Lead Enabler for the Kerala Zone.

---

### ENABLER PROFILE HEADER CARD

**Banner area:**
Height: 180px. Background: `linear-gradient(135deg, #0d9488 0%, #0284c7 60%, #7c3aed 100%)` (teal-to-blue-to-purple — community vibes, warmth, growth). Add a very subtle world map wireframe outline at 6% white opacity in the background — signals geographic community reach without being literal.

**Profile identity bar:**
White background, padding 0 24px 20px 24px.

Left cluster:
- Avatar: 96×96px, rounded-full (same as mentor — enablers are community leaders, circular feels authoritative), white 3px border, overlapping banner
- Name: "Riya Thomas" — Bricolage Grotesque 24px weight 700
- Role badge: "Lead Enabler" — teal chip (bg `#f0fdfa`, text `#0f766e`, border `#99f6e4`, weight 700, 13px). Immediately after name inline.
- Zone: "📍 Kerala Zone" — 14px, `#475569`, with map-pin icon
- Tenure: "Enabler since January 2023 · 2 years 4 months" — 12px, muted-foreground
- Bio: "Community builder helping campuses grow from day 0. Former student leader at GEC Thrissur." — 14px, `#374151`

Right cluster:
- **Impact summary chips:** Three large-ish chips arranged horizontally, slightly more prominent than regular badge chips — height ~32px, font 13px weight 700.
  - 🏛 "5 Campuses" — teal chip
  - 👥 "234 Students" — blue chip
  - 🔵 "12 LCs" — violet chip
  These communicate "this is a high-impact enabler" immediately.
- "Connect with Enabler" button: trusty gradient (blue-to-purple), white text, rounded-full, 14px weight 600
- "Share Profile" ghost button

---

### ENABLER IMPACT DASHBOARD (immediately below header — this IS the profile)

A 5-card stats strip. Unlike the 3-card student strip, this strip is the hero content — make the cards slightly taller and more generous. White cards, rounded-2xl, shadow-sm, border. Padding 24px. 5-column grid.

**Card 1 — Campuses Activated:**
- Icon box: 44×44px, teal bg `#f0fdfa`, building icon, teal color `#0d9488`
- Label: "Campuses Activated"
- Value: "5" — Bricolage Grotesque 40px bold, near-black
- Sub: "Active community hubs"

**Card 2 — Students Onboarded:**
- Icon box: blue
- Value: "234"
- Sub: "muLearn members via Riya"

**Card 3 — Learning Circles:**
- Icon box: violet
- Value: "12"
- Sub: "LCs helped establish"

**Card 4 — Events Co-organized:**
- Icon box: amber
- Value: "28"
- Sub: "Community events"

**Card 5 — Zone Karma Generated:**
- Icon box: emerald
- Value: "1.2L"
- Sub: "Total karma in Kerala Zone"

Note: "1.2L" is Indian notation for 120,000. Use this shorthand — it's culturally appropriate for the Indian audience.

---

### MAIN CONTENT AREA

Two-column: left content area (~780px) + right sidebar (280px).

#### LEFT CONTENT — TABS

Tabs: "Campus Portfolio" (active) · "Impact" · "About" · "Recognition"

**CAMPUS PORTFOLIO TAB:**

Section heading: "Campuses in My Portfolio" — H2

A vertical list of campus cards. Each campus card: white, rounded-2xl, border, shadow-sm, padding 20px. Hover state: shadow-md.

Campus card layout:
- Left: campus logo or initials avatar (48×48px, rounded-xl), institution name (16px weight 600), location (12px muted)
- Middle: stats chips: "45 students" (blue chip) · "3 LCs" (violet chip) · "Active since Dec 2023" (muted chip)
- Right: "View Campus →" link in blue, 13px

Show 3 campus cards (enough to communicate pattern, suggest scrollability):
1. "Government Engineering College, Thrissur · Thrissur · 89 students · 4 LCs · Active since Jun 2023"
2. "Model Engineering College, Kochi · Kochi · 67 students · 3 LCs · Active since Jan 2024"
3. "NSS College of Engineering, Palakkad · Palakkad · 45 students · 2 LCs · Active since Apr 2024"

Below cards: small text "Showing 3 of 5 campuses" + "View all →" link

**IMPACT TAB (not active, but peek at structure):**
Not shown in detail — the dashboard above already surfaces the key numbers.

---

#### RIGHT SIDEBAR

**Card 1 — Connect with Enabler:**
- Gradient bg card (same pattern as mentor's "Book a Session" card): `linear-gradient(135deg, #f0fdfa 0%, #eff6ff 100%)`, border teal/blue tint
- Header: "Looking for an enabler?"
- Body text: "Riya helps campus leads grow their communities. Reach out if you're starting a muLearn chapter." — 13px, `#374151`
- "Connect with Enabler" button: trusty gradient, full-width, rounded-full
- Below: "Open to connect" pill — teal, with green dot, same as mentor availability pill

**Card 2 — Focus Areas:**
- Icon box + "Focus Areas" heading
- 4 chips: "Community Building", "Campus Activation", "Event Management", "Mentorship" — styled as muted chips

**Card 3 — Languages:**
- Icon box (globe, blue) + "Mentors in" heading
- Malayalam 🇮🇳, English 🇬🇧 — simple list

**Card 4 — Recognition:**
- Icon box (trophy, amber) + "Recognition" heading
- 2 badge items (use the achievement chip style, same as student achievements): "🏆 Top Enabler — Q1 2025", "⭐ 100 Students Milestone — Nov 2024"

---

### ENABLER PROFILE — VISUAL NOTES

- The teal-to-blue-to-purple banner gradient is warmer and more human than the cold slate used for mentors. Enablers are community figures — the warmth should be immediate.
- Impact numbers should be BIG. Bricolage Grotesque at 40px in the impact dashboard sends a clear message: this person has done significant work.
- The "Campuses in Portfolio" section is the equivalent of a portfolio for a designer — it's the proof of work. Treat it with the same care as the student's "Featured Projects" section.
- Do NOT show karma rank or level on the enabler profile. Their credibility metric is campuses + students, not a karma score. That's someone else's story.

---

## Prompt 6 — Shared Component: "Open To" Chip Set

> Use this for the student profile's availability signal. Generate as an isolated component.

Design a set of **"Open To" availability chips** for muLearn student profiles. These are compact, scannable signals telling visitors what kind of opportunities the student is interested in.

Chip design rules:
- Shape: rounded-full (pill)
- Height: 26px
- Padding: 4px 12px
- Font: Plus Jakarta Sans, 12px, weight 600
- Icon: 14px, inline left of text, 4px gap
- Style: colored bg at 12–15% opacity, matching solid text color, NO border (the color itself defines the boundary)

Generate these 4 variants:
1. **Internship** — briefcase icon, bg `rgba(5, 150, 105, 0.12)`, text `#065f46` (emerald) — "Internship"
2. **Collaboration** — handshake icon, bg `rgba(46, 133, 254, 0.12)`, text `#1e40af` (blue) — "Collaboration"
3. **Mentorship** — graduation-cap icon, bg `rgba(124, 58, 237, 0.12)`, text `#5b21b6` (violet) — "Mentorship"
4. **Open Source** — code-branch icon, bg `rgba(245, 158, 11, 0.12)`, text `#92400e` (amber) — "Open Source"

Also show the chips arranged in a horizontal row with 6px gap, as they would appear below a student's name on their profile.

---

## Prompt 7 — Shared Component: Availability Status Pills (Mentor)

> Three states for mentor availability. Generate as isolated components.

Design three variants of the **Mentor Availability Status Pill** — the most important status indicator on a mentor profile.

Each pill: rounded-full, padding 6px 14px, inline-flex items-center gap-8px. Font: Plus Jakarta Sans 13px weight 700.

Left element in each: a solid circle dot, 8px diameter.

**Variant 1 — Open:**
- Dot: `#10b981` (emerald-500), with a subtle pulse animation ring (16px, `rgba(16,185,129,0.2)`, animated scale 1→1.5→1)
- Background: `#ecfdf5`
- Border: `1.5px solid #bbf7d0`
- Text: "Open to Mentees" — `#065f46`

**Variant 2 — Waitlist:**
- Dot: `#f59e0b` (amber-500)
- Background: `#fffbeb`
- Border: `1.5px solid #fde68a`
- Text: "Joining Waitlist" — `#92400e`

**Variant 3 — Closed:**
- Dot: `#94a3b8` (slate-400)
- Background: `#f8fafc`
- Border: `1.5px solid #e2e8f0`
- Text: "Not Taking Mentees" — `#64748b`

Show all three stacked vertically with 8px gap for comparison.

---

## Prompt 8 — Shared Component: Role Tenure Badge (Campus Lead / IG Lead)

> For the student profile sidebar. Generates the enhanced sub-role credibility card.

Design a **Role Tenure Badge card** for muLearn student profiles — used in the sidebar to show a student's leadership roles with context beyond just a chip.

The card is white, rounded-2xl, border, shadow-sm, padding 20px.

Card header: icon box (36×36px, emerald bg `#ecfdf5`, shield icon in `#059669`) + title "Leadership Roles" (16px weight 600)

Role item (repeat twice):

**Item 1 — Campus Lead:**
- Role chip: rounded-full, emerald bg `#ecfdf5`, text `#065f46`, "Campus Lead" text, 12px weight 700
- Institution name: "Government Engineering College, Thrissur" — 13px, `#374151`, with a rightward arrow that links to the campus page
- Tenure: "Since Jan 2024 · 1 year 4 months" — 11px, `#94a3b8`
- Impact stat: "128 students managed" — 12px weight 600, `#059669` (emerald) — small emerald dot to the left

Divider between items.

**Item 2 — IG Lead:**
- Role chip: violet, "IG Lead — Web Dev"
- Entity: "Web Development Interest Group" — 13px with arrow link
- Tenure: "Since Mar 2024 · 1 year"
- Impact stat: "3,200 karma contributed to IG" — 12px, `#5b21b6` (violet)

---

## Prompt 9 — Shared Component: Activity Heatmap

> The consistency strip for student profiles. Mirrors GitHub contribution graph.

Design a **Karma Activity Heatmap** component for the muLearn student profile — a contribution-graph-style calendar strip showing daily karma activity over the past 52 weeks (1 year).

**Layout:** Full-width of its container. Fixed height: 96px total (rows of cells + month labels).

**Grid structure:** 52 columns (weeks) × 7 rows (days Mon–Sun). Each cell: 12×12px, 2px gap between cells, rounded-sm (3px radius).

**Color scale** (empty to high activity, based on karma earned that day):
- 0 karma: `#f1f5f9` (muted, slate-100)
- 1–10 karma: `#ddd6fe` (violet-200)
- 11–50 karma: `#a78bfa` (violet-400)
- 51–200 karma: `#7c3aed` (violet-600)
- 200+ karma: `#4c1d95` (violet-900)

**Month labels:** Small text labels above the grid at the start of each month — "Jun", "Jul", "Aug" etc. 10px, `#94a3b8`.

**Tooltip (hover state):** Show a small floating tooltip on cell hover: white card, rounded-lg, shadow-md, "14 karma · Jun 12, 2025" — 12px.

**Below the grid:** A legend row (right-aligned): "Less" + 5 sample cells (empty to full) + "More" — 11px, muted-foreground.

**Summary line above grid:** "342 karma earned in the last year · Current streak: 12 days 🔥" — 13px weight 500, near-black. Right-aligned.

---

## Design QA Checklist

Before submitting any generated screen as final, verify:

- [ ] Bricolage Grotesque used for all names, stat numbers, section headings
- [ ] Plus Jakarta Sans used for body text, labels, captions, chip text
- [ ] No personal profile elements (karma, rank, level) appear on Company or Enabler profiles
- [ ] No professional identity elements (headline, expertise, availability) appear on the Student profile header
- [ ] "Request Mentorship" CTA is visible without scrolling on the Mentor profile
- [ ] Job listings are the FIRST content section (above culture) on Company profiles
- [ ] Enabler impact stats (campuses, students) are larger and more prominent than personal stats
- [ ] Card border-radius is 18px (rounded-2xl) consistently
- [ ] Buttons use rounded-full, never squared corners
- [ ] Background is `#fefefe` (not `#ffffff`) — the warm off-white matters
- [ ] Dark mode: NOT required for initial Stitch output. Design in light mode only.
- [ ] All stat values use Bricolage Grotesque, all descriptive labels use Plus Jakarta Sans
- [ ] The "Open To" chips use colored backgrounds at 12–15% opacity — they should be subtle, not garish
