# Profile Pages — Feature Audit, API Inventory & Requirements

**Date:** 2026-05-06
**Author:** Product / UX Analysis
**Scope:** Role-based profile page feature gaps, API inventory, and backend/frontend action plan for Student, Mentor, Company, and Enabler roles.

---

## Current State Assessment

The existing profile page was designed around the **student/learner identity** — karma, rank, level progression, IGs, and basic details. It works well for that persona but is fundamentally incomplete for roles where the *purpose* of the profile is entirely different:

| | Student | Mentor | Company | Enabler |
|---|---|---|---|---|
| **Goal of profile** | Showcase learning journey | Attract mentees, signal expertise | Attract talent, post opportunities | Show community impact |
| **Primary audience** | Peers, mentors, companies | Students seeking guidance | Students job-hunting | Campus leads, students |
| **Core value prop** | Growth & credibility | Experience & track record | Culture & opportunities | Reach & enablement |
| **Current coverage** | ~70% | ~20% | ~15% | ~10% |

---

## API Inventory

### Legend for feature annotations

| Tag | Meaning |
|---|---|
| `✅ Connected` | Available in backend **and** wired to the dashboard profile page |
| `🔌 Not wired` | Available in backend, **not** connected to the dashboard profile page |
| `🔧 Extend backend` | Field/data does not exist yet — add to an existing model/endpoint |
| `🆕 New endpoint` | Genuinely new model + endpoint required |

---

### A. Backend-available endpoints (mulearnbackend)

#### Profile & User

| Method | Endpoint | What it returns |
|---|---|---|
| GET / PATCH / DELETE | `/api/v1/dashboard/profile/` | Editable user profile: full_name, email, mobile, gender, dob, communities |
| GET | `/api/v1/dashboard/profile/user-profile/` | Full profile for current user: muid, karma, rank, percentile, level, roles, interest_groups, karma_distribution |
| GET | `/api/v1/dashboard/profile/user-profile/{muid}/` | Same as above for any public profile |
| GET | `/api/v1/dashboard/profile/user-log/` | Karma activity log (current user) |
| GET | `/api/v1/dashboard/profile/user-log/{muid}/` | Karma activity log (by MUID) |
| GET | `/api/v1/dashboard/profile/get-user-levels/` | Level progression and tasks (current user) |
| GET | `/api/v1/dashboard/profile/get-user-levels/{muid}/` | Level progression (by MUID) |
| GET | `/api/v1/dashboard/profile/socials/` | Social links (current user) |
| GET | `/api/v1/dashboard/profile/socials/{muid}/` | Social links (by MUID) |
| PUT | `/api/v1/dashboard/profile/socials/edit/` | Update social links |
| GET | `/api/v1/dashboard/profile/rank/{muid}/` | Global and role-based rank |
| GET | `/api/v1/dashboard/profile/badges/{muid}/` | User badges/achievements |
| GET / PUT | `/api/v1/dashboard/profile/share-user-profile/` | Manage profile share settings |
| GET | `/api/v1/dashboard/profile/share-user-profile/{uuid}/` | View shared profile |
| GET | `/api/v1/dashboard/profile/qrcode-get/{uuid}/` | Shareable QR code |
| GET | `/api/v1/dashboard/profile/karma-feed/` | Karma activity feed |
| GET / PATCH | `/api/v1/dashboard/profile/user-preferences/` | Profile preferences (is_public etc.) |
| POST | `/api/v1/dashboard/user/profile/update/` | Upload profile picture |
| GET / PATCH | `/api/v1/dashboard/user/preferences/` | User preferences: domains, endgoals, interested_in_work, interested_in_gig_work |

#### Achievements

| Method | Endpoint | What it returns |
|---|---|---|
| GET | `/api/v1/dashboard/achievement/list/user/{muid}/` | All achievements claimed by user |
| GET | `/api/v1/dashboard/achievement/eligible/` | Achievements user can claim |
| GET | `/api/v1/dashboard/achievement/progress/` | Progress toward each achievement |

#### Skills

| Method | Endpoint | What it returns |
|---|---|---|
| GET | `/api/v1/dashboard/skill/` | All skills |
| GET | `/api/v1/dashboard/skill/dropdown/` | Active skills for dropdown |

#### Projects

| Method | Endpoint | What it returns |
|---|---|---|
| GET / POST | `/api/v1/dashboard/projects/` | List / create projects |
| GET / PATCH / DELETE | `/api/v1/dashboard/projects/{pk}/` | Project detail, edit, delete |
| POST | `/api/v1/dashboard/projects/vote/` | Vote on project |
| POST | `/api/v1/dashboard/projects/comment/` | Comment on project |

#### Company

