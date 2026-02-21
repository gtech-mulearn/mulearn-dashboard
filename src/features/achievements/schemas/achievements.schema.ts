import { z } from "zod";

// ==========================================
// Achievement Schemas
// ==========================================

export const AchievementSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  // Django may return "" (empty string) or a relative path — accept any string or null
  image_url: z.string().nullable().optional(),
  level_based: z.boolean().optional(), // missing from API
  level_id: z.string().nullable().optional(), // not always a UUID in old db
  has_vc: z.boolean().optional(),
  is_active: z.boolean().optional(), // missing from API
  // Django returns microsecond datetimes like "2024-01-15T10:30:00.123456Z"
  // z.string().datetime() can be strict; use z.string() to accept any format
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
// Rules Engine Schemas
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

// ==========================================
// Simulation Schemas
// ==========================================

export const SimulationResultSchema = z.object({
  achievement_id: z.string().uuid(),
  achievement_name: z.string(),
  eligible: z.boolean(),
  progress: z.number().min(0).max(100),
  reason: z.string().optional(),
  debug_info: z.record(z.string(), z.unknown()).optional(),
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
  user_id: z.string(),
  action: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  timestamp: z.string().optional(),
});

export type AuditLog = z.infer<typeof AuditLogSchema>;

// ==========================================
// Issued Log Schemas
// ==========================================

export const IssuedLogSchema = z.object({
  id: z.string().optional(),
  muid: z.string(),
  user_name: z.string(),
  achievement: z.string(),
  issued_by: z.string().optional(),
  issued_on: z.string().optional(),
});

export type IssuedLog = z.infer<typeof IssuedLogSchema>;

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

export const IssuedLogListResponseSchema = DjangoResponseSchema(
  z.object({
    data: z.array(IssuedLogSchema),
    pagination: z.object({
      total: z.number(),
      page: z.number(),
      perPage: z.number(),
      totalPages: z.number(),
    }),
  }),
);

export const GenericSuccessResponseSchema = DjangoResponseSchema(z.unknown());

// ==========================================
// Paginated Result Type
// ==========================================

export const PaginatedIssuedLogSchema = z.object({
  data: z.array(IssuedLogSchema),
  pagination: z.object({
    total: z.number(),
    page: z.number(),
    perPage: z.number(),
    totalPages: z.number(),
  }),
});

export type PaginatedIssuedLog = z.infer<typeof PaginatedIssuedLogSchema>;

export const AchievementFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  level_based: z.boolean(),
  level_id: z.string().nullable().optional(),
  has_vc: z.boolean(),
  is_active: z.boolean().optional(),
});

export type AchievementFormValues = z.infer<typeof AchievementFormSchema>;
