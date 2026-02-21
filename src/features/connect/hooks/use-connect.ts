import { useQuery } from "@tanstack/react-query";
import { fetchQsverseInfo } from "../api/connect.api";
import type { QsverseInfo } from "../schemas/connect.schema";
import { connectKeys } from "./query-keys";

export function useQsverseInfo(muid?: string) {
  return useQuery<QsverseInfo>({
    queryKey: connectKeys.qsverse(muid),
    queryFn: () => fetchQsverseInfo(muid!),
    enabled: !!muid,
  });
}
