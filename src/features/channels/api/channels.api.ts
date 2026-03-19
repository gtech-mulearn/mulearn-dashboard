import { apiClient } from "@/api";
import { endpoints } from "@/api/endpoints";
import {
  ChannelListResponseSchema,
  type CreateChannelInput,
  MutationResponseSchema,
  type UpdateChannelInput,
} from "../schema";

import type { ChannelListData } from "../types/channel-types";

export interface channelparams {
  page: number;
  perPage: number;
  search?: string;
  sortBy?: string;
}

//------------fetch data-------------------------

export async function fetchChannels(
  params: channelparams,
): Promise<ChannelListData> {
  const query = new URLSearchParams({
    pageIndex: String(params.page),
    perPage: String(params.perPage),
  });

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }
  if (params.sortBy?.trim()) {
    query.set("sortBy", params.sortBy.trim());
  }

  const response = await apiClient.get(
    `${endpoints.channels.List}?${query.toString()}`,
    ChannelListResponseSchema,
  );

  return (
    response.response ??
    response.data ?? {
      data: [],
      pagination: { count: 0, totalPages: 1, isNext: false, isPrev: false },
    }
  );
}

//------------- Delete channel--------------------------

export async function deletechannel(id: string): Promise<void> {
  await apiClient.delete(endpoints.channels.delete(id));
}

//-----------------Add channel--------------------------------

export async function addChannel(data: CreateChannelInput): Promise<void> {
  await apiClient.post(endpoints.channels.Create, data, MutationResponseSchema);
}

//-------------- update Channel ------------------------------

export async function updateChannels(data: UpdateChannelInput): Promise<void> {
  await apiClient.put(
    endpoints.channels.update(data.discord_id),
    data,
    MutationResponseSchema,
  );
}
