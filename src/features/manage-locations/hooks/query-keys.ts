export const locationQueryKeys = {
  all: ["locations"] as const,

  countries: () => [...locationQueryKeys.all, "countries"] as const,
  states: () => [...locationQueryKeys.all, "states"] as const,
  zones: () => [...locationQueryKeys.all, "zones"] as const,
  districts: () => [...locationQueryKeys.all, "districts"] as const,

  countryDropdown: () =>
    [...locationQueryKeys.all, "country-dropdown"] as const,
  stateDropdown: () => [...locationQueryKeys.all, "state-dropdown"] as const,
};
