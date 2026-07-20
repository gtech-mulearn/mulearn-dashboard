import { z } from "zod";
import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";

const IgListResponseSchema = z
  .object({
    response: z
      .object({
        interestGroup: z.array(
          z.object({ id: z.string(), name: z.string() }).passthrough(),
        ),
      })
      .passthrough(),
  })
  .passthrough();

export interface IgOption {
  id: string;
  name: string;
}

// Shared IG id→name source for the assign dialog and the grants sheet.
export async function fetchIgOptions(): Promise<IgOption[]> {
  const q = new URLSearchParams({ perPage: "100" });
  const res = await apiClient.get(
    `${endpoints.dashboard.interestGroups}?${q}`,
    IgListResponseSchema,
  );
  return res.response.interestGroup.map((ig) => ({
    id: ig.id,
    name: ig.name,
  }));
}
