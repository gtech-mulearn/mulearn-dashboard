/**
 * Campus / Zonal / District page tours
 *
 * 📍 src/features/tour/steps/pages/campus.ts
 *
 * In-page tours for `/dashboard/campus/manage`, `/dashboard/zonal`,
 * `/dashboard/district`, `/dashboard/campus/[id]`.
 *
 * `campus/[id]/page.tsx` is skipped — dynamic route, out of scope for this
 * pass.
 */

import type { PageTourConfig } from "../../types";

export const campusPageTours: readonly PageTourConfig[] = [
  {
    route: "/dashboard/campus/manage",
    version: 1,
    steps: [
      {
        id: "campus-manage-intro",
        title: "Manage Your Campus",
        description:
          "Everything you need to run your campus: karma, students, events, and execom in one place.",
        centered: true,
      },
      {
        id: "campus-manage-overview",
        elementId: "page:campus-manage:overview",
        title: "Campus Overview",
        description:
          "Your campus's karma, rank, and member counts at a glance, plus quick actions to transfer Lead or Enabler.",
      },
      {
        id: "campus-manage-student-search",
        elementId: "page:campus-manage:student-search",
        title: "Find Students",
        description: "Search the student leaderboard by name or MU ID.",
      },
      {
        id: "campus-manage-export-csv",
        elementId: "page:campus-manage:export-csv",
        title: "Export Student Data",
        description:
          "Download the filtered student list as a CSV for offline review.",
      },
      {
        id: "campus-manage-leaderboard",
        elementId: "page:campus-manage:leaderboard",
        title: "Student Leaderboard",
        description:
          "Rank, karma, and level for every student — nominate a Campus Mentor directly from here.",
      },
      {
        id: "campus-manage-tabs",
        elementId: "page:campus-manage:tabs",
        title: "More Campus Data",
        description:
          "Switch tabs to see analytics, events, execom, and IG chapters for your campus.",
      },
    ],
  },
  {
    route: "/dashboard/zonal",
    version: 1,
    steps: [
      {
        id: "zonal-intro",
        title: "Zonal Dashboard",
        description:
          "Track performance across every campus and district in your zone.",
        centered: true,
      },
      {
        id: "zonal-overview",
        elementId: "page:zonal:overview",
        title: "Zone Overview",
        description:
          "Your zone's rank, total members, and active members this month.",
      },
      {
        id: "zonal-charts",
        elementId: "page:zonal:charts",
        title: "Top Districts & Levels",
        description:
          "See the highest karma-performing districts and how students are distributed across levels.",
      },
      {
        id: "zonal-list-tabs",
        elementId: "page:zonal:list-tabs",
        title: "Students & Colleges",
        description: "Switch between student and college lists for the zone.",
      },
      {
        id: "zonal-student-table",
        elementId: "page:zonal:student-table",
        title: "Zone Lists",
        description:
          "Search, sort, and export the student or college list for your zone.",
      },
    ],
  },
  {
    route: "/dashboard/district",
    version: 1,
    steps: [
      {
        id: "district-intro",
        title: "District Dashboard",
        description:
          "Track campus performance and activity across your entire district.",
        centered: true,
      },
      {
        id: "district-overview",
        elementId: "page:district:overview",
        title: "District Overview",
        description:
          "Your district's rank, total members, and active members this month.",
      },
      {
        id: "district-charts",
        elementId: "page:district:charts",
        title: "Top Campuses & Levels",
        description:
          "See the highest karma-performing campuses and how students are distributed across levels.",
      },
      {
        id: "district-list-tabs",
        elementId: "page:district:list-tabs",
        title: "Students & Colleges",
        description:
          "Switch between student and college lists for the district.",
      },
      {
        id: "district-student-table",
        elementId: "page:district:student-table",
        title: "District Lists",
        description:
          "Search, sort, and export the student or college list for your district.",
      },
    ],
  },
];
