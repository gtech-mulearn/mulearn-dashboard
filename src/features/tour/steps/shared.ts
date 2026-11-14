/**
 * Shared Step Fragments
 *
 * 📍 src/features/tour/steps/shared.ts
 *
 * Steps reused verbatim across multiple tour keys, so content only lives
 * in one place. Base steps are the persona-agnostic sidebar items visible
 * to (almost) everyone (§5.1 of docs/features/tour.md) — role/company
 * exclusions for them are handled by `useTour`'s `useFilteredNav`-backed
 * visibility filter (nav item hidden for this user -> step silently
 * dropped), not by `requiresRole` here.
 */

import type { TourStep, TourStepContext } from "../types";

export const welcomeStep: TourStep = {
  id: "welcome",
  navId: "home",
  title: "Welcome to μLearn",
  description:
    "Quick tour of the essentials so you can find your way around. Takes under a minute — skip anytime.",
  centered: true,
};

export const baseNavSteps: TourStep[] = [
  {
    id: "home",
    navId: "home",
    title: "Home",
    description:
      "Your landing page — a snapshot of what's happening and what needs your attention.",
  },
  {
    id: "profile",
    navId: "profile",
    title: "Your Profile",
    description:
      "View and edit your profile, track your karma, and see your activity history.",
  },
  {
    id: "mujourney",
    navId: "mujourney",
    title: "μJourney",
    description:
      "Your personalized learning path — see completed milestones and what's next.",
  },
  {
    id: "ig",
    navId: "interest-groups",
    title: "Interest Groups",
    description:
      "Browse and join Interest Groups to learn alongside people who share your focus area.",
  },
  {
    id: "learning-circle",
    navId: "learning-circle",
    title: "Learning Circle",
    description:
      "Join a small peer group to learn together, track progress, and stay accountable.",
  },
  {
    id: "search",
    navId: "search",
    title: "Search",
    description:
      "Quickly find people and campuses from anywhere in the dashboard.",
  },
  {
    id: "projects",
    navId: "projects",
    title: "Projects",
    description:
      "Discover projects to contribute to or showcase your own work.",
  },
  {
    id: "events",
    navId: "events",
    title: "Events",
    description:
      "See upcoming events and sessions, and register for the ones you want to attend.",
  },
  {
    id: "twitches",
    navId: "weekly-twitches",
    title: "Weekly Twitches",
    description:
      "Weekly micro-challenges to keep your skills sharp — check in every week.",
  },
  {
    id: "leaderboard",
    navId: "leaderboard",
    title: "Leaderboard",
    description:
      "See how your karma stacks up against the rest of the community.",
  },
  {
    id: "muverse",
    navId: "muverse",
    title: "µVerse",
    description:
      "Explore the broader μLearn community, updates, and resources.",
  },
  {
    id: "notifications",
    elementId: "page:dashboard:notifications",
    title: "Notifications",
    description:
      "Stay on top of updates, approvals, and broadcasts from the community — right from the topbar.",
  },
];

/**
 * Shared by every persona holding `events:manage` — Campus Lead, Lead
 * Enabler, Company, Enabler, Mentor, Zonal Campus Lead, District Campus
 * Lead (static grants, `permissions.ts:76-85`), plus any
 * " IGLead"/" CampusLead"-suffixed dynamic role.
 */
export const manageEventsStep: TourStep = {
  id: "manage-events",
  navId: "manage-events",
  title: "Manage Events",
  description:
    "Create and manage events for your community — schedules, registrations, and details.",
  requiresFlag: (ctx: TourStepContext) => ctx.can("events:manage"),
};

export const finishStep: TourStep = {
  id: "finish",
  navId: "home",
  title: "You're all set",
  description:
    "That's the essentials. Replay this tour anytime from your profile menu.",
  centered: true,
};
