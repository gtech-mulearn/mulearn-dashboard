/**
 * Search Schemas Index
 *
 *  src/features/search/schemas/index.ts
 *
 * Public exports for search schemas.
 */

export {
  ApiResponseSchema,
  campusSearchDataSchema,
  campusSearchResponseSchema,
  campusSearchResultSchema,
  userSearchDataSchema,
  userSearchResponseSchema,
  userSearchResultSchema,
} from "./search.schemas";

export type {
  CampusSearchData,
  CampusSearchResponse,
  CampusSearchResult,
  SearchType,
  UserSearchData,
  UserSearchResponse,
  UserSearchResult,
} from "./search.schemas";
