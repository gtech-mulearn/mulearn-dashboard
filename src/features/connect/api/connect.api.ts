import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  DiscordInfoResponseSchema,
  type DiscordUserInfo,
  type QsverseInfo,
  QsverseInfoResponseSchema,
} from "../schemas/connect.schema";

export const fetchDiscordInfo = async (): Promise<DiscordUserInfo> => {
  const res = await apiClient.get(
    endpoints.user.info,
    DiscordInfoResponseSchema,
  );
  if (res.hasError || !res.response) {
    throw new Error(
      res.message?.general?.[0] || "Failed to fetch Discord info",
    );
  }
  return res.response as DiscordUserInfo;
};

export const fetchQsverseInfo = async (): Promise<QsverseInfo> => {
  const res = await apiClient.get(
    endpoints.qseverse.connectedUsers,
    QsverseInfoResponseSchema,
  );
  if (res.hasError || !res.response) {
    throw new Error(
      res.message?.general?.[0] || "Failed to fetch Qsverse info",
    );
  }
  return res.response as QsverseInfo;
};
