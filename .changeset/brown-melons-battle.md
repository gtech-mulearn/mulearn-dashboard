# Company Branch — UI Features & Operations
**Project:** μLearn Dashboard (`mulearn-dashboard`)
**Role:** Frontend Developer (Intern)

---

## 1. Manage Companies — Admin Verification Page

**Who uses it:** Admin users

### What the page shows
A data table listing all companies that have registered on the platform, with columns for company name, point of contact (POC), industry, location, verification status badge, and date the request was submitted.

### Filters & Controls

| Control | What it does |
|---|---|
| **Search box** | Filters the table in real time by company name, email, or location |
| **Per-page selector** (10 / 20 / 50 / 100) | Changes how many rows are shown per page |
| **Filter dropdown** (All / Pending / Active / Rejected / Inactive) | Filters the table to show only companies matching that status |
| **Column header click** (Name, Requested) | Toggles ascending / descending sort on that column. Clicking again reverses the order |
| **Previous / Next pagination** | Navigates between pages of results |

### Row-level Action Buttons
Each row in the table has up to 3 buttons (only **Verify** and **Reject** appear for pending companies):

| Button | What it does |
|---|---|
| **👁 View** | Opens the Company Detail Side Sheet (slide-over panel) with full company information |
| **✓ Verify** (green, pending only) | Opens the Approve/Reject Confirmation Dialog pre-set to "approve" |
| **✗ Reject** (red, pending only) | Opens the Approve/Reject Confirmation Dialog pre-set to "reject" |

---

### Company Detail Side Sheet
Opens when **View** is clicked. Shows full company information organized in sections:
- **About** — company description and short pitch
- **Point of Contact** — name, clickable email (mailto), phone number
- **Company Details** — industry & size, location, legal name, registration number, tax ID, website link (opens in new tab), LinkedIn link, founded year, remote work policy
- **Culture & Tech** — culture statement, tech stack (tag badges), perks (tag badges)
- **Verification Timeline** — registered on date, when verification was requested, verified at, verified by, rejection reason (shown in red if rejected), last updated date

**Buttons inside the sheet (only shown for pending companies):**

| Button | What it does |
|---|---|
| **Reject** (red outline) | Closes the sheet and opens the Approve/Reject Dialog set to "reject" |
| **Approve** (green) | Closes the sheet and opens the Approve/Reject Dialog set to "approve" |

---

### Approve / Reject Confirmation Dialog
A modal that opens after clicking Verify or Reject from either the table row or the detail sheet.

**When approving:**
- Shows a green checkmark icon
- Has an optional "Note" text area
- **Approve** button → sends status `"verified"` to the backend → company gets platform access → table refreshes

**When rejecting:**
- Shows a red X icon
- Has a **required** "Rejection reason" text area (cannot submit empty)
- **Reject** button → sends status `"rejected"` + the typed reason to the backend → table refreshes

Both dialogs have a **Cancel** button that closes without doing anything. Buttons are disabled and show "Approving…" / "Rejecting…" while the request is in flight.

---

## 2. Company Jobs Page

**Who uses it:** Company users (verified companies)

### What the page shows
A grid of job posting cards. Each card shows the job title, type (Full-Time, Internship, etc.), location, salary range, and current status badge (Active / Inactive / Draft).

### Page-level Buttons

| Button | What it does |
|---|---|
| **+ Post New Job** | Opens the multi-step Job Creation Stepper |

### Per-card Buttons

| Button | What it does |
|---|---|
| **View Details** | Navigates to the full Job Detail View for that job |

---

### Job Creation / Edit Stepper (4 Steps)

A step-by-step modal/page for creating or editing a job. Each step must be valid before proceeding to the next.

**Step 1 — Basic Info**
- Fields: Job Title, Job Type (dropdown), Location, Salary Range
- **Next →** validates these 4 fields before advancing

**Step 2 — Requirements**
- Fields: Experience required, Job Description (Markdown editor)
- **← Back** goes back to step 1
- **Next →** validates these fields before advancing

**Step 3 — Eligibility Rules**
- Lists existing rules (e.g., "Karma ≥ 500", "Must be in Web Development IG")
- **+ Add Rule** button → opens a small dialog to add a rule (rule type dropdown + value input) → **Save** adds it to the job
- Each rule row has a **🗑 Delete** icon → removes that rule immediately
- **← Back** / **Next →** navigate without validation (rules step is optional)

**Step 4 — Review**
- Shows a full read-only summary of everything entered
- **← Back** → go back and edit
- **Submit Job** → creates the job (or saves edits if editing) → shows success toast → closes stepper → job list refreshes

---

### Job Detail View
Full page for a single job. Shows all job info: title, status, job type, experience, location, salary, duration, hourly rate, stipend, certificate info, full description (rendered Markdown), deliverables, eligibility rules, and timestamps.

**Buttons at top:**

| Button | What it does |
|---|---|
| **← Back to Jobs** | Returns to the jobs list |
| **Edit** | Re-opens the Job Stepper pre-filled with this job's data for editing |
| **Delete** | Opens a confirmation dialog — **Confirm Delete** soft-deletes the job; **Cancel** closes |

**Eligibility Rules section:**

| Button | What it does |
|---|---|
| **+ Add Rule** | Opens the Add Rule dialog |
| **🗑 (per rule)** | Deletes that specific rule after confirmation |

**Applicants section** (see below) is embedded at the bottom of this page.

---

### Applicants Section (inside Job Detail)

Shows all applicants for the selected job.

