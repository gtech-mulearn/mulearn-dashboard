import { useQuery } from "@tanstack/react-query";
import { getEvents, getInterestGroupsList, getKarmaFeed } from "../api";
import { homeKeys } from "./query-keys";

const HOME_STALE_TIME = 5 * 60 * 1000;

export function useInterestGroupsList() {
  return useQuery({
    queryKey: homeKeys.interestGroups(),
    queryFn: getInterestGroupsList,
    staleTime: 10 * 60 * 1000,
  });
}

export function useKarmaFeed() {
  return useQuery({
    queryKey: homeKeys.karmaFeed(),
    queryFn: getKarmaFeed,
    staleTime: HOME_STALE_TIME,
  });
}

export function useEvents() {
  return useQuery({
    queryKey: homeKeys.events(),
    queryFn: getEvents,
    staleTime: HOME_STALE_TIME,
  });
}
