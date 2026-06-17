// All types are inferred from Zod schemas in achievements.schema.ts
// Import from here to get full type safety without separate interface definitions.

export {
  AchievementSchema,
  CreateAchievementRequestSchema,
  UpdateAchievementRequestSchema,
  AchievementRuleSchema,
  CreateRuleRequestSchema,
  SimulationResultSchema,
  ManualIssueRequestSchema,
  RevokeRequestSchema,
  AuditLogSchema,
  IssuedLogSchema,
  DjangoResponseSchema,
  AchievementListResponseSchema,
  AchievementResponseSchema,
  AchievementRuleListResponseSchema,
  AchievementRuleResponseSchema,
  SimulationListResponseSchema,
  AuditLogListResponseSchema,
  IssuedLogListResponseSchema,
  GenericSuccessResponseSchema,
  PaginatedIssuedLogSchema,
  AchievementFormSchema,
} from "../schemas/achievements.schema";
export type {
  Achievement,
  CreateAchievementRequest,
  UpdateAchievementRequest,
  AchievementRule,
  CreateRuleRequest,
  SimulationResult,
  ManualIssueRequest,
  RevokeRequest,
  AuditLog,
  IssuedLog,
  PaginatedIssuedLog,
  AchievementFormValues,
} from "../schemas/achievements.schema";

// Utility types for pagination
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}