| Method | Endpoint | What it returns |
|---|---|---|
| GET / POST / PATCH | `/api/v1/dashboard/company/profile/` | Authenticated company profile: name, logo, description, industry_sector, website_link, email, slug, location, company_size, linkedin_url, status |
| GET | `/api/v1/dashboard/company/profile/public/{slug}/` | Public company profile |
| GET | `/api/v1/dashboard/company/jobs/` | Company's job listings (paginated) |
| POST | `/api/v1/dashboard/company/jobs/create/` | Create job listing |
| GET / PATCH / DELETE | `/api/v1/dashboard/company/jobs/{jobId}/` | Job detail |
| POST / PATCH / DELETE | `/api/v1/dashboard/company/jobs/{jobId}/rules/` | Job eligibility rules (karma, skill thresholds) |

#### Campus / Enabler

| Method | Endpoint | What it returns |
|---|---|---|
| GET | `/api/v1/dashboard/campus/campus-details/` | Current user's campus: orgId, collegeName, karma, member counts, levels |
| GET | `/api/v1/dashboard/campus/campus-details/{org_id}/` | Public campus details |
| GET | `/api/v1/dashboard/campus/{org_id}/leaderboard/` | Campus student leaderboard |
| GET | `/api/v1/dashboard/campus/student-level/` | Level distribution for campus |
| GET | `/api/v1/dashboard/campus/ig-chapters/` | IG chapters for campus |
| GET | `/api/v1/dashboard/campus/events/` | Campus events |
| GET | `/api/v1/dashboard/campus/execom/` | Execom members |

---

### B. Dashboard — currently connected to profile pages

| Endpoint | Connected Where | Notes |
|---|---|---|
| GET `/api/v1/dashboard/profile/user-profile/` | Own profile page | Full profile including karma, rank, percentile |
| GET `/api/v1/dashboard/profile/user-profile/{muid}/` | Public profile `[muid]` | Read-only public view |
| PATCH `/api/v1/dashboard/profile/` | Edit profile form | Basic fields only |
| POST `/api/v1/dashboard/user/profile/update/` | Profile picture upload | Multipart |
| GET `/api/v1/dashboard/profile/user-log/{muid}/` | Karma History tab | Activity log |
| GET `/api/v1/dashboard/profile/get-user-levels/{muid}/` | Mu Voyage tab | Level + task data |
| GET `/api/v1/dashboard/profile/socials/{muid}/` | Socials sidebar | Display |
| PUT `/api/v1/dashboard/profile/socials/edit/` | Socials edit | Update |
| GET / PATCH `/api/v1/dashboard/user/preferences/` | Preferences (not on profile) | Domains, endgoals, work interest |
| GET / PUT `/api/v1/dashboard/profile/share-user-profile/` | Public toggle | is_public flag |
| GET `/api/v1/dashboard/achievement/list/user/{muid}/` | Achievements tab | Achievement list |
| GET `/api/v1/dashboard/company/profile/` | Company home | Not on profile page |
| GET `/api/v1/dashboard/company/jobs/` | Company jobs page | Not on profile page |
| GET `/api/v1/dashboard/campus/campus-details/` | Enabler home stats | Not on profile page |
| GET `/api/v1/dashboard/campus/{orgId}/leaderboard/` | Enabler home | Not on profile page |

**Not wired (exist in backend, missing from profile page):**
- `GET /api/v1/dashboard/profile/badges/{muid}/` — badges separate from achievements
- `GET /api/v1/dashboard/projects/` — user's projects not shown on profile
- `GET /api/v1/dashboard/company/profile/public/{slug}/` — students cannot view a company's public profile page
- Campus stats not surfaced on enabler's own profile card
- `GET /api/v1/dashboard/profile/rank/{muid}/` — rank is already in user-profile response; separate endpoint may have richer data

---

## Role 1 — Student

> Sub-roles (Campus Lead, IG Lead, Intern, Discord Mod, Bot Dev, Appraiser, Campus Activation) all fall under this identity. Their extra roles are badges/signals, not separate profile types.

### What exists
- Avatar, name, level badge, MUID, join date
- Karma / rank / percentile stats
- Basic Details tab, Karma History, Mu Voyage, Achievements
- Socials sidebar, roles badge list

### What's missing

**Identity Layer**
- [ ] Bio / tagline — one-liner the student writes about themselves. The single highest-impact missing field. Students have no voice on their own profile. `🔧 Extend backend — add bio field to User model; expose via existing PATCH /api/v1/dashboard/profile/ and include in GET /api/v1/dashboard/profile/user-profile/{muid}/`
- [ ] "Currently building" — a freeform field for active projects or what they're working on. Strong engagement and virality signal. `🔧 Extend backend — add currently_building field alongside bio above`
- [ ] Open to — a structured toggle: `Internship` / `Collaboration` / `Mentorship` / `Open Source`. Makes the profile actionable. `🔧 Extend backend — interested_in_work and interested_in_gig_work exist on User model; add open_to as a JSON list field; expose in PATCH /api/v1/dashboard/profile/ and in the user-profile/{muid}/ response`
- [ ] Expected graduation year — critical for companies filtering talent. `🔧 Extend backend — add graduation_year integer to User model; expose via existing profile endpoints`

