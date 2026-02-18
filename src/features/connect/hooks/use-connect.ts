import { useQuery } from "@tanstack/react-query";
import { fetchQsverseInfo, fetchUserInfo } from "../api/connect.api";
import type { QsverseInfo, UserInfo } from "../schemas/connect.schema";
import { connectKeys } from "./query-keys";

export function useUserInfo() {
  return useQuery<UserInfo>({
    queryKey: connectKeys.user(),
    queryFn: fetchUserInfo,
  });
}

export function useQsverseInfo() {
  return useQuery<QsverseInfo>({
    queryKey: connectKeys.qsverse(),
    queryFn: fetchQsverseInfo,
  });
}
