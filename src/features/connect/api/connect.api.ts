import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  type QsverseInfo,
  QsverseInfoResponseSchema,
  type UserInfo,
  UserInfoResponseSchema,
} from "../schemas/connect.schema";

export const fetchUserInfo = async (): Promise<UserInfo> => {
  const res = await apiClient.get(endpoints.user.info, UserInfoResponseSchema);
  if (res.hasError || !res.response) {
    throw new Error(res.message?.general?.[0] || "Failed to fetch User info");
  }
  return res.response as UserInfo;
};

export const fetchQsverseInfo = async (): Promise<QsverseInfo> => {
  const res = await apiClient.get(
    endpoints.qseverse.connectedUsers((await fetchUserInfo()).muid),
    QsverseInfoResponseSchema,
  );
  if (res.hasError || !res.response) {
    throw new Error(
      res.message?.general?.[0] || "Failed to fetch Qsverse info",
    );
  }
  return res.response as QsverseInfo;
};
