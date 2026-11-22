// The signed-in dashboard's interest-group list (/api/v1/dashboard/ig/list/): ids, names and
// categories, used by the learner home and the mentor onboarding and profile forms. It isn't the
// public list in interest-groups.api.ts. Moved here from the home feature for dashboard issue 0010,
// so mentor no longer imports home; it was getInterestGroupsList there.

import { z } from "zod";
import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";

const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    hasError: z.boolean(),
    statusCode: z.number(),
    message: z.record(z.string(), z.array(z.string())).optional(),
    response: dataSchema,
  });

export const DashboardInterestGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string().optional(),
});
export type DashboardInterestGroup = z.infer<
  typeof DashboardInterestGroupSchema
>;

export const DashboardInterestGroupsResponseSchema = ApiResponseSchema(
  z.object({
    interestGroup: z.array(DashboardInterestGroupSchema),
  }),
);

export async function getDashboardInterestGroups() {
  const response = await apiClient.get(
    endpoints.dashboard.interestGroups,
    DashboardInterestGroupsResponseSchema,
  );
  return response.response.interestGroup;
}
