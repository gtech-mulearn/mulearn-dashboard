/**
 * Weekly Twitches Feature
 *
 * 📍 src/features/weekly-twitches/index.ts
 *
 * Public API for the weekly-twitches feature.
 * Import from here, not from internal files.
 */

// API functions (for direct use if needed)
export type { ListParams } from "./api";
export {
  createIs,
  createOfficeHours,
  createSmt,
  deleteIs,
  deleteOfficeHours,
  deleteSmt,
  fetchIsDetail,
  fetchIsList,
  fetchOfficeHoursDetail,
  fetchOfficeHoursList,
  fetchSmtDetail,
  fetchSmtList,
  updateIs,
  updateOfficeHours,
  updateSmt,
} from "./api";

// Components
export {
  CampusContentCards,
  CampusContentDetailDialog,
  MediaCard,
  MediaCardSkeleton,
  OfficeHoursCards,
  OfficeHoursDetailDialog,
  WeeklyTwitchesView,
  WeeklyTwitchesViewer,
} from "./components";

// Hooks (primary way to use the feature)
export {
  useIsList,
  useIsMutations,
  useOfficeHoursList,
  useOfficeHoursMutations,
  useSmtList,
  useSmtMutations,
  weeklyTwitchesKeys,
} from "./hooks";

// Schemas and types
export {
  CampusContentDetailResponseSchema,
  type CampusContentItem,
  CampusContentItemSchema,
  type CampusContentListData,
  CampusContentListDataSchema,
  CampusContentListResponseSchema,
  type CampusContentType,
  type CampusContentWrite,
  CampusContentWriteSchema,
  type ContentStatus,
  type ContentZone,
  MutationResponseSchema,
  OfficeHoursDetailResponseSchema,
  type OfficeHoursItem,
  OfficeHoursItemSchema,
  type OfficeHoursListData,
  OfficeHoursListDataSchema,
  OfficeHoursListResponseSchema,
  type OfficeHoursWrite,
  OfficeHoursWriteSchema,
  PaginationSchema,
  StatusSchema,
  ZoneSchema,
} from "./schemas";
