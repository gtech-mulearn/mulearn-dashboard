import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  type QseverseInfo,
  QseverseInfoResponseSchema,
} from "../schemas/connect.schema";

export const fetchQseverseInfo = async (
  muid: string,
): Promise<QseverseInfo> => {
  const res = await apiClient.get(
    endpoints.qseverse.connectedUsers(muid),
    QseverseInfoResponseSchema,
  );
  if (res.hasError || !res.response) {
    throw new Error(
      res.message?.general?.[0] || "Failed to fetch Qsverse info",
    );
  }
  return res.response as QseverseInfo;
};