**Portfolio & Work**
- [ ] Featured Projects — title, short description, tech stack tags, GitHub/live link, optional cover image. Limit 4. `🔌 Not wired — /api/v1/dashboard/projects/ exists in backend with full CRUD; needs (a) featured boolean flag added to Project model, (b) user-scoped GET query param (?user_muid={muid}), and (c) wiring to the profile page. No new endpoint needed.`
- [ ] Certifications — external certs (AWS, Google, Coursera etc.) with link + issuer. Not the same as platform achievements. `🆕 New endpoint — new UserCertification model + GET/POST /api/v1/dashboard/profile/certifications/ and PATCH/DELETE /api/v1/dashboard/profile/certifications/{id}/`
- [ ] Resume link — upload or external URL. One-tap download for companies. `🔧 Extend backend — add resume_link field to User model; expose via existing profile endpoints`

**Sub-role Prominence (Campus Lead / IG Lead)**
- [ ] Role tenure display — "Campus Lead since Jan 2024" not just a badge. `🔧 Extend backend — UserRoleLink.created_at exists; include role_tenure dict in GET /api/v1/dashboard/profile/user-profile/{muid}/ response (keyed by role name, value is date). No new endpoint.`
- [ ] Campus/IG link — clicking the badge navigates to their campus/IG page. `🔧 Extend backend — include campus_id and ig_id in the role_tenure payload above so the frontend can construct navigation links`
- [ ] Sub-role-specific stats inline — Campus Lead: member count managed; IG Lead: IG karma contributed. `🔧 Extend backend — add campus_lead_stats and ig_lead_stats sub-objects to GET /api/v1/dashboard/profile/user-profile/{muid}/ when the user holds those roles. These are computed from existing campus/IG tables; no new models needed.`

**Social Proof**
- [ ] Mentor testimonials — short quotes from mentors with their name + credibility signal. `🆕 New endpoint — depends on mentorship session tracking; defer to P2 once mentor session model exists`
- [ ] Consistency strip — visual activity heatmap (like GitHub contributions). `🔌 Not wired — GET /api/v1/dashboard/profile/user-log/{muid}/ returns dated karma entries; frontend can aggregate into a heatmap. No backend change needed. Wire data and build UI component.`
- [ ] Top 3 landmark achievements — pinned, not buried in a list. `🔧 Extend backend — add pinned boolean to achievement link table (UserAchievement); expose pinned achievements at top of GET /api/v1/dashboard/achievement/list/user/{muid}/`

**Discovery & Networking**
- [ ] Follow / Connect button — for peers and mentors. `🆕 New endpoint — new UserFollow model + POST/DELETE /api/v1/dashboard/profile/follow/{muid}/ and GET /api/v1/dashboard/profile/followers/ (P2)`
- [ ] "People similar to you" — same IG + similar level, surfaces as growth prompt. `🆕 New endpoint — GET /api/v1/dashboard/profile/similar-profiles/ (P3, can be a lightweight query on existing data)`

---

## Role 2 — Mentor

The mentor profile serves two audiences simultaneously: **students evaluating whether to request mentorship** and **the platform showcasing its mentor quality**. Currently nothing mentor-specific exists on the profile.

The `UserMentor` model in the backend has: `about`, `reason`, `hours` — insufficient. All mentor profile fields should be consolidated into a single mentor profile endpoint to avoid N-call patterns.

**API design principle for mentor:** Extend `GET /api/v1/dashboard/profile/user-profile/{muid}/` to include a `mentor_profile` sub-object when the user is a Mentor. For writing, provide `GET / PATCH /api/v1/dashboard/mentor/profile/` as a dedicated edit endpoint. This keeps the public profile a single-call read while keeping edit concerns separate.

### What's needed

**Professional Identity**
- [ ] Professional headline — "Senior SWE @ Google | 8 YOE". Shown directly under name. `🔧 Extend backend — add headline to UserMentor model; expose via mentor_profile in user-profile response and PATCH /api/v1/dashboard/mentor/profile/`
- [ ] Current company + role — structured fields. `🔧 Extend backend — add current_company, current_role to UserMentor`
- [ ] Industry / domain — dropdown. `🔧 Extend backend — add industry field to UserMentor`
- [ ] Years of experience — simple number. `🔧 Extend backend — add years_of_experience to UserMentor`
- [ ] LinkedIn as primary social (not optional). `✅ Connected — Socials model has linkedin; enforce required in frontend for mentor role`

**Mentoring Offer**
- [ ] Expertise tags — structured, searchable. Max 8. `🔧 Extend backend — add expertise_tags as JSON list to UserMentor; link to existing Skill model for tag vocabulary`
- [ ] Mentoring format — `1:1 Sessions` / `Project-based` / `Async Q&A` / `Group Workshops`. `🔧 Extend backend — add mentoring_format as JSON list to UserMentor`
- [ ] Session availability — slots per week. `🔧 Extend backend — add availability_slots integer to UserMentor (the hours field may partially cover this; unify)`
- [ ] Open to new mentees — `Open` / `Waitlist` / `Closed`. Primary CTA for students. `🔧 Extend backend — add open_to_mentees choice field to UserMentor`
- [ ] Session booking link — Calendly / Google Meet / custom. `🔧 Extend backend — add booking_link to UserMentor`
- [ ] Mentoring languages. `🔧 Extend backend — add mentoring_languages as JSON list to UserMentor`

