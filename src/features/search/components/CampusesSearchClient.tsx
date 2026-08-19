"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { StateDisplay } from "@/components/ui/state-display";
import { useZoneDropdown } from "@/features/manage-locations/hooks";
import {
  useAffiliations,
  useCountriesDropdown,
  useStatesDropdown,
} from "@/features/organizations/hooks";
import { useInfiniteScroll, useSearchCampuses } from "../hooks";
import type { CampusSortBy, SearchType } from "../schemas";
import { CampusSearchCard } from "./CampusSearchCard";
import { SearchInput } from "./SearchInput";
import { SearchTabsClient } from "./SearchTabsClient";

const searchTabs = [
  { label: "Learners", href: "/dashboard/search/students" },
  { label: "Mentors", href: "/dashboard/search/mentors" },
  { label: "Campuses", href: "/dashboard/search/campuses" },
];

const NONE = "__all__";

export function CampusesSearchClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {
    campuses,
    isLoading,
    isError,
    searchQuery,
    setSearchQuery,
    searchType,
    setSearchType,
    filters,
    setFilters,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useSearchCampuses(
    searchParams.get("q") ?? "",
    (searchParams.get("type") as SearchType | null) ?? undefined,
    {
      countryId: searchParams.get("countryId") ?? undefined,
      stateId: searchParams.get("stateId") ?? undefined,
      zoneId: searchParams.get("zoneId") ?? undefined,
      affiliationId: searchParams.get("affiliationId") ?? undefined,
      sortBy: (searchParams.get("sortBy") as CampusSortBy | null) ?? undefined,
    },
  );

  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (searchType) params.set("type", searchType);
    if (filters.countryId) params.set("countryId", filters.countryId);
    if (filters.stateId) params.set("stateId", filters.stateId);
    if (filters.zoneId) params.set("zoneId", filters.zoneId);
    if (filters.affiliationId)
      params.set("affiliationId", filters.affiliationId);
    if (filters.sortBy) params.set("sortBy", filters.sortBy);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [searchQuery, searchType, filters, pathname, router]);

  const loadMoreRef = useInfiniteScroll({
    onLoadMore: fetchNextPage,
    hasMore: !!hasNextPage,
    isLoading: isFetchingNextPage,
  });

  const { data: countries = [] } = useCountriesDropdown(filtersOpen);
  const { data: states = [] } = useStatesDropdown(filtersOpen);
  const { data: zones = [] } = useZoneDropdown(filtersOpen);
  const { data: affiliations = [] } = useAffiliations(filtersOpen);

  return (
    <>
      {/* Search Section with Tabs */}
      <div className="mb-6 flex flex-col gap-4 items-start">
        <div className="flex flex-col sm:flex-row flex-1 gap-2 sm:gap-4 w-full">
          <div className="flex-1 w-full">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search campuses by school or college..."
            />
          </div>
          <Select
            value={searchType}
            onValueChange={(value) =>
              setSearchType(value as "school" | "college")
            }
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="school">School</SelectItem>
              <SelectItem value="college">College</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Location / affiliation filters + sort */}
        <div
          className="flex flex-wrap gap-2 w-full"
          onPointerDownCapture={() => setFiltersOpen(true)}
        >
          <Select
            value={filters.countryId ?? NONE}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                countryId: value === NONE ? undefined : value,
              }))
            }
          >
            <SelectTrigger className="w-full sm:flex-1">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent className="max-h-[240px] overflow-y-auto">
              <SelectItem value={NONE}>All Countries</SelectItem>
              {countries.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.stateId ?? NONE}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                stateId: value === NONE ? undefined : value,
              }))
            }
          >
            <SelectTrigger className="w-full sm:flex-1">
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent className="max-h-[240px] overflow-y-auto">
              <SelectItem value={NONE}>All States</SelectItem>
              {states.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.zoneId ?? NONE}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                zoneId: value === NONE ? undefined : value,
              }))
            }
          >
            <SelectTrigger className="w-full sm:flex-1">
              <SelectValue placeholder="Zone" />
            </SelectTrigger>
            <SelectContent className="max-h-[240px] overflow-y-auto">
              <SelectItem value={NONE}>All Zones</SelectItem>
              {zones.map((z) => (
                <SelectItem key={z.value} value={z.value}>
                  {z.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.affiliationId ?? NONE}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                affiliationId: value === NONE ? undefined : value,
              }))
            }
          >
            <SelectTrigger className="w-full sm:flex-1">
              <SelectValue placeholder="Affiliation" />
            </SelectTrigger>
            <SelectContent className="max-h-[240px] overflow-y-auto">
              <SelectItem value={NONE}>All Affiliations</SelectItem>
              {affiliations.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.sortBy ?? NONE}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                sortBy: value === NONE ? undefined : (value as CampusSortBy),
              }))
            }
          >
            <SelectTrigger className="w-full sm:flex-1">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Default</SelectItem>
              <SelectItem value="karma">Karma (High to Low)</SelectItem>
              <SelectItem value="-karma">Karma (Low to High)</SelectItem>
              <SelectItem value="user_count">Members (High to Low)</SelectItem>
              <SelectItem value="-user_count">Members (Low to High)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full shrink-0">
          <SearchTabsClient tabs={searchTabs} />
        </div>
      </div>

      {/* Results */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <Spinner className="h-8 w-8" />
        </div>
      )}
      {isError ? (
        <div className="text-center py-16">
          <p className="text-destructive text-lg">
            Failed to load results. Please try again.
          </p>
        </div>
      ) : campuses.length === 0 && !isLoading ? (
        <StateDisplay variant="no-results" />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {campuses.map((campus) => (
              <CampusSearchCard
                key={campus.id || campus.code}
                campus={campus}
                searchType={searchType}
              />
            ))}
          </div>

          {hasNextPage && <div ref={loadMoreRef} className="h-10" />}

          {isFetchingNextPage && (
            <div className="flex justify-center py-8">
              <Spinner className="h-8 w-8" />
            </div>
          )}
        </>
      )}
    </>
  );
}
