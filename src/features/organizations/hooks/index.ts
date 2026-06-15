/**
 * Organizations Feature — Hooks Index
 *
 * 📍 src/features/organizations/hooks/index.ts
 */

// Query keys
export { organizationsKeys, affiliationKeys } from "./query-keys";

// Error utilities
export { getOrgErrorMessage, useOrgQueryErrorToast } from "./org-error";

// Affiliation CRUD hooks
export {
  useAffiliationsList,
  useCreateAffiliation,
  useUpdateAffiliation,
  useDeleteAffiliation,
} from "./use-affiliations";

// Department hooks
export {
  useDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from "./use-departments";

// Organization hooks
export {
  useOrgsList,
  useCreateOrg,
  useEditOrg,
  useDeleteOrg,
  useOrgsCsvDownload,
  useAffiliations,
  useCountriesDropdown,
  useStatesDropdown,
  useDistrictsDropdown,
} from "./use-organizations";

// Transfer & Merge hooks
export {
  useTransferOrganization,
  useMergePreview,
  useExecuteMerge,
} from "./use-transfer";

// Verification hooks
export { useUnverifiedOrgs, useVerifyOrganization } from "./use-verification";
