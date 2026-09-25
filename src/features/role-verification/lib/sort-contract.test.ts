/**
 * Enabler tab sort contract.
 *
 * 📍 src/features/role-verification/lib/sort-contract.test.ts
 */
import { describeSortContract } from "@/test-utils/sort-contract";
import { ROLE_REQUEST_COLUMNS } from "../components/role-verification-table";

// Copied from mulearnbackend/api/dashboard/user/dash_user_views.py —
// UserVerificationAPI sort_fields. Change both together.
const USER_VERIFICATION_SORT_FIELDS = [
  "full_name",
  "role_title",
  "muid",
  "email",
  "mobile",
  "created_at",
];

describeSortContract(
  "Enabler",
  ROLE_REQUEST_COLUMNS,
  USER_VERIFICATION_SORT_FIELDS,
);
