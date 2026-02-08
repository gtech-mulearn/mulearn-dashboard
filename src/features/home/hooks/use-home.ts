import { useQuery } from "@tanstack/react-query";
import { homeKeys } from "./query-keys";
import { getInterestGroupsList, getKarmaFeed } from "../api";

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
