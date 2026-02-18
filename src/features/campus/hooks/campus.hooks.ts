import { useQuery } from "@tanstack/react-query";
import { isValid, parseISO } from "date-fns";
import { campusService } from "../api";

export const useCampusInfo = (id: string) => {
  return useQuery({
    queryKey: ["campus", "info", id],
    queryFn: () => campusService.getCampusInfo(id),
    enabled: !!id,
  });
};

export const useWeeklyKarma = (id: string) => {
  return useQuery({
    queryKey: ["campus", "weekly-karma", id],
    enabled: !!id,
    queryFn: () => campusService.getWeeklyKarma(id),
    select: (data) => {
      if (!data || typeof data !== "object") return [];
      const source =
        "response" in data && data.response && typeof data.response === "object"
          ? (data.response as Record<string, unknown>)
          : (data as Record<string, unknown>);
      return Object.entries(source)
        .filter(([key]) => /^\d{4}-\d{2}-\d{2}$/.test(key))
        .map(([date, value]) => ({
          date,
          value: Number(value) || 0,
        }))
        .filter(({ date }) => isValid(parseISO(date)))
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
    },
  });
};
