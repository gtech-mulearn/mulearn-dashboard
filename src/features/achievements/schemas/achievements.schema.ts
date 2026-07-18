import { z } from "zod";

// ==========================================
// Django API Response Wrappers
// ==========================================

export const DjangoResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    hasError: z.boolean().optional(),
    statusCode: z.number().optional(),
    response: dataSchema,
    message: z
      .union([z.string(), z.record(z.string(), z.unknown())])
      .optional(),
  });

// ==========================================
// Achievement Schemas
// ==========================================

export const AchievementSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  icon_url: z.string().nullable().optional(), // fully-resolved URL returned by the API
  level_based: z.boolean().optional(),
  level_id: z.string().nullable().optional(),
  has_vc: z.boolean().optional(),
  is_active: z.boolean().optional(),
  tags: z.array(z.string()).optional().default([]),
  type: z.string().optional().nullable(),
  template_id: z.string().optional().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Achievement = z.infer<typeof AchievementSchema>;

// ==========================================
// Create / Update Request Schemas
// ==========================================

const CreateAchievementBaseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  level_based: z.boolean(),
  level_id: z.string().uuid().optional().nullable(),
  has_vc: z.boolean(),
  is_active: z.boolean().optional().default(true),
  tags: z.string().min(1, "Tags are required"),
  type: z.string().min(1, "Type is required"),
});

export const CreateAchievementRequestSchema =
  CreateAchievementBaseSchema.refine(
    (data) => !data.level_based || (data.level_based && !!data.level_id),
    {
      message: "Level is required when level-based is enabled",
      path: ["level_id"],
    },
  );

export type CreateAchievementRequest = z.infer<
  typeof CreateAchievementRequestSchema
>;

export const UpdateAchievementRequestSchema =
  CreateAchievementBaseSchema.extend({ id: z.string().uuid() }).refine(
    (data) => !data.level_based || (data.level_based && !!data.level_id),
    {
      message: "Level is required when level-based is enabled",
      path: ["level_id"],
    },
  );

export type UpdateAchievementRequest = z.infer<
  typeof UpdateAchievementRequestSchema
>;

// ==========================================
// Rules Schemas
// ==========================================

export const AchievementRuleSchema = z.object({
  id: z.string().uuid(),
  achievement_id: z.string().uuid(),
  achievement_name: z.string().optional(),
  rule_type: z.string(),
  conditions: z.record(z.string(), z.unknown()),
  version: z.number().int(),
  is_active: z.boolean(),
  created_at: z.string().optional(), // strict .datetime() fails on DJango GMT offset
});

export type AchievementRule = z.infer<typeof AchievementRuleSchema>;

export const CreateRuleRequestSchema = z.object({
  achievement_id: z.string().uuid("Achievement is required"),
  rule_type: z.string().min(1, "Rule type is required"),
  conditions: z.record(z.string(), z.unknown()),
});

export type CreateRuleRequest = z.infer<typeof CreateRuleRequestSchema>;

export const RuleMutationResponseDataSchema = z.object({
  rule_id: z.string(),
  version: z.number(),
});

export type RuleMutationResponseData = z.infer<
  typeof RuleMutationResponseDataSchema
>;

export const RuleMutationResponseSchema = DjangoResponseSchema(
  RuleMutationResponseDataSchema,
);

// ==========================================
// Simulation Schemas
// ==========================================

export const SimulationProgressSchema = z.object({
  current: z.number().nullable().optional(),
  required: z.number().nullable().optional(),
  percentage: z.number().nullable().optional(),
  // ig_karma rule
  ig_id: z.string().nullable().optional(),
  // skill rule
  skill_id: z.string().nullable().optional(),
  // streak rule
  streak_type: z.string().nullable().optional(),
  // milestone rule
  milestone_type: z.string().nullable().optional(),
  // event rule
  event_name: z.string().nullable().optional(),
  // task_completion rule
  task_hashtag: z.string().nullable().optional(),
});

export type SimulationProgress = z.infer<typeof SimulationProgressSchema>;

export const SimulationResultSchema = z.object({
  achievement_id: z.string().uuid(),
  achievement_name: z.string(),
  eligible: z.boolean(),
  progress: SimulationProgressSchema.nullable().optional(),
  reason: z.string().nullable().optional(),
  debug_info: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type SimulationResult = z.infer<typeof SimulationResultSchema>;

// ==========================================
// Manual Issue / Revoke Schemas
// ==========================================

export const ManualIssueRequestSchema = z.object({
  muid: z.string().min(1, "MUID is required"),
  achievement_id: z.string().uuid("Achievement is required"),
});

export type ManualIssueRequest = z.infer<typeof ManualIssueRequestSchema>;

export const RevokeRequestSchema = z.object({
  muid: z.string().min(1, "MUID is required"),
  achievement_id: z.string().uuid("Achievement is required"),
  reason: z.string().optional(),
});

export type RevokeRequest = z.infer<typeof RevokeRequestSchema>;

// ==========================================
// Audit Log Schemas
// ==========================================

export const AuditLogSchema = z.object({
  id: z.string().optional(),
  user: z.string().nullable().optional(), // UUID of the affected user (per §9.1)
  achievement_id: z.string().optional(),
  achievement_name: z.string().optional(),
  action: z.string().optional(),
  rule_version: z.number().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  performed_by: z.string().nullable().optional(),
  created_at: z.string().optional(),
});

export type AuditLog = z.infer<typeof AuditLogSchema>;

// ==========================================
// User Achievement (per-user list with has_achievement flag)
// ==========================================

export const UserAchievementSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  icon_url: z.string().nullable().optional(), // fully-resolved URL returned by the API
  level_based: z.boolean().optional(),
  level_id: z.string().nullable().optional(),
  has_vc: z.boolean().optional(),
  is_active: z.boolean().optional(),
  tags: z.array(z.string()).optional().default([]),
  type: z.string().optional().nullable(),
  template_id: z.string().optional().nullable(),
  has_achievement: z.boolean().default(false),
});

