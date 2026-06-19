"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  type CreateShortUrlPayload,
  createShortUrl,
  deleteShortUrl,
  fetchShortUrlAnalytics,
  fetchShortUrls,
  updateShortUrl,
} from "../api/shortener.api";

const SHORT_URL_KEYS = {
  all: ["short-urls"] as const,
  lists: () => [...SHORT_URL_KEYS.all, "list"] as const,
  list: (params: object) => [...SHORT_URL_KEYS.lists(), params] as const,
};

interface UseShortUrlsListParams {
  pageIndex: number;
  perPage: number;
  search: string;
  sortBy: string;
}

export function useShortUrlsList(params: UseShortUrlsListParams) {
  return useQuery({
    queryKey: SHORT_URL_KEYS.list(params),
    queryFn: () => fetchShortUrls(params),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useCreateShortUrl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateShortUrlPayload) => createShortUrl(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHORT_URL_KEYS.lists() });
    },
  });
}

export function useUpdateShortUrl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateShortUrlPayload>;
    }) => updateShortUrl(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHORT_URL_KEYS.lists() });
    },
  });
}

export function useDeleteShortUrl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteShortUrl(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHORT_URL_KEYS.lists() });
    },
  });
}

export function useShortUrlAnalytics(id: string | null) {
  return useQuery({
    queryKey: ["short-url-analytics", id],
    queryFn: () => fetchShortUrlAnalytics(id ?? ""),
    enabled: !!id,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
