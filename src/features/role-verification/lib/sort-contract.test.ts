/**
 * Sort contract for every table on the unified Role Verification page.
 *
 * 📍 src/features/role-verification/lib/sort-contract.test.ts
 *
 * CommonUtils.get_paginated_queryset (mulearnbackend/utils/utils.py) silently
 * ignores a sortBy key missing from the view's sort_fields, so a sortable
 * column the backend doesn't know shows an arrow that does nothing. The keys
 * below are copied from the backend — change both together.
 */
import { describe, expect, it } from "vitest";
import { buildColumnOrder } from "@/features/manage-companies/components/manage-companies-table";
import { ROSTER_COLUMNS } from "@/features/mentor/admin/components/mentor-roster-tab";
import {
  APPLICATION_COLUMNS,
  CHANGE_REQUEST_COLUMNS,
} from "@/features/mentor/admin/components/mentor-verification-page";
import { ORG_REQUEST_COLUMNS } from "@/features/organizations/components/verify/verify-orgs-view";
import { ROLE_REQUEST_COLUMNS } from "../components/role-verification-table";

const BACKEND_SORT_FIELDS = {
  // api/dashboard/user/dash_user_views.py — UserVerificationAPI
  userVerification: [
    "full_name",
    "role_title",
    "muid",
    "email",
    "mobile",
    "created_at",
  ],
  // api/dashboard/organisation/organisation_views.py — UnverifiedOrganizationsListAPI
  orgRequests: ["title", "created_by", "department", "created_at"],
  // api/dashboard/company/company_views.py — CompanyListAPI
  companies: [
    "name",
    "status",
    "industry_sector",
    "verification_requested_at",
    "created_at",
  ],
  // api/dashboard/mentor/mentor_views.py — MentorListAPI
  mentorApplications: ["created_at", "status", "user_full_name"],
  // mentor_views.py — MentorChangeRequestListAPI
  mentorChangeRequests: ["created_at", "user_full_name"],
  // mentor_views.py — MentorRosterAPI
  mentorRoster: ["created_at", "user_full_name"],
};

type Column = { column: string; isSortable: boolean };
const sortable = (columns: Column[]) =>
  columns.filter((c) => c.isSortable).map((c) => c.column);
const noop = () => {};

const TABLES: Array<[string, Column[], string[]]> = [
  ["Enabler", ROLE_REQUEST_COLUMNS, BACKEND_SORT_FIELDS.userVerification],
  ["College", ORG_REQUEST_COLUMNS, BACKEND_SORT_FIELDS.orgRequests],
  [
    "Company",
    buildColumnOrder(noop, noop, noop),
    BACKEND_SORT_FIELDS.companies,
  ],
  [
    "Mentor applications",
    APPLICATION_COLUMNS,
    BACKEND_SORT_FIELDS.mentorApplications,
  ],
  [
    "Mentor change requests",
    CHANGE_REQUEST_COLUMNS,
    BACKEND_SORT_FIELDS.mentorChangeRequests,
  ],
  ["Mentor roster", ROSTER_COLUMNS, BACKEND_SORT_FIELDS.mentorRoster],
];

describe.each(TABLES)("%s table", (_name, columns, backendKeys) => {
  it("only offers sorts the backend applies", () => {
    for (const key of sortable(columns)) {
      expect(backendKeys).toContain(key);
    }
  });

  it("offers a date sort", () => {
    expect(sortable(columns).some((key) => key.endsWith("_at"))).toBe(true);
  });
});
