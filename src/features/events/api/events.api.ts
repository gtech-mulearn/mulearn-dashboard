import { apiClient, endpoints } from "@/api";
import type {
  CreateEventPayload,
  EventDetailResponse,
  EventListResponse,
  EventMutationResponse,
  UpdateEventPayload,
} from "../types/events.types";

export const eventsApi = {
  list: async (): Promise<EventListResponse> => {
    const response = await apiClient.get<EventListResponse>(
      endpoints.events.list,
    );
    return response;
  },

  create: async (payload: CreateEventPayload): Promise<EventDetailResponse> => {
    const response = await apiClient.post<EventDetailResponse>(
      endpoints.events.create,
      payload,
    );
    return response;
  },

  detail: async (id: string): Promise<EventDetailResponse> => {
    const response = await apiClient.get<EventDetailResponse>(
      endpoints.events.detail(id),
    );
    return response;
  },

  update: async (
    id: string,
    payload: CreateEventPayload,
  ): Promise<EventMutationResponse> => {
    const response = await apiClient.put<EventMutationResponse>(
      endpoints.events.edit(id),
      payload,
    );
    return response;
  },

  patch: async (
    id: string,
    payload: UpdateEventPayload,
  ): Promise<EventMutationResponse> => {
    const response = await apiClient.patch<EventMutationResponse>(
      endpoints.events.patch(id),
      payload,
    );
    return response;
  },

  delete: async (id: string): Promise<EventMutationResponse> => {
    const response = await apiClient.delete<EventMutationResponse>(
      endpoints.events.delete(id),
    );
    return response;
  },
};