All six fields above + the four professional identity fields = **10 new columns on UserMentor**. They all flow through the same `GET / PATCH /api/v1/dashboard/mentor/profile/` endpoint and the same `mentor_profile` sub-object in `user-profile/{muid}/`. No additional endpoints required.

**Track Record (Platform-verified)**
- [ ] Total mentees mentored. `🆕 New endpoint — requires MentorSession model to exist; GET /api/v1/dashboard/mentor/stats/ returns computed aggregates`
- [ ] Avg mentee karma growth — unique differentiating metric. `🆕 New endpoint — same /api/v1/dashboard/mentor/stats/ endpoint; computed from existing karma logs of past mentees`
- [ ] Completion rate + avg rating. `🆕 New endpoint — same /api/v1/dashboard/mentor/stats/ endpoint`
- [ ] Mentee testimonials — 2–3 quotes from past mentees. `🆕 New endpoint — new MenteeTestimonial model (opt-in); GET /api/v1/dashboard/mentor/testimonials/{muid}/ (P1)`
- [ ] Featured success stories — one longer case study. `🔧 Extend backend — add story_text field to MenteeTestimonial (P2)`

**Badges**
- [ ] `Verified Professional` — email-domain or LinkedIn verified. `🔧 Extend backend — add verified_professional boolean to UserMentor; set by admin or automated check`
- [ ] `Top Mentor` — algorithmic badge. `🔧 Extend backend — add top_mentor boolean to UserMentor; computed from stats (P1)`
- [ ] `X months active` — longevity badge. `🔌 Not wired — UserRoleLink.created_at has the data; compute tenure in mentor_profile response`

**Thought Leadership**
- [ ] Articles / talks links — title + URL list. `🆕 New endpoint — new UserLink model (type: article/talk); GET/POST /api/v1/dashboard/profile/links/ and DELETE /api/v1/dashboard/profile/links/{id}/. Reusable across roles.`
- [ ] Resources shared count. `🔧 Extend backend — aggregate from existing resource-sharing tables if they exist; include in mentor stats`

**Student-facing CTA**
- [ ] `Request Mentorship` button — primary CTA shown to students only. `🔧 Extend backend — the open_to_mentees field gates this; POST /api/v1/dashboard/mentor/request/ is needed (new endpoint, P0 for mentor feature launch)`
- [ ] Estimated response time — "Usually responds within 2 days". `🔧 Extend backend — add avg_response_hours (computed from session history) to mentor stats endpoint`

---

## Role 3 — Company

The company profile is a **talent brand page**, not a personal profile. The Company model in the backend has: `name, logo, description, industry_sector, website_link, email, slug, location, legal_name, registration_number, tax_id, company_size, linkedin_url, status`. A solid foundation — but significant fields are missing and the profile page is disconnected from the public-facing view.

### What's needed

**Brand Identity**
- [ ] Company logo. `✅ Connected — logo field exists on Company model and is exposed in company profile API`
- [ ] Company tagline / mission. `🔧 Extend backend — description field exists; add tagline as a separate short text field (< 150 chars) to distinguish from the longer about text`
- [ ] Industry. `✅ Connected — industry_sector field exists on Company model`
- [ ] Company size. `✅ Connected — company_size field exists`
- [ ] Founded year. `🔧 Extend backend — add founded_year integer to Company model; expose via existing PATCH /api/v1/dashboard/company/profile/`
- [ ] Headquarters location + remote policy. `🔧 Extend backend — location field exists; add remote_policy choice field (remote/hybrid/in-office) to Company model`
- [ ] Website, LinkedIn, Twitter/X. `✅ Connected — website_link and linkedin_url exist; add twitter_url to Company model`

**Talent Pitch**
- [ ] Culture section — "What it's like to work here." `🔧 Extend backend — add culture_text (300 char) to Company model; expose via existing company profile endpoint`
- [ ] Tech stack / tools tags. `🔧 Extend backend — add tech_stack as JSON list to Company model`
- [ ] Perks highlights — tag-style. `🔧 Extend backend — add perks as JSON list to Company model`
- [ ] Life at [Company] gallery — max 4 images. `🆕 New endpoint — new CompanyGallery model (image_url, caption, order); GET/POST /api/v1/dashboard/company/gallery/ and DELETE /api/v1/dashboard/company/gallery/{id}/. A separate endpoint is warranted because this is a collection (not a single field).`

All non-gallery fields above (founded_year, remote_policy, culture_text, tech_stack, perks, twitter_url) are single-column additions to the Company model. They all route through the **same** `GET / PATCH /api/v1/dashboard/company/profile/` endpoint. No new endpoints.

