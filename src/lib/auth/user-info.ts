/**
 * The signed-in user's info: its schema, query key and fetch. The hook that every part of the app
 * reads it with is in use-user-info.ts.
 *
 * 📍 src/lib/auth/user-info.ts
 *
 * Moved here from the auth feature for dashboard issue 0011, so shared layers (src/components,
 * src/hooks) can read the session without importing a feature. The auth feature re-exports all of
 * it, so `@/features/auth` still works.
 */

import { z } from "zod";
import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";

// The auth feature's response envelope, kept as it was so the user info parses exactly as before.
const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    hasError: z.boolean(),
    statusCode: z.number(),
    message: z.record(z.string(), z.array(z.string())).optional(),
    response: dataSchema,
  });

export const UserInfoSchema = z.object({
  muid: z.string(),
  full_name: z.string(),
  email: z.string().email(),
  mobile: z.string().nullable(),
  gender: z.string().nullable(),
  dob: z.string().nullable(),
  joined: z.string(),
  exist_in_guild: z.boolean(),
  roles: z.array(z.string()),
  dynamic_type: z.array(z.string()).optional().default([]),
  profile_pic: z.string().nullable(),
  user_domains: z.array(z.string()),
  user_endgoals: z.array(z.string()),
  interested_in_work: z.boolean().optional(),
  interested_in_gig_work: z.boolean().optional(),
  is_verified: z.boolean().optional(),
  company: z.unknown().nullable().optional(),
});
export type UserInfo = z.infer<typeof UserInfoSchema>;

export const UserInfoResponseSchema = ApiResponseSchema(UserInfoSchema);
export type UserInfoResponse = z.infer<typeof UserInfoResponseSchema>;

/** The query key: ["auth", "userInfo"], as authKeys.userInfo() has always been. */
export const userInfoKey = () => ["auth", "userInfo"] as const;

/**
 * Get current user info (lightweight)
 */
export async function fetchUserInfo(): Promise<UserInfo> {
  const response = await apiClient.get(
    endpoints.user.info,
    UserInfoResponseSchema,
  );
  return response.response;
}
