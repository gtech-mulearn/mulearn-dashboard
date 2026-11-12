/**
 * Student / common page tours
 *
 * 📍 src/features/tour/steps/pages/student.ts
 *
 * In-page tours for pages every member-role (Student, Pre Member, Fellow,
 * Mentor, Company, IG Lead, Enabler, Intern, Campus roles) can reach —
 * μJourney, Interest Groups, Learning Circle, Search, Projects, Events,
 * Weekly Twitches, Leaderboard, µVerse, Courses, Sessions, Settings, etc.
 * Populated incrementally; each entry is a `PageTourConfig` targeting one
 * route via `data-tour-id` attributes added to that page's components.
 */

import { CAMPUS_SETTINGS_ROLES } from "@/lib/auth/roles";
import type { PageTourConfig } from "../../types";

export const studentPageTours: readonly PageTourConfig[] = [
  {
    route: "/dashboard/profile",
    version: 1,
    steps: [
      {
        id: "profile-intro",
        title: "Your Profile",
        description:
          "View and edit your profile, track your karma, and see your activity history.",
        centered: true,
      },
      {
        id: "profile-header",
        elementId: "page:profile:header",
        title: "Profile Header",
        description:
          "Edit your details, update your cover photo, or share your profile from here.",
      },
      {
        id: "profile-stats",
        elementId: "page:profile:stats",
        title: "Your Stats",
        description: "A snapshot of your karma, level, and activity.",
      },
      {
        id: "profile-sidebar",
        elementId: "page:profile:sidebar",
        title: "Quick Info & Settings",
        description:
          "See your college and Interest Groups, and manage account settings.",
      },
      {
        id: "profile-tabs",
        elementId: "page:profile:tabs",
        title: "Explore Your Profile",
        description:
          "Switch between details, karma history, µVoyage, achievements, badges, and projects.",
      },
    ],
  },
  {
    route: "/dashboard/mujourney",
    version: 1,
    steps: [
      {
        id: "mujourney-intro",
        title: "µJourney",
        description:
          "Your personalized learning path — track milestones and level up.",
        centered: true,
      },
      {
        id: "mujourney-tabs",
        elementId: "page:mujourney:tabs",
        title: "Journey Stages",
        description:
          "Switch between starting your journey, becoming an expert, and related events.",
      },
      {
        id: "mujourney-filter",
        elementId: "page:mujourney:filter",
        title: "Filter Tasks",
        description: "Narrow the list down to completed or incomplete tasks.",
      },
      {
        id: "mujourney-content",
        elementId: "page:mujourney:content",
        title: "Task List",
        description: "Tasks for the selected stage appear here.",
      },
    ],
  },

  {
    route: "/dashboard/interest-groups",
    version: 1,
    steps: [
      {
        id: "ig-intro",
        title: "Interest Groups",
        description:
          "Browse Interest Groups and join ones that match your focus area.",
        centered: true,
      },
      {
        id: "ig-search",
        elementId: "page:interest-groups:search",
        title: "Search Groups",
        description: "Find a group by name.",
      },
      {
        id: "ig-grid",
        elementId: "page:interest-groups:grid",
        title: "Group Cards",
        description: "Open any card to view details and join.",
      },
    ],
  },

  {
    route: "/dashboard/learning-circle",
    version: 1,
    steps: [
      {
        id: "lc-intro",
        title: "Learning Circles",
        description:
          "Join or create a small peer group to learn together and stay accountable.",
        centered: true,
      },
      {
        id: "lc-create",
        elementId: "page:learning-circle:create-btn",
        title: "Create a Circle",
        description: "Start a new learning circle for your Interest Group.",
      },
      {
        id: "lc-invites",
        elementId: "page:learning-circle:invites-btn",
        title: "Invites",
        description: "View and respond to circle invitations you've received.",
      },
      {
        id: "lc-search-filter",
        elementId: "page:learning-circle:search-filter",
        title: "Search & Filter",
        description: "Search circles or switch to just the ones you've joined.",
      },
      {
        id: "lc-grid",
        elementId: "page:learning-circle:grid",
        title: "Circle Cards",
        description: "Browse circles and open one to see more.",
      },
    ],
  },

  {
    route: "/dashboard/projects",
    version: 1,
    steps: [
      {
        id: "projects-intro",
        title: "Projects",
        description:
          "Discover community projects to contribute to or showcase your own.",
        centered: true,
      },
      {
        id: "projects-search",
        elementId: "page:projects:search",
        title: "Search Projects",
        description: "Find a project by name or keyword.",
      },
      {
        id: "projects-grid",
        elementId: "page:projects:grid",
        title: "Project Cards",
        description: "Open a project to see its details.",
      },
    ],
  },

  {
    route: "/dashboard/events",
    version: 1,
    steps: [
      {
        id: "events-intro",
        title: "Events",
        description: "See upcoming events and register for the ones you want.",
        centered: true,
      },
      {
        id: "events-featured",
        elementId: "page:events:featured",
        title: "Featured Events",
        description: "Highlighted events worth a look right now.",
      },
      {
        id: "events-filters",
        elementId: "page:events:filters",
        title: "Filter Events",
        description: "Narrow events down by cluster or event type.",
      },
      {
        id: "events-grid",
        elementId: "page:events:grid",
        title: "Event Cards",
        description: "Open an event to view details and register.",
      },
    ],
  },

  {
    route: "/dashboard/weekly-twitches",
    version: 1,
    steps: [
      {
        id: "twitches-intro",
        title: "Weekly Twitches",
        description:
          "Office Hours, Salt Mango Tree, and Inspiration Station Radio — weekly micro-challenges.",
        centered: true,
      },
      {
        id: "twitches-tabs",
        elementId: "page:weekly-twitches:tabs",
        title: "Twitch Types",
        description: "Switch between the different weekly twitch formats.",
      },
      {
        id: "twitches-content",
        elementId: "page:weekly-twitches:content",
        title: "This Week's Content",
        description: "Content for the selected twitch type appears here.",
      },
    ],
  },

  {
    route: "/dashboard/leaderboard",
    version: 1,
    steps: [
      {
        id: "leaderboard-intro",
        title: "Leaderboard",
        description: "See how your karma stacks up against the community.",
        centered: true,
      },
      {
        id: "leaderboard-category",
        elementId: "page:leaderboard:category",
        title: "Category",
        description: "Switch between student and campus rankings.",
      },
      {
        id: "leaderboard-timeframe",
        elementId: "page:leaderboard:timeframe",
        title: "Time Frame",
        description: "View monthly rankings or the all-time leaderboard.",
      },
      {
        id: "leaderboard-podium",
        elementId: "page:leaderboard:podium",
        title: "Top 3",
        description: "The current top three ranked entries.",
      },
      {
        id: "leaderboard-list",
        elementId: "page:leaderboard:list",
        title: "Full Rankings",
        description: "Everyone else's rank and karma, below the podium.",
      },
    ],
  },

  {
    route: "/dashboard/courses",
    version: 1,
    steps: [
      {
        id: "courses-intro",
        title: "Learning Hub",
        description:
          "Curated courses from our partners to boost your skills and employability.",
        centered: true,
      },
      {
        id: "courses-grid",
        elementId: "page:courses:grid",
        title: "Course Cards",
        description: "Open a course to view it or enroll.",
      },
    ],
  },

  {
    route: "/dashboard/jobs",
    version: 1,
    steps: [
      {
        id: "jobs-intro",
        title: "Jobs",
        description:
          "Discover opportunities that match your skills and karma level.",
        centered: true,
      },
      {
        id: "jobs-tabs",
        elementId: "page:jobs:tabs",
        title: "Browse or Track",
        description: "Switch between browsing open jobs and your applications.",
      },
      {
        id: "jobs-search",
        elementId: "page:jobs:search",
        title: "Search",
        description: "Search jobs or your applications by keyword.",
      },
    ],
  },

  {
    route: "/dashboard/sessions",
    version: 1,
    steps: [
      {
        id: "sessions-intro",
        title: "Sessions",
        description: "Request and track mentoring sessions.",
        centered: true,
      },
      {
        id: "sessions-request",
        elementId: "page:sessions:request-btn",
        title: "Request a Session",
        description: "Ask a mentor for a new session.",
      },
      {
        id: "sessions-tabs",
        elementId: "page:sessions:tabs",
        title: "Session Status",
        description:
          "Switch between available slots, your requests, and past history.",
      },
    ],
  },

  {
    route: "/dashboard/problem-statements",
    version: 1,
    steps: [
      {
        id: "problem-statements-intro",
        title: "Problem Statements",
        description:
          "Real-world problems from industry partners. Pick one, build a solution, and submit it.",
        centered: true,
      },
      {
        id: "problem-statements-header",
        elementId: "page:problem-statements:header",
        title: "Problem Statements",
        description:
          "Browse what's on offer, or check manage statements if your role allows it.",
      },
      {
        id: "problem-statements-tabs",
        elementId: "page:problem-statements:tabs",
        title: "Browse or Track",
        description:
          "Switch between browsing all statements and the ones you're participating in.",
      },
      {
        id: "problem-statements-filters",
        elementId: "page:problem-statements:filters",
        title: "Search & Filter",
        description:
          "Narrow statements by category or status, sort them, or switch between board and table view.",
      },
      {
        id: "problem-statements-results",
        elementId: "page:problem-statements:results",
        title: "Statement Cards",
        description:
          "Open a statement to read the brief, see who else is working on it, and submit your solution.",
      },
    ],
  },

  {
    route: "/dashboard/reports",
    version: 1,
    steps: [
      {
        id: "reports-header",
        elementId: "page:reports:header",
        title: "Event Report Generator",
        description: "Create and download event reports as a PDF.",
      },
      {
        id: "reports-form",
        elementId: "page:reports:form",
        title: "Fill in the Report",
        description:
          "Add a title and content — the preview on the right updates as you type, paginated for printing.",
      },
    ],
  },

  {
    route: "/dashboard/settings",
    version: 1,
    steps: [
      {
        id: "settings-account",
        elementId: "page:settings:account",
        title: "Account Settings",
        description: "Change your password from here.",
      },
      {
        id: "settings-campus",
        elementId: "page:settings:campus",
        title: "Campus Settings",
        description: "Change your campus details.",
        requiresRole: CAMPUS_SETTINGS_ROLES,
      },
    ],
  },
];
