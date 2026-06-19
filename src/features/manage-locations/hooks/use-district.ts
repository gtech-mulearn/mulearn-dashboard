import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
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
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to add district" }),
      );
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
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to update district" }),
      );
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
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to delete district" }),
      );
    },
  });
};
