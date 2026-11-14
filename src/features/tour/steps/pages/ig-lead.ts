/**
 * IG Lead / talent-pool / manage-events page tours
 *
 * 📍 src/features/tour/steps/pages/ig-lead.ts
 *
 * In-page tours for pages reachable via `events:manage`/IG-Lead-gated nav
 * items: talent pool, manage events, incoming collaborations (shared by
 * campus and IG leads).
 */

import type { PageTourConfig } from "../../types";

export const igLeadPageTours: readonly PageTourConfig[] = [
  {
    route: "/dashboard/talent-pool",
    version: 2,
    steps: [
      {
        id: "talent-pool-welcome",
        title: "Talent Pool",
        description:
          "Browse verified learners to mentor, hire, or bring onto your team. Here's how to find the right ones.",
        centered: true,
      },
      {
        id: "talent-pool-tabs",
        elementId: "page:talent-pool:tabs",
        title: "Discover, Shortlist & Insights",
        description:
          "Switch between discovering learners, your shortlist, and talent pool insights.",
      },
      {
        id: "talent-pool-search",
        elementId: "page:talent-pool:search",
        title: "Search learners",
        description: "Find a specific learner quickly by name or MUID.",
      },
      {
        id: "talent-pool-filters",
        elementId: "page:talent-pool:filters",
        title: "Filter and sort",
        description:
          "Narrow the pool by karma, level, Interest Group, or achievement — and sort results to match what matters to you.",
      },
      {
        id: "talent-pool-count",
        elementId: "page:talent-pool:count",
        title: "Result count",
        description: "See at a glance how many learners match your search.",
      },
      {
        id: "talent-pool-results",
        elementId: "page:talent-pool:results",
        title: "Learner cards",
        description:
          "Each card summarizes a learner's karma, level, and skills — open one to see more.",
      },
    ],
  },
  {
    route: "/dashboard/manage-events",
    version: 1,
    steps: [
      {
        id: "manage-events-welcome",
        title: "Manage Events",
        description:
          "Create and manage events for your community — schedules, registrations, and approvals all live here.",
        centered: true,
      },
      {
        id: "manage-events-create",
        elementId: "page:manage-events:create",
        title: "Create an event",
        description: "Start the wizard to set up a new event in a few steps.",
      },
      {
        id: "manage-events-stats",
        elementId: "page:manage-events:stats",
        title: "Event stats",
        description:
          "Quick counts of total, published, pending, and draft events — click a tile to filter the list below.",
      },
      {
        id: "manage-events-status-filter",
        elementId: "page:manage-events:status-filter",
        title: "Filter by status",
        description:
          "Switch between draft, pending approval, published, and other statuses.",
      },
      {
        id: "manage-events-search",
        elementId: "page:manage-events:search",
        title: "Search events",
        description: "Quickly find an event by name.",
      },
      {
        id: "manage-events-events",
        elementId: "page:manage-events:events",
        title: "Your events",
        description:
          "Manage each event's details, registrations, and approvals from here.",
      },
    ],
  },
  {
    route: "/dashboard/collaborations/incoming",
    version: 1,
    steps: [
      {
        id: "collaborations-incoming-header",
        elementId: "page:collaborations-incoming:header",
        title: "Collaboration Invites",
        description:
          "Companies invite your campus or Interest Group to co-host events, sponsor activities, and share mentors.",
      },
      {
        id: "collaborations-incoming-invites",
        elementId: "page:collaborations-incoming:invites",
        title: "Your Invitations",
        description: "Accept or decline invitations sent directly to you.",
      },
      {
        id: "collaborations-incoming-open-posts",
        elementId: "page:collaborations-incoming:open-posts",
        title: "Open Posts",
        description:
          "Claim open collaboration posts for a campus or Interest Group you lead.",
      },
    ],
  },
];
