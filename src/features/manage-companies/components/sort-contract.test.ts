/**
 * Company tab sort contract.
 *
 * 📍 src/features/manage-companies/components/sort-contract.test.ts
 */
import { describeSortContract } from "@/test-utils/sort-contract";
import { buildColumnOrder } from "./manage-companies-table";

// Copied from mulearnbackend/api/dashboard/company/company_views.py —
// CompanyListAPI sort_fields. Change both together.
const COMPANY_LIST_SORT_FIELDS = [
  "name",
  "status",
  "industry_sector",
  "verification_requested_at",
  "created_at",
];

const noop = () => {};

describeSortContract(
  "Company",
  buildColumnOrder(noop, noop, noop),
  COMPANY_LIST_SORT_FIELDS,
);
