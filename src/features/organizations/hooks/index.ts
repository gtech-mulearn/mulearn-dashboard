/**
 * Organizations Feature — Hooks Index
 *
 * 📍 src/features/organizations/hooks/index.ts
 */

// Error utilities
export { useOrgQueryErrorToast } from "./org-error";
// Query keys
export { affiliationKeys, organizationsKeys } from "./query-keys";

// Affiliation CRUD hooks
export {
  useAffiliationsList,
  useCreateAffiliation,
  useDeleteAffiliation,
  useUpdateAffiliation,
} from "./use-affiliations";

// Department hooks
export {
  useCreateDepartment,
  useDeleteDepartment,
  useDepartments,
  useUpdateDepartment,
} from "./use-departments";

// Organization hooks
export {
  useAffiliations,
  useCountriesDropdown,
  useCreateOrg,
  useDeleteOrg,
  useDistrictsDropdown,
  useEditOrg,
  useOrgsCsvDownload,
  useOrgsList,
  useStatesDropdown,
} from "./use-organizations";

// Transfer & Merge hooks
export {
  useExecuteMerge,
  useMergePreview,
  useTransferOrganization,
} from "./use-transfer";

// Verification hooks
export { useUnverifiedOrgs, useVerifyOrganization } from "./use-verification";
