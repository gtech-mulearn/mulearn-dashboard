import { useQuery } from "@tanstack/react-query";
import { fetchQseverseInfo } from "../api/connect.api";
import type { QseverseInfo } from "../schemas/connect.schema";
import { connectKeys } from "./query-keys";

export function useQseverseInfo(muid?: string) {
  return useQuery<QseverseInfo>({
    queryKey: connectKeys.qsverse(muid),
    queryFn: () => {
      if (!muid) throw new Error("muid is required");
      return fetchQseverseInfo(muid);
    },
    enabled: !!muid,
  });
}
