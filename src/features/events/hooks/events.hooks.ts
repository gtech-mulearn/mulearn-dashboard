import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, endpoints } from "@/api";
import type {
  CreateEventPayload,
  EventDetailResponse,
  EventListResponse,
  EventMutationResponse,
  UpdateEventPayload,
} from "../types";

export function useEventsList(
  page: number = 1,
  status?: string,
  category?: string,
  search?: string,
) {
  return useQuery<EventListResponse["response"]>({
    queryKey: ["events", page, status, category, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (status) params.set("status", status);
      if (category) params.set("category", category);
      if (search) params.set("search", search);

      const endpoint = `${endpoints.events.list}?${params.toString()}`;
      const response =
        await apiClient.get<EventListResponse["response"]>(endpoint);

      return response;
    },
  });
}

export function useEventDetail(event_id: string) {
  return useQuery<EventDetailResponse["response"]>({
    queryKey: ["event", event_id],
    queryFn: async () => {
      const response = await apiClient.get<EventDetailResponse["response"]>(
        endpoints.events.detail(event_id),
      );
      return response;
    },
    enabled: !!event_id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateEventPayload) => {
      const response = await apiClient.post<EventMutationResponse>(
        endpoints.events.create,
        payload,
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useUpdateEvent(event_id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateEventPayload) => {
      const response = await apiClient.patch<EventMutationResponse>(
        endpoints.events.patch(event_id),
        payload,
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", event_id] });
    },
  });
}

export function useDeleteEvent(event_id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.delete<EventMutationResponse>(
        endpoints.events.delete(event_id),
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useEditEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      event_id,
      payload,
    }: {
      event_id: string;
      payload: Partial<CreateEventPayload>;
    }) => {
      const response = await apiClient.put<EventMutationResponse>(
        endpoints.events.edit(event_id),
        payload,
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({
        queryKey: ["event", variables.event_id],
      });
    },
  });
}

export function usePatchEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      event_id,
      payload,
    }: {
      event_id: string;
      payload: Partial<CreateEventPayload>;
    }) => {
      const response = await apiClient.patch<EventMutationResponse>(
        endpoints.events.patch(event_id),
        payload,
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({
        queryKey: ["event", variables.event_id],
      });
    },
  });
}
