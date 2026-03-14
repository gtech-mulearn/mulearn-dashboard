import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  addDistrict,
  deleteDistrict,
  fetchDistricts,
  updateDistrict,
} from "../api/locations.api";
import type { UpdateDistrictInput } from "../schema";
import type { LocationParams } from "../types";

export const useDistricts = (params: LocationParams) => {
  return useQuery({
    queryKey: ["districts", params],
    queryFn: () => fetchDistricts(params),
    placeholderData: keepPreviousData,
    enabled: params.enabled ?? true,
  });
};

export const useAddDistrict = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addDistrict,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["districts"],
        exact: false,
      });
    },
  });
};

export const useUpdateDistrict = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateDistrictInput) => updateDistrict(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["districts"] });
    },
  });
};

export const useDeleteDistrict = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDistrict,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["districts"] });
    },
  });
};
