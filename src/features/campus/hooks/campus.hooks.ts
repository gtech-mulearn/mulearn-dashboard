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
    queryFn: () => campusService.getWeeklyKarma(id),
    enabled: !!id,
    select: (data) => {
      if (!data || typeof data !== "object") return [];

      let source: Record<string, unknown> = data;
      if (source.response && typeof source.response === "object") {
        source = source.response as Record<string, unknown>;
      }

      return Object.entries(source)
        .filter(([key]) => {
          return (
            /^\d{4}-\d{2}-\d{2}$/.test(key) ||
            (key !== "college_name" &&
              key !== "campus_code" &&
              key !== "campus_zone" &&
              key !== "campus_level" &&
              !Number.isNaN(new Date(key).getTime()))
          );
        })
        .map(([date, value]) => ({
          date,
          value: typeof value === "number" ? value : value ? Number(value) : 0,
        }))
        .filter((item) => {
          const d = parseISO(item.date);
          return isValid(d);
        })
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
    },
  });
};
