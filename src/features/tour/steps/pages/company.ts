/**
 * Company page tours
 *
 * 📍 src/features/tour/steps/pages/company.ts
 *
 * In-page tours for `/dashboard/company/*` pages (jobs, analytics,
 * IG requests, mentors, tasks, profile). Dynamic-segment routes
 * (`/dashboard/company/jobs/[jobId]`, `.../jobs/[jobId]/edit`) are out of
 * scope for this registry — it keys tours by exact pathname.
 */

import type { PageTourConfig } from "../../types";

export const companyPageTours: readonly PageTourConfig[] = [
  {
    route: "/dashboard/company",
    version: 1,
    steps: [
      {
        id: "company-home-welcome",
        title: "Your Company Dashboard",
        description:
          "Everything you need to hire, task, and mentor the μLearn community lives here. Let's take a quick look around.",
        centered: true,
      },
      {
        id: "company-home-jobs-card",
        elementId: "page:company-home:jobs-card",
        title: "Manage Jobs",
        description:
          "Post new job opportunities, review applications, and move candidates through your hiring funnel.",
      },
      {
        id: "company-home-tasks-card",
        elementId: "page:company-home:tasks-card",
        title: "Manage Tasks",
        description:
          "Create and monitor tasks submitted by your company, and track their admin approval status.",
      },
      {
        id: "company-home-mentors-card",
        elementId: "page:company-home:mentors-card",
        title: "Manage Mentors",
        description:
          "Nominate new company mentors to support your community tasks and initiatives.",
      },
      {
        id: "company-home-analytics-card",
        elementId: "page:company-home:analytics-card",
        title: "Analytics & Performance",
        description:
          "Track job view rates, gig funnel stages, conversion indexes, and ecosystem talent distribution.",
      },
    ],
  },

  {
    route: "/dashboard/company/jobs",
    version: 1,
    steps: [
      {
        id: "company-jobs-search",
        elementId: "page:company-jobs:search",
        title: "Find a Listing",
        description: "Search your posted jobs by title, keyword, or location.",
      },
      {
        id: "company-jobs-create",
        elementId: "page:company-jobs:create",
        title: "Post a Job",
        description:
          "Create a new job or gig listing for the community to apply to.",
      },
      {
        id: "company-jobs-list",
        elementId: "page:company-jobs:list",
        title: "Your Job Listings",
        description:
          "Open any listing to review applicants and move them through your hiring pipeline.",
      },
    ],
  },

  {
    route: "/dashboard/company/jobs/create",
    version: 1,
    steps: [
      {
        id: "company-jobs-create-header",
        elementId: "page:company-jobs-create:header",
        title: "Create a New Job",
        description: "Post a new job listing in four easy steps.",
      },
      {
        id: "company-jobs-create-stepper-header",
        elementId: "page:company-jobs-create:stepper-header",
        title: "Track Your Progress",
        description:
          "Jump between steps at any time — basic info, requirements, rules, and a final review.",
      },
      {
        id: "company-jobs-create-step-form",
        elementId: "page:company-jobs-create:step-form",
        title: "Fill in the Details",
        description:
          "Each step collects a piece of the job posting — title, description, requirements, and eligibility rules.",
      },
      {
        id: "company-jobs-create-next",
        elementId: "page:company-jobs-create:next",
        title: "Move Forward",
        description:
          "Continue to the next step once you're happy with this section. Your final step lets you review and submit.",
      },
    ],
  },

  {
    route: "/dashboard/company/analytics",
    version: 1,
    steps: [
      {
        id: "company-analytics-header",
        elementId: "page:company-analytics:header",
        title: "Analytics & Insights",
        description:
          "Monitor your job listing engagement, gig performance, and community talent pool statistics.",
      },
      {
        id: "company-analytics-tabs",
        elementId: "page:company-analytics:tabs",
        title: "Switch Views",
        description:
          "Move between the dashboard summary, gig performance, job engagement, and talent pool insights.",
      },
      {
        id: "company-analytics-period-filter",
        elementId: "page:company-analytics:period-filter",
        title: "Adjust the Period",
        description:
          "Change the comparison window to see how your metrics have shifted over time.",
      },
      {
        id: "company-analytics-summary-cards",
        elementId: "page:company-analytics:summary-cards",
        title: "Quick Stats",
        description:
          "A snapshot of your hiring and engagement numbers, compared against the previous period.",
      },
    ],
  },

  {
    route: "/dashboard/company/ig-requests",
    version: 1,
    steps: [
      {
        id: "company-ig-requests-new-request",
        elementId: "page:company-ig-requests:new-request",
        title: "Propose an Interest Group",
        description:
          "Request a new Interest Group collaboration to bring your organization closer to the community.",
      },
      {
        id: "company-ig-requests-status-tabs",
        elementId: "page:company-ig-requests:status-tabs",
        title: "Filter by Status",
        description:
          "Narrow the list down to requested, active, rejected, or cancelled requests.",
      },
      {
        id: "company-ig-requests-search",
        elementId: "page:company-ig-requests:search",
        title: "Search Requests",
        description: "Look up a specific request by name or code.",
      },
      {
        id: "company-ig-requests-table",
        elementId: "page:company-ig-requests:table",
        title: "Track Your Requests",
        description:
          "Review the status of every Interest Group request your company has sent, and cancel pending ones if needed.",
      },
    ],
  },

  {
    route: "/dashboard/company/mentors",
    version: 1,
    steps: [
      {
        id: "company-mentors-header",
        elementId: "page:company-mentors:header",
        title: "Mentor Management",
        description:
          "Nominate mentors from your organization and manage the scopes they hold.",
      },
      {
        id: "company-mentors-nominate",
        elementId: "page:company-mentors:nominate",
        title: "Nominate a Mentor",
        description:
          "Suggest a user from your organization to mentor community learners.",
      },
      {
        id: "company-mentors-list",
        elementId: "page:company-mentors:list",
        title: "Your Nominations",
        description:
          "Approve or reject pending nominations, and view the scopes granted to verified mentors.",
      },
    ],
  },

  {
    route: "/dashboard/company/profile/edit",
    version: 1,
    steps: [
      {
        id: "company-profile-edit-header",
        elementId: "page:company-profile-edit:header",
        title: "Edit Company Profile",
        description: "Update your company information across four sections.",
      },
      {
        id: "company-profile-edit-stepper-header",
        elementId: "page:company-profile-edit:stepper-header",
        title: "Track Your Progress",
        description:
          "Jump between sections at any time — basic info, contact, legal, culture, and a final review.",
      },
      {
        id: "company-profile-edit-step-form",
        elementId: "page:company-profile-edit:step-form",
        title: "Fill in the Details",
        description:
          "Each section collects a piece of your company's public profile.",
      },
      {
        id: "company-profile-edit-next",
        elementId: "page:company-profile-edit:next",
        title: "Move Forward",
        description:
          "Continue to the next section once you're happy with this one. The last step lets you review and save.",
      },
    ],
  },

  {
    route: "/dashboard/company/tasks",
    version: 1,
    steps: [
      {
        id: "company-tasks-header",
        elementId: "page:company-tasks:header",
        title: "Task Management",
        description: "Manage your community tasks and track admin approval.",
      },
      {
        id: "company-tasks-create",
        elementId: "page:company-tasks:create",
        title: "Create a Task",
        description:
          "Submit a new task for the community to complete, pending admin review.",
      },
      {
        id: "company-tasks-status-tabs",
        elementId: "page:company-tasks:status-tabs",
        title: "Filter by Status",
        description:
          "Switch between all, approved, pending, and rejected tasks.",
      },
      {
        id: "company-tasks-list",
        elementId: "page:company-tasks:list",
        title: "Your Tasks",
        description:
          "Edit a task's details or view its submissions from the community.",
      },
    ],
  },

  {
    route: "/dashboard/company/admin",
    version: 1,
    steps: [
      {
        id: "company-admins-header",
        elementId: "page:company-admins:header",
        title: "Co-Administrators",
        description:
          "Invite colleagues to help run your company — they can do everything except edit the profile, manage admins, or deactivate the company.",
      },
      {
        id: "company-admins-stats",
        elementId: "page:company-admins:stats",
        title: "Seats at a Glance",
        description:
          "Track accepted co-admins, pending invites, and seats left.",
      },
      {
        id: "company-admins-team",
        elementId: "page:company-admins:team",
        title: "Team & Invitations",
        description:
          "Review every co-admin and invite, newest first — remove, cancel, or leave from here.",
      },
    ],
  },

  {
    route: "/dashboard/company/event-templates",
    version: 1,
    steps: [
      {
        id: "company-templates-header",
        elementId: "page:company-templates:header",
        title: "Event Templates",
        description:
          "Save a standardized agenda and format for workshops, AMAs, or tech talks.",
      },
      {
        id: "company-templates-create",
        elementId: "page:company-templates:create",
        title: "Create a Template",
        description: "Start a new reusable event template.",
      },
      {
        id: "company-templates-list",
        elementId: "page:company-templates:list",
        title: "Your Templates",
        description: "Reuse or delete a saved template.",
      },
    ],
  },

  {
    route: "/dashboard/company/collaborations",
    version: 1,
    steps: [
      {
        id: "company-collaborations-header",
        elementId: "page:company-collaborations:header",
        title: "Collaborations",
        description:
          "Partner with campuses and Interest Groups on events, sponsorships, campus programmes and mentoring.",
      },
      {
        id: "company-collaborations-tabs",
        elementId: "page:company-collaborations:tabs",
        title: "Your Posts or Open Posts",
        description:
          "Switch between the collaborations you've posted and every open post on the platform.",
      },
      {
        id: "company-collaborations-mine",
        elementId: "page:company-collaborations:mine",
        title: "Track Your Posts",
        description:
          "See who's responded to a direct invite, or withdraw an open post.",
      },
    ],
  },

  {
    route: "/dashboard/company/ig-sponsorship",
    version: 1,
    steps: [
      {
        id: "company-sponsorship-header",
        elementId: "page:company-sponsorship:header",
        title: "Interest Group Sponsorships",
        description:
          "Sponsor specialized domain Interest Groups to build talent pipelines and support learners.",
      },
      {
        id: "company-sponsorship-picker",
        elementId: "page:company-sponsorship:picker",
        title: "Choose an Interest Group",
        description:
          "Pick the Interest Group you want to view engagement stats for or sponsor.",
      },
      {
        id: "company-sponsorship-metrics",
        elementId: "page:company-sponsorship:metrics",
        title: "Engagement Metrics",
        description:
          "Member counts, active tasks, completions, and sessions for the selected group.",
      },
    ],
  },

  {
    route: "/dashboard/company/feedback",
    version: 1,
    steps: [
      {
        id: "company-feedback-header",
        elementId: "page:company-feedback:header",
        title: "Impact & Feedback",
        description:
          "Who your company has reached on muLearn, and what learners say about working with you.",
      },
      {
        id: "company-feedback-impact",
        elementId: "page:company-feedback:impact",
        title: "Impact Report",
        description:
          "Reach, quality, and outcome numbers — optionally publish them to your public profile.",
      },
      {
        id: "company-feedback-list",
        elementId: "page:company-feedback:list",
        title: "Learner Feedback",
        description:
          "Ratings and comments left by learners after jobs, tasks, events, or mentorship sessions.",
      },
    ],
  },
];