| Control | What it does |
|---|---|
| **Search box** | Filters applicants by name or email (server-side) |
| **Sort dropdown** | Sorts by Karma High→Low or Low→High |
| **Status filter tabs** (All / Pending / In-Review / Shortlisted / Interview / Selected / Rejected) | Filters the list; each tab shows a count badge |
| **Previous / Next pagination** | Navigates between pages of applicants |

**Per-applicant row:**
- Shows: initials avatar, name, email, applied date, **View Resume** link (opens in new tab)
- Status badge showing current stage
- **Move to →** dropdown: shows only valid next status transitions (e.g., Pending can move to In-Review or Rejected; Shortlisted can move to Interview or Rejected)
  - Clicking any option immediately updates the status
  - If **Rejected** is chosen → opens a **Reject Applicant** dialog where an optional reason can be typed → **Reject** button confirms

---

## 3. Company Tasks Page

**Who uses it:** Company users

### What the page shows
A card grid of tasks the company has submitted for the community. Each card shows: task title, hashtag, approval status badge (Pending / Approved / Rejected), description, karma points, task type, active badge.

### Page-level Buttons

| Button | What it does |
|---|---|
| **+ Create Task** | Opens the Create Task Modal |

### Filter Tabs (All Tasks / Approved / Pending / Rejected)
Clicking a tab re-fetches from the server with that approval status filter. Shows only matching tasks.

### Per-card Dropdown Menu (⋮ icon)

| Option | Condition | What it does |
|---|---|---|
| **✏ Edit Task** | Always shown | Opens the Create Task Modal pre-filled with the task's existing data for editing. Note shown: "Updating will revert status back to pending." |
| **🗑 Delete Task** | Only shown for **pending** tasks | Shows a browser `confirm()` dialog → if confirmed, deletes the task and refreshes the list |
| **View Details** button | Always shown | Opens the Task Detail Modal for that task |

---

### Create Task Modal

Opens when **Create Task** or **Edit Task** is clicked.

**Form fields:**
- Task Title (required)
- Hashtag (required) — e.g. `#techcorp-api`
- Karma Points (required, number)
- Task Type (dropdown — populated from backend task types list, required)
- Description (textarea, required)

| Button | What it does |
|---|---|
| **Cancel** | Closes the modal without saving (disabled while submitting) |
| **Submit Task** / **Save Changes** | Submits the form. On success → closes modal, list refreshes, shows toast "Task submitted for approval" or "Task updated and re-submitted for approval" |

---

### Task Detail Modal
A read-only modal showing all details of a specific task: title, hashtag, description, karma, type, status badge, active status, submission date.

---

## 4. Company Mentors Page

**Who uses it:** Company users

### What the page shows
A card grid of mentors the company has nominated. Each card shows: mentor name, email, nomination status (PENDING / APPROVED / REJECTED), reason for nomination, admin note (if any), mentor tier, and verification date.

### Page-level Buttons

| Button | What it does |
|---|---|
| **+ Nominate Mentor** | Opens the Nominate Mentor Modal |

---

### Nominate Mentor Modal

**Form fields:**
- **User MUID** (required) — The unique μLearn ID of the person being nominated (not email)
- **Reason for Nomination** (required, minimum 10 characters) — why they are a good fit

| Button | What it does |
|---|---|
| **Cancel** | Closes the modal |
| **Submit Nomination** | Submits the nomination. On success → closes modal, nominations list refreshes, shows toast "Mentor nominated successfully. Pending admin approval." |

---

## 5. Learner Side — Jobs Discovery & Applications

**Who uses it:** Learner users

### Public Jobs Page
Browsable catalogue of all active jobs across all verified companies.
- Search by job title, filter by type
- Each **job card** has an **Apply** button → opens the Apply Job Dialog

### Apply Job Dialog

| Field | Description |
|---|---|
| Resume Link (required) | URL to the applicant's resume |
| Cover Letter (optional) | Free-text cover letter |

| Button | What it does |
|---|---|
| **Cancel** | Closes without applying |
| **Apply** | Submits the application → shows success toast → dialog closes |

### My Applications Page
Lists all jobs the learner has applied to. Each row shows the job title, company, applied date, and current status badge.

**Per-application actions:**

| Button | Condition | What it does |
|---|---|---|
| **Withdraw** | Application is Pending | Removes the application after confirmation |
| **Resubmit** | Application was Rejected | Opens a small form to update resume/cover letter and re-submit |

---

## Summary of All Screens Built

| Screen | Module | Users |
|---|---|---|
| Manage Companies Table | `manage-companies` | Admin |
| Company Detail Side Sheet | `manage-companies` | Admin |
| Approve / Reject Dialog | `manage-companies` | Admin |
| Jobs List Page | `company-jobs` | Company |
| Job Creation Stepper (4 steps) | `company-jobs` | Company |
| Job Detail View | `company-jobs` | Company |
| Applicants Section + Status Transitions | `company-jobs` | Company |
| Reject Applicant Dialog | `company-jobs` | Company |
| Company Tasks Page (with tab filters) | `company-tasks` | Company |
| Create / Edit Task Modal | `company-tasks` | Company |
| Task Detail Modal | `company-tasks` | Company |
| Company Mentors Page | `company-mentors` | Company |
| Nominate Mentor Modal | `company-mentors` | Company |
| Public Jobs Discovery | `company-jobs` | Learner |
| Apply to Job Dialog | `company-jobs` | Learner |
| My Applications Page | `company-jobs` | Learner |

---

*Generated: 2026-06-10*
