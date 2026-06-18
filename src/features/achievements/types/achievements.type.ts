// All types are inferred from Zod schemas in achievements.schema.ts
// Import from here to get full type safety without separate interface definitions.

export type {
  Achievement,
  AchievementFormValues,
  AchievementRule,
  AuditLog,
  CreateAchievementRequest,
  CreateRuleRequest,
  IssuedLog,
  ManualIssueRequest,
  PaginatedIssuedLog,
  RevokeRequest,
  SimulationResult,
  UpdateAchievementRequest,
} from "../schemas/achievements.schema";
export {
  AchievementFormSchema,
  AchievementListResponseSchema,
  AchievementResponseSchema,
  AchievementRuleListResponseSchema,
  AchievementRuleResponseSchema,
  AchievementRuleSchema,
  AchievementSchema,
  AuditLogListResponseSchema,
  AuditLogSchema,
  CreateAchievementRequestSchema,
  CreateRuleRequestSchema,
  DjangoResponseSchema,
  GenericSuccessResponseSchema,
  IssuedLogListResponseSchema,
  IssuedLogSchema,
  ManualIssueRequestSchema,
  PaginatedIssuedLogSchema,
  RevokeRequestSchema,
  SimulationListResponseSchema,
  SimulationResultSchema,
  UpdateAchievementRequestSchema,
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