**Opportunities**
- [ ] Active job listings on public profile — card grid. `🔌 Not wired — /api/v1/dashboard/company/jobs/ exists and is used on the company's own dashboard but NOT on the public company profile. Extend GET /api/v1/dashboard/company/profile/public/{slug}/ to include active_jobs array (limit 10). No new endpoint.`
- [ ] Internship listings — separate, prominent. `🔌 Not wired — job type filter already exists in job model; include in public profile response with type filter`
- [ ] Hackathon / project openings. `🔧 Extend backend — add job_type choices to include "hackathon" and "open_source_project" in the Job model`
- [ ] "No openings" graceful empty state. `Frontend only — handle empty active_jobs array in UI`

**Platform Credibility**
- [ ] `Verified` badge. `✅ Connected — status field exists on Company model (active = verified); banner shown in company home. Surface on public profile page.`
- [ ] Member since date. `✅ Connected — created_at on Company model; expose in public profile response`
- [ ] Total hires from muLearn. `🆕 New endpoint — requires a CompanyHire tracking model (or a tag on UserRoleLink); GET /api/v1/dashboard/company/profile/public/{slug}/ can include hire_count once the model exists (P1)`
- [ ] "X muLearn alumni work here". `🆕 New endpoint — same CompanyHire model; include alumni_muids count in public profile response`
- [ ] Average karma of hires. `🆕 New endpoint — same model; computed field in public profile response`

**Social Proof**
- [ ] Employee / alumni testimonials. `🆕 New endpoint — new CompanyTestimonial model (opt-in by muLearn member); GET /api/v1/dashboard/company/testimonials/{slug}/ (P1)`
- [ ] Campus connect events. `🔌 Not wired — campus events exist at /api/v1/dashboard/campus/events/; surface events where company = sponsor/host. May need company_id FK on event model.`

**Discovery**
- [ ] Follow company — students follow for job alert notifications. `🆕 New endpoint — extend the UserFollow model (already planned for student follow) to support company following; POST/DELETE /api/v1/dashboard/company/follow/{slug}/ (P2)`
- [ ] "X students from [your college] work here" — personalized social proof. `🆕 New endpoint — same CompanyHire model; filter by requesting user's college_id (P2)`
- [ ] Similar companies discovery widget. `🆕 New endpoint — GET /api/v1/dashboard/company/similar/{slug}/ (P3, low priority)`

---

## Role 4 — Enabler (Lead Enabler)

Enablers are community builders. Their profile is viewed by campus leads and students. It should reflect community reach, not karma scores. **No UserEnabler model exists in the backend.** All enabler context is currently inferable only from the campus endpoints, which are management-oriented, not profile-oriented.

**API design principle for enabler:** Mirror the mentor pattern — extend `GET /api/v1/dashboard/profile/user-profile/{muid}/` to include an `enabler_stats` sub-object when the user is an Enabler. Add `GET / PATCH /api/v1/dashboard/enabler/profile/` for editing enabler-specific fields. Enabler impact stats are computed from existing campus/IG tables — no new tracking models needed for most.

### What's needed

**Identity**
- [ ] Enabler bio — community-focused, not academic background. `🔧 Extend backend — bio field (planned under Student) covers this if added to User model. No separate enabler bio.`
- [ ] Active zone / region. `🆕 New endpoint — add zone / region field to a new UserEnablerProfile model; expose in enabler_stats in user-profile response and via PATCH /api/v1/dashboard/enabler/profile/`
- [ ] Enabler since — tenure. `🔌 Not wired — UserRoleLink.created_at has this; include in role_tenure dict (already planned under Student sub-role tenure). No new code.`
- [ ] Enabler tier / level — Junior / Senior / Master. `🔧 Extend backend — add enabler_tier choice field to UserEnablerProfile`

**Impact Dashboard** (core of the enabler profile)
- [ ] Campuses activated — count. `🔧 Extend backend — computable from campus data linked to this enabler; include in enabler_stats sub-object in user-profile/{muid}/`
- [ ] Total students onboarded through their efforts. `🔧 Extend backend — computable from campus membership tables for campuses this enabler manages; include in enabler_stats`
- [ ] Learning Circles helped create. `🔧 Extend backend — computable from LC tables; include in enabler_stats`
- [ ] Events co-organized. `🔧 Extend backend — computable from events table if enabler FK exists; include in enabler_stats`
- [ ] Karma generated in their zone. `🔧 Extend backend — aggregate karma from users in their zone; include in enabler_stats`

All five impact stats are computed aggregations from existing data. They should all be returned in a single `enabler_stats` sub-object inside the existing `user-profile/{muid}/` response. No separate analytics endpoint needed.

**Domain & Skills**
- [ ] Enablement focus areas. `🔧 Extend backend — add focus_areas JSON list to UserEnablerProfile`
- [ ] Languages spoken. `🔧 Extend backend — add languages JSON list to UserEnablerProfile`

**Recognition**
- [ ] Enabler badges — platform-issued on milestones. `🔧 Extend backend — use existing Achievement system with an "Enabler" tag; no new model`
- [ ] Leaderboard rank among enablers. `🆕 New endpoint — GET /api/v1/leaderboard/enablers/ (P2; compute from enabler_stats.students_onboarded + campuses_activated)`
- [ ] Campus shoutouts — testimonials from campus leads. `🆕 New endpoint — new CampusShoutout model; GET /api/v1/dashboard/enabler/shoutouts/{muid}/ (P2)`