export type UserAchievement = z.infer<typeof UserAchievementSchema>;

export const UserAchievementListResponseSchema = DjangoResponseSchema(
  z.array(UserAchievementSchema),
);

export const AchievementListResponseSchema = DjangoResponseSchema(
  z.array(AchievementSchema),
);

export const AchievementResponseSchema =
  DjangoResponseSchema(AchievementSchema);

export const AchievementRuleListResponseSchema = DjangoResponseSchema(
  z.array(AchievementRuleSchema),
);

export const AchievementRuleResponseSchema = DjangoResponseSchema(
  AchievementRuleSchema,
);

export const SimulationListResponseSchema = DjangoResponseSchema(
  z.array(SimulationResultSchema),
);

export const AuditLogListResponseSchema = DjangoResponseSchema(
  z.array(AuditLogSchema),
);

export const GenericSuccessResponseSchema = DjangoResponseSchema(z.unknown());

// ==========================================
// Issued Log Schemas
// ==========================================

export const IssuedLogSchema = z.object({
  id: z.string().optional(),
  muid: z.string().nullable().optional(),
  user_name: z.string().nullable().optional(),
  achievement_name: z.string().nullable().optional(),
  issued_by: z.string().nullable().optional(),
  is_issued: z.boolean().optional(),
  created_at: z.string().optional(),
});

export type IssuedLog = z.infer<typeof IssuedLogSchema>;

export const PaginatedIssuedLogSchema = z.object({
  data: z.array(IssuedLogSchema),
  pagination: z
    .object({
      count: z.number().optional().nullable(),
      totalPages: z.number().optional().nullable(),
      isNext: z.boolean().optional().nullable(),
      isPrev: z.boolean().optional().nullable(),
      nextPage: z.number().optional().nullable(),
    })
    .optional()
    .nullable(),
});

export type PaginatedIssuedLog = z.infer<typeof PaginatedIssuedLogSchema>;

export const IssuedLogListResponseSchema = DjangoResponseSchema(
  z.union([z.array(IssuedLogSchema), PaginatedIssuedLogSchema]),
);

// ==========================================
// Eligible & Progress Schemas (User-Facing)
// ==========================================

export const EligibleAchievementSchema = SimulationResultSchema;

export type EligibleAchievement = z.infer<typeof EligibleAchievementSchema>;

export const EligibleAchievementListResponseSchema = DjangoResponseSchema(
  z.array(EligibleAchievementSchema),
);

// ==========================================
// Claim Schemas
// ==========================================

export const ClaimResponseDataSchema = z.object({
  achievement_name: z.string(),
  vc_pending: z.boolean().optional().default(false),
});

export type ClaimResponseData = z.infer<typeof ClaimResponseDataSchema>;

export const ClaimResponseSchema = DjangoResponseSchema(
  ClaimResponseDataSchema,
);

// ==========================================
// Bulk Issue Response Schemas
// ==========================================

export const BulkIssueFailedRowSchema = z.object({
  row: z.number(),
  muid: z.string(),
  reason: z.string(),
});

export const BulkIssueResponseDataSchema = z.object({
  success_count: z.number(),
  failed_count: z.number(),
  failed_rows: z.array(BulkIssueFailedRowSchema).default([]),
});

export type BulkIssueResponseData = z.infer<typeof BulkIssueResponseDataSchema>;

export const BulkIssueResponseSchema = DjangoResponseSchema(
  BulkIssueResponseDataSchema,
);

// ==========================================
// Debug Response Schemas
// ==========================================

export const IgKarmaDebugSchema = z.object({
  ig_id: z.string(),
  total_karma: z.number(),
  task_count: z.number(),
});

export const StreakDebugSchema = z.object({
  streak_type: z.string(),
  current_streak: z.number(),
  longest_streak: z.number(),
});

export const SkillProgressDebugSchema = z.object({
  skill_id: z.string(),
  completed_task_count: z.number(),
  total_karma: z.number(),
});

export const DebugUserDataSchema = z.object({
  ig_karma: z.array(IgKarmaDebugSchema).default([]),
  streaks: z.array(StreakDebugSchema).default([]),
  skill_progress: z.array(SkillProgressDebugSchema).default([]),
});

export const DebugResponseDataSchema = z.object({
  evaluation: EligibleAchievementSchema,
  user_data: DebugUserDataSchema,
});

export type DebugResponseData = z.infer<typeof DebugResponseDataSchema>;
export type DebugUserData = z.infer<typeof DebugUserDataSchema>;

export const DebugResponseSchema = DjangoResponseSchema(
  DebugResponseDataSchema,
);

// ==========================================
// Issue VC Schema
// ==========================================

export const IssueVCRequestSchema = z.object({
  achievement_id: z.string().uuid("Must be a valid UUID"),
  vc_url: z.string().url("Must be a valid URL"),
});

export type IssueVCRequest = z.infer<typeof IssueVCRequestSchema>;

// ==========================================

export const AchievementFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  level_based: z.boolean(),
  level_id: z.string().nullable().optional(),
  has_vc: z.boolean(),
  is_active: z.boolean().optional(),
  tags: z.string(),
  type: z.string().min(1, "Type is required"),
  icon_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  template_id: z.string().optional(),
});

export type AchievementFormValues = z.infer<typeof AchievementFormSchema>;
