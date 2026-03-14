import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addChannel,
  deletechannel,
  fetchChannels,
  updateChannels,
} from "../api/channels.api";

import type { UpdateChannelInput } from "../schema/index";

import type { ChannelParams } from "../types/channel-types";

export const useChannel = (params: ChannelParams) => {
  return useQuery({
    queryKey: ["channels", params],
    queryFn: () => fetchChannels(params),
    placeholderData: (prev) => prev,
  });
};

export const useAddChannel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addChannel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"], exact: false });
      queryClient.invalidateQueries({
        queryKey: ["country-list"],
        exact: false,
      });
    },
  });
};

export const useUpdateChannel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateChannelInput) => updateChannels(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"], exact: false });
      queryClient.invalidateQueries({
        queryKey: ["channel-update"],
        exact: false,
      });
    },
  });
};

export const useDeleteChannel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletechannel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"], exact: false });
      queryClient.invalidateQueries({
        queryKey: ["channel-delete"],
        exact: false,
      });
    },
  });
};
