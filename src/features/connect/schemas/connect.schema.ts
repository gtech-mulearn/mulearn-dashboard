import { z } from "zod";

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    hasError: z.boolean(),
    statusCode: z.number(),
    message: z.record(z.string(), z.array(z.string())).optional(),
    response: dataSchema,
  });

export const UserInfoSchema = z.object({
  muid: z.string(),
  full_name: z.string(),
  email: z.string(),
  mobile: z.string().nullable(),
  gender: z.string().nullable(),
  dob: z.string().nullable(),
  exist_in_guild: z.boolean(),
  joined: z.string(),
  roles: z.array(z.string()),
  profile_pic: z.string().nullable(),
  dynamic_type: z.array(z.string()),
  user_domains: z.array(z.string()),
  user_endgoals: z.array(z.string()),
  interested_in_work: z.boolean(),
  interested_in_gig_work: z.boolean(),
});

export const DiscordInfoResponseSchema = ApiResponseSchema(UserInfoSchema);

export const QsverseInfoSchema = z.object({
  dids: z.array(z.string()),
});

export const QsverseInfoResponseSchema = ApiResponseSchema(QsverseInfoSchema);

export type DiscordUserInfo = z.infer<typeof UserInfoSchema>;
export type DiscordInfoResponse = z.infer<typeof DiscordInfoResponseSchema>;

export type QsverseInfo = z.infer<typeof QsverseInfoSchema>;
export type QsverseInfoResponse = z.infer<typeof QsverseInfoResponseSchema>;
