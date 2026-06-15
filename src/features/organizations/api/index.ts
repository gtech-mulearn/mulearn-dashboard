/**
 * Organizations Feature — API Index
 *
 * 📍 src/features/organizations/api/index.ts
 */

// Affiliation CRUD API
export {
  type FetchAffiliationsParams,
  fetchAffiliations,
  createAffiliation,
  updateAffiliation,
  deleteAffiliation,
} from "./affiliation.api";

// Organizations API
export {
  type FetchOrgsParams,
  fetchOrganizations,
  createOrganization,
  editOrganization,
  deleteOrganization,
  downloadOrgsCsv,
  fetchAffiliationDropdowns,
  fetchCountriesDropdown,
  fetchStatesDropdown,
  fetchDistrictsDropdown,
} from "./organizations.api";

// Departments API
export {
  type DepartmentParams,
  type DepartmentListData,
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "./departments.api";

// Transfer & Merge API
export {
  transferOrganization,
  fetchMergePreview,
  executeMerge,
} from "./transfer.api";

// Verification API
export {
  fetchUnverifiedOrgs,
  verifyOrganization,
} from "./verification.api";
