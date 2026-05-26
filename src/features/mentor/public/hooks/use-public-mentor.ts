"use client";

import { useQuery } from "@tanstack/react-query";
import { mentorKeys } from "@/features/mentor/hooks/query-keys";
import {
  fetchPublicMentorAvailability,
  fetchPublicMentorCard,
  fetchPublicMentorSessions,
  type PublicMentorSessionsParams,
} from "../api/public-mentor.api";

export function usePublicMentorCard(muid: string | null | undefined) {
  return useQuery({
    queryKey: mentorKeys.public.card(muid ?? ""),
    queryFn: () => fetchPublicMentorCard(muid as string),
    enabled: !!muid,
  });
}

export function usePublicMentorSessions(
  muid: string | null | undefined,
  params: PublicMentorSessionsParams = {},
) {
  return useQuery({
    queryKey: mentorKeys.public.sessions(
      muid ?? "",
      params as Record<string, unknown>,
    ),
    queryFn: () => fetchPublicMentorSessions(muid as string, params),
    enabled: !!muid,
  });
}

export function usePublicMentorAvailability(
  muid: string | null | undefined,
  igId?: string,
) {
  return useQuery({
    queryKey: mentorKeys.public.availability(muid ?? "", igId),
    queryFn: () => fetchPublicMentorAvailability(muid as string, igId),
    enabled: !!muid,
  });
}