**Collaboration**
- [ ] Campuses in portfolio — list of campuses with links. `🔌 Not wired — campus data exists; include campuses array (id, name, org_id) in enabler_stats sub-object`
- [ ] "Connect with Enabler" CTA. `🔧 Extend backend — gated by an open_to_connect boolean in UserEnablerProfile; POST request goes to a general connection-request endpoint (reuse mentor request pattern)`

---

## Cross-Cutting Requirements

### Public vs Private

| Section | Student | Mentor | Company | Enabler |
|---|---|---|---|---|
| Bio, projects, skills | Public | Public | Always public | Public |
| Email / mobile | Private (toggle) | Private | Public contact form | Private |
| Karma / rank | Public | Optional | N/A | N/A |
| Achievements | Public | Optional | N/A | N/A |
| Open to / availability | Public | Public | N/A | Public |

**API note:** The `is_public` flag (via `share-user-profile`) already controls public visibility at the profile level. Per-section privacy (e.g., hiding karma) is not implemented and would require a `UserPrivacySettings` model. Defer to P2.

### Discoverability
- All profiles should be indexable by search engines when set to public (Open Graph tags: name, bio, role, skills). `Frontend only — add meta tags to public profile page`
- QR code sharing (already exists) — extend to all roles. `✅ Connected — /api/v1/dashboard/profile/qrcode-get/{uuid}/ works for any user`
- Short URL: `mulearn.org/u/[muid]` — already exists, ensure all roles resolve correctly. `Frontend routing — verify [muid] route handles mentor/company/enabler profile sub-objects`

### Mobile-First Gaps
- Project cards need horizontal scroll on mobile, not truncation. `Frontend only`
- Mentor booking CTA must be sticky on mobile (fixed bottom bar). `Frontend only`
- Company job listings need a swipeable card pattern on mobile. `Frontend only`

### Profile Completeness Score
- A completeness indicator with specific prompts per missing section. `🔧 Extend backend — add GET /api/v1/dashboard/profile/completeness/ that returns a score (0–100) and list of missing fields per role. Computed server-side so the formula can evolve without frontend deploys.`
- Completeness thresholds unlock features (e.g., >80% unlocks company visibility). `🔧 Extend backend — use completeness score in permission checks on relevant endpoints`

### Profile Analytics
- Profile view count. `🆕 New endpoint — new ProfileView log model; GET /api/v1/dashboard/profile/analytics/ returns view_count, company_views_this_week, search_appearances (P2)`
- "X companies viewed your profile this week". `🆕 New endpoint — same ProfileView model; filter by viewer role = Company`
- "Your profile appeared in X searches". `🆕 New endpoint — new SearchLog model or counter; increment on search results served`

---

## Priority Matrix

| Feature | Role | Impact | Effort | Priority |
|---|---|---|---|---|
| Bio / tagline field | Student | High | Low | **P0** |
| "Open to" toggle | Student | High | Low | **P0** |
| Featured projects (connect + featured flag) | Student | High | Low-Med | **P0** |
| Mentor professional headline + expertise tags | Mentor | High | Low | **P0** |
| "Open to mentees" toggle + Request CTA | Mentor | High | Low | **P0** |
| Company logo + brand identity fields | Company | High | Low | **P0** |
| Company job listings on public profile | Company | High | Low | **P0** |
| Verified badge on public profile | Company | High | Low | **P0** |
| Role tenure display (Campus/IG Lead) | Student | Medium | Low | **P1** |
| Sub-role stats inline | Student | Medium | Low | **P1** |
| Consistency heatmap (wire user-log data) | Student | Medium | Low | **P1** |
| Certifications (new model + endpoint) | Student | Medium | Med | **P1** |
| Resume link | Student | High | Low | **P1** |
| Mentor track record stats endpoint | Mentor | High | Medium | **P1** |
| Mentee testimonials model | Mentor | High | Medium | **P1** |
| Enabler stats sub-object in profile response | Enabler | High | Medium | **P1** |
| UserEnablerProfile model + fields | Enabler | High | Medium | **P1** |
| Company alumni / hires tracking | Company | High | Medium | **P1** |
| Company culture + perks + tech stack fields | Company | Medium | Low | **P1** |
| Profile completeness score endpoint | All | High | Medium | **P2** |
| Profile view analytics | All | Medium | Medium | **P2** |
| Follow / connect system | All | High | High | **P2** |
| Articles / talks links (UserLink model) | Mentor | Medium | Low | **P2** |
| Company gallery (CompanyGallery model) | Company | Medium | Low | **P2** |
| Enabler leaderboard | Enabler | Medium | Medium | **P2** |
| "Similar profiles" discovery | Student | Medium | High | **P3** |
| Similar companies widget | Company | Low | Medium | **P3** |

---

## API Action Plan

A consolidated, systems-engineering view of what needs to happen in the backend and dashboard. Grouped to avoid endpoint proliferation and to batch related changes.

