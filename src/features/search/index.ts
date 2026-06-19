// API functions
export { searchCampuses, searchMentors, searchUsers } from "./api";

// Components
export {
  CampusesSearchClient,
  CampusSearchCard,
  MentorsSearchClient,
  SearchInput,
  SearchResults,
  SearchTabsClient,
  StudentsSearchClient,
  UserSearchCard,
} from "./components";

// Hooks
export {
  useInfiniteScroll,
  useSearchCampuses,
  useSearchMentors,
  useSearchUsers,
} from "./hooks";
export type {
  CampusSearchData,
  CampusSearchResponse,
  CampusSearchResult,
  SearchType,
  UserSearchData,
  UserSearchResponse,
  UserSearchResult,
} from "./schemas";
// Schemas and types
export {
  ApiResponseSchema,
  campusSearchDataSchema,
  campusSearchResponseSchema,
  campusSearchResultSchema,
  userSearchDataSchema,
  userSearchResponseSchema,
  userSearchResultSchema,
} from "./schemas";
