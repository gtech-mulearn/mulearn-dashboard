import { useQuery } from "@tanstack/react-query";
import { fetchDiscordInfo, fetchQsverseInfo } from "../api/connect.api";
import type { DiscordUserInfo, QsverseInfo } from "../schemas/connect.schema";
import { connectKeys } from "./query-keys";

export function useDiscordInfo() {
  return useQuery<DiscordUserInfo>({
    queryKey: connectKeys.discord(),
    queryFn: fetchDiscordInfo,
  });
}

export function useQsverseInfo() {
  return useQuery<QsverseInfo>({
    queryKey: connectKeys.qsverse(),
    queryFn: fetchQsverseInfo,
  });
}
