import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addState,
  deleteState,
  fetchStateList,
  fetchStates,
  updateState,
} from "../api/locations.api";
import type { UpdateStateInput } from "../schema";
import type { LocationParams } from "../types";

export const useStates = (params: LocationParams) => {
  return useQuery({
    queryKey: ["states", params],
    queryFn: () => fetchStates(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useStateDropdown = (enabled = false) => {
  return useQuery({
    queryKey: ["state-dropdown"],
    queryFn: fetchStateList,
    enabled,
    refetchOnWindowFocus: false,
  });
};

export const useAddState = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addState,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["states"] });
      queryClient.invalidateQueries({ queryKey: ["state-dropdown"] });
    },
  });
};

export const useUpdateState = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateStateInput) => updateState(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["states"], exact: false }); // 👈 added
      queryClient.invalidateQueries({
        queryKey: ["state-dropdown"],
        exact: false,
      });
    },
  });
};

export const useDeleteState = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteState,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["states"] });
      queryClient.invalidateQueries({ queryKey: ["state-dropdown"] });
    },
  });
};
