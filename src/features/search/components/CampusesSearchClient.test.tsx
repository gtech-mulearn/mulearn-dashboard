import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  params: new URLSearchParams(),
  enabled: { countries: [] as boolean[], zones: [] as boolean[] },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/dashboard/search/campuses",
  useSearchParams: () => mocks.params,
}));
vi.mock("../hooks", () => ({
  useInfiniteScroll: () => () => {},
  useSearchCampuses: (
    _q: string,
    _t: unknown,
    filters: Record<string, string | undefined>,
  ) => ({
    campuses: [],
    isLoading: false,
    isError: false,
    searchQuery: "",
    setSearchQuery: vi.fn(),
    searchType: undefined,
    setSearchType: vi.fn(),
    filters,
    setFilters: vi.fn(),
    hasNextPage: false,
    fetchNextPage: vi.fn(),
    isFetchingNextPage: false,
  }),
}));
vi.mock("@/features/organizations/hooks", () => ({
  useCountriesDropdown: (enabled: boolean) => {
    mocks.enabled.countries.push(enabled);
    return { data: [] };
  },
  useStatesDropdown: () => ({ data: [] }),
  useAffiliations: () => ({ data: [] }),
}));
vi.mock("@/features/manage-locations/hooks", () => ({
  useZoneDropdown: (enabled: boolean) => {
    mocks.enabled.zones.push(enabled);
    return { data: [] };
  },
}));
vi.mock("./SearchTabsClient", () => ({ SearchTabsClient: () => null }));
vi.mock("./SearchInput", () => ({ SearchInput: () => null }));
vi.mock("./CampusSearchCard", () => ({ CampusSearchCard: () => null }));

import { CampusesSearchClient } from "./CampusesSearchClient";

describe("CampusesSearchClient filter options", () => {
  beforeEach(() => {
    mocks.params = new URLSearchParams();
    mocks.enabled.countries = [];
    mocks.enabled.zones = [];
  });

  it("does not load filter options until the filters are used", () => {
    render(<CampusesSearchClient />);
    expect(mocks.enabled.countries.at(-1)).toBe(false);
  });

  it("loads filter options when a filter gets keyboard focus", () => {
    render(<CampusesSearchClient />);
    // The sort select sits inside the filter row; Tab focus lands on it.
    const filterTrigger = screen.getAllByRole("combobox").at(-1);
    if (!filterTrigger) throw new Error("no filter trigger");
    fireEvent.focus(filterTrigger);
    expect(mocks.enabled.countries.at(-1)).toBe(true);
    expect(mocks.enabled.zones.at(-1)).toBe(true);
  });

  it("loads filter options when a filter comes preset from the URL", () => {
    mocks.params = new URLSearchParams("countryId=IN");
    render(<CampusesSearchClient />);
    expect(mocks.enabled.countries.at(-1)).toBe(true);
  });
});
