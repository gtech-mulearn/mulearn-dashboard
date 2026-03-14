import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addCountry,
  deleteCountry,
  fetchCountryList,
  fetchLocation,
  updateCountry,
} from "../api/locations.api";
import type { UpdateCountryInput } from "../schema";
import type { LocationParams } from "../types";

export function useCountries(params: LocationParams) {
  return useQuery({
    queryKey: ["countries", params],
    queryFn: () => fetchLocation(params),
    placeholderData: (previousData) => previousData,
    enabled: params.enabled ?? true,
  });
}

export const useCountryDropdown = (enabled = false) => {
  return useQuery({
    queryKey: ["country-dropdown"],
    queryFn: fetchCountryList,
    enabled,
    refetchOnWindowFocus: false,
  });
};

export const useAddCountry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addCountry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["countries"], exact: false });
      queryClient.invalidateQueries({
        queryKey: ["country-dropdown"],
        exact: false,
      });
    },
  });
};

export const useUpdateCountry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCountryInput) => updateCountry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["countries"], exact: false });
      queryClient.invalidateQueries({
        queryKey: ["country-dropdown"],
        exact: false,
      });
    },
  });
};

export const useDeleteCountry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCountry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["countries"], exact: false });
      queryClient.invalidateQueries({
        queryKey: ["country-dropdown"],
        exact: false,
      });
    },
  });
};
