import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addZone,
  deleteZone,
  fetchZoneList,
  fetchZones,
  updateZone,
} from "../api/locations.api";
import type { UpdateZoneInput } from "../schema";
import type { LocationParams } from "../types";

export const useZones = (params: LocationParams) => {
  return useQuery({
    queryKey: ["zones", params],
    queryFn: () => fetchZones(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useZoneDropdown = (enabled = false) => {
  return useQuery({
    queryKey: ["zone-dropdown"],
    queryFn: fetchZoneList,
    enabled,
    refetchOnWindowFocus: false,
  });
};

export const useAddZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addZone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      queryClient.invalidateQueries({ queryKey: ["zone-dropdown"] });
    },
  });
};

export const useUpdateZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateZoneInput) => updateZone(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      queryClient.invalidateQueries({ queryKey: ["zone-dropdown"] });
    },
  });
};

export const useDeleteZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteZone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      queryClient.invalidateQueries({ queryKey: ["zone-dropdown"] });
    },
  });
};