---

### Tier 1 — Connect Only (backend is ready, dashboard just needs wiring)

No backend changes needed. Frontend work only.

| What to connect | Dashboard work |
|---|---|
| `GET /api/v1/dashboard/projects/?user_muid={muid}` | Show user's projects on profile page. Add `featured` query/filter. |
| `GET /api/v1/dashboard/profile/badges/{muid}/` | Surface badges separate from achievements if data differs |
| `GET /api/v1/dashboard/company/profile/public/{slug}/` | Students viewing a company's profile page |
| Campus stats on enabler profile | Reuse `useCampusOverview()` data already fetched in enabler home; pass to profile card |
| Activity heatmap on student profile | Aggregate existing `user-log/{muid}/` data by date; render as contribution-style strip |
| Consistency strip | Same data, render as visual heatmap (no backend change) |

---

### Tier 2 — Extend Existing Backend (new fields on existing models/endpoints)

Group by endpoint to minimize PR scope and avoid fragmentation.

#### 2a. Extend `User` model + profile endpoints

Add to `User` model:
- `bio` (TextField, 300 chars, nullable)
- `tagline` (CharField, 100 chars, nullable)
- `currently_building` (TextField, 200 chars, nullable)
- `graduation_year` (IntegerField, nullable)
- `resume_link` (URLField, nullable)

Add to `UserPreferences` / preferences PATCH:
- `open_to` (JSONField — list of: `internship`, `collaboration`, `mentorship`, `open_source`)

Expose all of the above in:
- `PATCH /api/v1/dashboard/profile/` (write)
- `GET /api/v1/dashboard/profile/user-profile/{muid}/` (read, public)

#### 2b. Extend `user-profile/{muid}/` response for role-specific sub-objects

No new endpoints. Add computed sub-objects to the existing serializer, gated by the user's roles:

```
role_tenure: { "Campus Lead": "2024-01-15", "IG Lead": "2024-06-01" }

campus_lead_stats: { campus_id, campus_name, campus_link, member_count }  # if Campus Lead

ig_lead_stats: { ig_id, ig_name, ig_link, ig_karma_contributed }  # if IG Lead

enabler_stats: {           # if Lead Enabler
  zone, campuses_activated, students_onboarded,
  lcs_helped, events_co_organized, karma_in_zone,
  campuses: [{ id, name, org_id }]
}

mentor_profile: {          # if Mentor — read-only summary for public profile
  headline, current_company, current_role, industry,
  years_of_experience, expertise_tags, mentoring_format,
  availability_slots, open_to_mentees, booking_link,
  mentoring_languages, verified_professional, months_active
}
```

All computed from existing tables. Single API call for the full profile. No N+1 endpoint calls on the frontend.

#### 2c. Extend `UserMentor` model + add mentor profile edit endpoint

Add columns to `UserMentor`:
- `headline`, `current_company`, `current_role`, `industry`, `years_of_experience`
- `expertise_tags` (JSONField), `mentoring_format` (JSONField), `availability_slots` (IntegerField)
- `open_to_mentees` (choices: open/waitlist/closed), `booking_link` (URLField)
- `mentoring_languages` (JSONField), `verified_professional` (BooleanField), `top_mentor` (BooleanField)

Add endpoint (new, but wraps existing model):
- `GET / PATCH /api/v1/dashboard/mentor/profile/` — authenticated mentor edit their own mentor-specific fields

#### 2d. Extend `Company` model + company profile endpoint

Add columns to `Company`:
- `founded_year` (IntegerField, nullable)
- `remote_policy` (choices: remote/hybrid/in-office)
- `culture_text` (TextField, 300 chars)
- `tech_stack` (JSONField)
- `perks` (JSONField)
- `twitter_url` (URLField)

All exposed via existing `GET / PATCH /api/v1/dashboard/company/profile/`.

Extend `GET /api/v1/dashboard/company/profile/public/{slug}/` to include:
- `active_jobs` (list, limit 10, type filter: full-time/internship/hackathon)
- `member_since` (created_at formatted)
- Gallery images (once CompanyGallery model exists)

#### 2e. Extend `Project` model for profile use

Add to `Project` model:
- `featured` (BooleanField, default False)

Add filter support to `GET /api/v1/dashboard/projects/`:
- `?user_muid={muid}` — filter by user
- `?featured=true` — featured only

No new endpoint. Frontend wires this to profile.

#### 2f. Add `pinned` flag to achievement list

Add `pinned` BooleanField to `UserAchievement` (the through-table linking User to Achievement).

Expose in `GET /api/v1/dashboard/achievement/list/user/{muid}/` — sort pinned to top.

Add `PATCH /api/v1/dashboard/achievement/pin/{achievement_id}/` to toggle pinned state.

#### 2g. Add profile completeness endpoint

New endpoint (computed, no new model):
- `GET /api/v1/dashboard/profile/completeness/` — returns `{ score: 72, missing: ["bio", "resume_link", "featured_projects"] }`

Computed server-side per role. No new database table needed.

---

