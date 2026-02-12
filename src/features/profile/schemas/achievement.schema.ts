/**
 * Achievement Schemas
 *
 * 📍 src/features/profile/schemas/achievement.schema.ts
 *
 * Zod schemas for achievements and Verifiable Credentials.
 */

import { z } from "zod";
import { ApiResponseSchema } from "./profile.schema";

// ============================================
// Achievement Schemas
// ============================================

/** Achievement definition - matches AchievementBasicSerializer */
export const AchievementSchema = z.object({
  id: z.string(),
  achievement_name: z.string(),
  description: z.string().nullable(),
  icon: z.string().nullable(),
  level_id: z.string().nullable(),
  tags: z.array(z.string()).default([]),
  template_id: z.string().nullable(),
});

export type Achievement = z.infer<typeof AchievementSchema>;

/** User's earned achievement - matches UserAchievementsSerializer */
export const UserAchievementSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  achievement: AchievementSchema,
  is_issued: z.boolean().default(false),
  vc_url: z.string().nullable(),
});

export type UserAchievement = z.infer<typeof UserAchievementSchema>;

/** Achievements list response */
export const UserAchievementsDataSchema = z.array(UserAchievementSchema);
export type UserAchievementsData = z.infer<typeof UserAchievementsDataSchema>;

export const UserAchievementsResponseSchema = ApiResponseSchema(
  UserAchievementsDataSchema,
);

// ============================================
// VC Issuance Schemas
// ============================================

/** Subject info for VC issuance */
export const VCSubjectInfoSchema = z.object({
  type: z.enum(["Badge", "Certificate", "Recognition"]),
  did: z.string(),
  name: z.string(),
  email: z.string().optional(),
});

export type VCSubjectInfo = z.infer<typeof VCSubjectInfoSchema>;

/** Credential info for VC issuance */
export const VCCredentialInfoSchema = z.object({
  course_name: z.string(),
  name: z.string(),
  tags: z.array(z.string()),
  description: z.string(),
});

export type VCCredentialInfo = z.infer<typeof VCCredentialInfoSchema>;

/** VC issuance request */
export const IssueVCRequestSchema = z.object({
  subject_info: VCSubjectInfoSchema,
  credential_info: VCCredentialInfoSchema,
  template_id: z.string(),
  send_email: z.boolean().default(true),
});

export type IssueVCRequest = z.infer<typeof IssueVCRequestSchema>;

/** Issued VC response */
export const IssuedVCSchema = z.object({
  message: z.string(), // S3 URL / QR image
  subject_info: z.object({
    completed_date: z.string().optional(),
    course_name: z.string(),
    credential_id: z.string(),
    credential_type: z.enum(["Badge", "Certificate", "Recognition"]),
    description: z.string().optional(),
    did: z.string(),
    email: z.string().optional(),
    full_name: z.string(),
    s3_url: z.string(),
    template_id: z.string(),
    type: z.enum(["Badge", "Certificate", "Recognition"]),
  }),
});

export type IssuedVC = z.infer<typeof IssuedVCSchema>;

export const IssuedVCResponseSchema = ApiResponseSchema(
  z.array(IssuedVCSchema),
);

// ============================================
// Connected DIDs Schema
// ============================================

export const ConnectedDIDsDataSchema = z.object({
  dids: z.array(z.string()),
});

export type ConnectedDIDsData = z.infer<typeof ConnectedDIDsDataSchema>;

export const ConnectedDIDsResponseSchema = ApiResponseSchema(
  ConnectedDIDsDataSchema,
);
