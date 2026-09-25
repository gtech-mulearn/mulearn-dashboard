/**
 * College tab (organization requests) sort contract.
 *
 * 📍 src/features/organizations/components/verify/sort-contract.test.ts
 */
import { describeSortContract } from "@/test-utils/sort-contract";
import { ORG_REQUEST_COLUMNS } from "./verify-orgs-view";

// Copied from mulearnbackend/api/dashboard/organisation/organisation_views.py —
// UnverifiedOrganizationsListAPI sort_fields. Change both together.
const ORG_REQUEST_SORT_FIELDS = [
  "title",
  "created_by",
  "department",
  "created_at",
];

describeSortContract("College", ORG_REQUEST_COLUMNS, ORG_REQUEST_SORT_FIELDS);
