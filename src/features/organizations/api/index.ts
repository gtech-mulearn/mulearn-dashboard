/**
 * Organizations Feature — API Index
 *
 * 📍 src/features/organizations/api/index.ts
 */

// Affiliation CRUD API
export {
  createAffiliation,
  deleteAffiliation,
  type FetchAffiliationsParams,
  fetchAffiliations,
  updateAffiliation,
} from "./affiliation.api";
// Departments API
export {
  createDepartment,
  type DepartmentListData,
  type DepartmentParams,
  deleteDepartment,
  fetchDepartments,
  updateDepartment,
} from "./departments.api";
// Organizations API
export {
  createOrganization,
  deleteOrganization,
  downloadOrgsCsv,
  editOrganization,
  type FetchOrgsParams,
  fetchAffiliationDropdowns,
  fetchCountriesDropdown,
  fetchDistrictsDropdown,
  fetchOrganizations,
  fetchStatesDropdown,
} from "./organizations.api";

// Transfer & Merge API
export {
  executeMerge,
  fetchMergePreview,
  transferOrganization,
} from "./transfer.api";

// Verification API
export {
  fetchUnverifiedOrgs,
  verifyOrganization,
} from "./verification.api";
