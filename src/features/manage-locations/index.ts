/**
 * Manage Locations Feature
 *
 * 📍 src/features/manage-locations/index.ts
 *
 * Public API for the manage‑locations feature.
 * Mirror pattern used by other features in the repo.
 */

export type { LocationParams } from "./api";
export {
  addCountry,
  addDistrict,
  addState,
  addZone,
  deleteCountry,
  deleteDistrict,
  deleteState,
  deleteZone,
  fetchCountryList,
  fetchDistricts,
  fetchLocation,
  fetchStateList,
  fetchStates,
  fetchZoneList,
  fetchZones,
  updateCountry,
  updateDistrict,
  updateState,
  updateZone,
} from "./api";
export { LocationManagementPage } from "./components";
export {
  locationQueryKeys,
  useAddCountry,
  useAddDistrict,
  useAddState,
  useAddZone,
  useCountries,
  useCountryDropdown,
  useDeleteCountry,
  useDeleteDistrict,
  useDeleteState,
  useDeleteZone,
  useDistricts,
  useStateDropdown,
  useStates,
  useUpdateCountry,
  useUpdateDistrict,
  useUpdateState,
  useUpdateZone,
  useZoneDropdown,
  useZones,
} from "./hooks";
export type {
  CreateCountryInput,
  CreateDistrictInput,
  CreateStateInput,
  CreateZoneInput,
  DropdownItem,
  UpdateCountryInput,
  UpdateDistrictInput,
  UpdateStateInput,
  UpdateZoneInput,
} from "./schema";
export {
  ApiEnvelopeSchema,
  CreateCountrySchema,
  CreateDistrictSchema,
  CreateStateSchema,
  CreateZoneSchema,
  DistrictDataSchema,
  DistrictItemSchema,
  DropdownItemSchema,
  DropdownResponseSchema,
  LocationDataSchema,
  LocationItemSchema,
  MutationResponseSchema,
  PaginatedDataSchema,
  PaginationSchema,
  StateDataSchema,
  StateItemSchema,
  UpdateCountrySchema,
  UpdateDistrictSchema,
  UpdateStateSchema,
  UpdateZoneSchema,
  ZoneDataSchema,
  ZoneItemSchema,
} from "./schema";