### Tier 3 — New Endpoints (new models required)

These require new Django models, migrations, and dedicated endpoints. Grouped by model.

#### 3a. `UserCertification` model

Fields: `user_id`, `name`, `issuer`, `issued_date`, `expiry_date` (nullable), `credential_url`, `created_at`

Endpoints:
- `GET / POST /api/v1/dashboard/profile/certifications/`
- `PATCH / DELETE /api/v1/dashboard/profile/certifications/{id}/`

Public: include certifications in `GET /api/v1/dashboard/profile/user-profile/{muid}/` response.

#### 3b. `UserLink` model (reusable across roles)

Fields: `user_id`, `title`, `url`, `link_type` (choices: article/talk/resource/other), `created_at`

Endpoints:
- `GET / POST /api/v1/dashboard/profile/links/`
- `PATCH / DELETE /api/v1/dashboard/profile/links/{id}/`

Public: include in user-profile response. Useful for Mentor thought leadership and Student portfolio.

#### 3c. `UserEnablerProfile` model

Fields: `user_id` (OneToOne), `zone`, `region`, `enabler_tier` (choices), `focus_areas` (JSONField), `languages` (JSONField), `open_to_connect` (BooleanField)

Endpoints:
- `GET / PATCH /api/v1/dashboard/enabler/profile/`

Impact stats (campuses_activated etc.) are computed, not stored here. They are returned in the `enabler_stats` sub-object of `user-profile/{muid}/` (Tier 2b above).

#### 3d. `CompanyGallery` model

Fields: `company_id`, `image_url`, `caption`, `order` (IntegerField), `created_at`

Endpoints:
- `GET / POST /api/v1/dashboard/company/gallery/`
- `DELETE /api/v1/dashboard/company/gallery/{id}/`

A separate endpoint is warranted here because this is an ordered collection, not a single field.

#### 3e. `MenteeTestimonial` model (P1)

Fields: `mentor_id`, `mentee_id`, `quote`, `mentee_level`, `approved_by_mentee` (BooleanField), `created_at`

Endpoints:
- `GET /api/v1/dashboard/mentor/testimonials/{muid}/` (public)
- `PATCH /api/v1/dashboard/mentor/testimonials/{id}/approve/` (mentee approves their own quote)

#### 3f. `MentorStats` — computed endpoint (P1)

No new model if session data exists. Aggregated from session/karma tables.

- `GET /api/v1/dashboard/mentor/stats/` — returns: `mentees_count`, `avg_karma_growth`, `completion_rate`, `avg_rating`, `avg_response_hours`

#### 3g. Mentor Request endpoint (P0 for mentor feature launch)

- `POST /api/v1/dashboard/mentor/request/` — student sends mentorship request to a mentor

Requires a `MentorRequest` model (mentor_id, student_id, message, status, created_at).

#### 3h. `ProfileAnalytics` (P2)

New `ProfileView` model: `profile_user_id`, `viewer_id`, `viewer_role`, `viewed_at`

- `GET /api/v1/dashboard/profile/analytics/` — returns: `view_count`, `company_views_this_week`, `search_appearances` (owner-only, not public)

#### 3i. Follow system (P2)

Extend a single `UserFollow` model to support both user-user and user-company follows:

Fields: `follower_id`, `following_user_id` (nullable), `following_company_id` (nullable), `created_at`

Endpoints:
- `POST / DELETE /api/v1/dashboard/profile/follow/{muid}/`
- `POST / DELETE /api/v1/dashboard/company/follow/{slug}/`
- `GET /api/v1/dashboard/profile/followers/`

---

## Key Observations

1. **Mentor, Company, and Enabler profiles are essentially student profiles with no role-specific content.** P0 work for those three roles is almost entirely net-new sections, not refinements.

2. **The student profile's biggest gap is voice** — there is no bio, no projects, no "open to" signal. A student with 5000 karma looks identical to one with 500 karma on a quick scan. Projects and bio fix this.

3. **The company profile needs to be a completely separate component**, not an extension of the personal profile pattern. It is a brand page with job listings — a fundamentally different information architecture.

4. **Sub-roles (Campus Lead, IG Lead) are currently invisible on the profile beyond a badge.** Surfacing tenure + linked entity + role-specific stats converts a badge into a meaningful credibility signal.

5. **Profile completeness + view analytics are the highest-leverage growth features** — they cost medium effort and directly drive both retention (filling the profile) and engagement (returning to check views).

6. **The backend already has more than the dashboard is using.** Projects, QR codes, badges, campus stats, and the public company profile endpoint all exist and just need wiring. Before writing new backend code, connect what's available.

7. **Role-specific profile data (mentor, campus lead, enabler) should be nested sub-objects inside the existing `user-profile/{muid}/` response**, not separate API calls. This keeps the profile page to a single primary GET and avoids waterfall fetching. Role-specific *edit* endpoints are a separate concern.

8. **External certifications are genuinely distinct from platform achievements** — they need their own model (UserCertification). Do not stretch the Achievement system to cover external certs; the data shape and lifecycle are different.
