import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  type QsverseInfo,
  QsverseInfoResponseSchema,
} from "../schemas/connect.schema";

export const fetchQsverseInfo = async (muid: string): Promise<QsverseInfo> => {
  const res = await apiClient.get(
    endpoints.qseverse.connectedUsers(muid),
    QsverseInfoResponseSchema,
  );
  if (res.hasError || !res.response) {
    throw new Error(
      res.message?.general?.[0] || "Failed to fetch Qsverse info",
    );
  }
  return res.response as QsverseInfo;
};
