/**
 * Dynamic Type Schemas
 *
 * 📍 src/features/dynamic-type/schemas/dynamic-type.schema.ts
 *
 * Zod schemas for Dynamic Type management feature.
 * Raw API responses are nested; flattened shapes are derived via
 * flattenDynamicRoles() / flattenDynamicUsers() utilities.
 */

import { z } from "zod";

// ============================================
// Generic API Response Wrapper
//
// The real Django API returns { data: [...], pagination: {...} }
// NOT { response: [...] }. All fields are optional so that minor
// differences between endpoints do NOT cause schema mismatches.
// Real payload validation is done only on `data` (or `response`
// for legacy endpoints).
// ============================================

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z
    .object({
      hasError: z.boolean().optional(),
      statusCode: z.number().optional(),
      message: z.unknown().optional(),
      // Real API uses `data`; some legacy endpoints use `response`
      data: dataSchema.optional(),
      response: dataSchema.optional(),
      pagination: z.unknown().optional(),
    })
    .passthrough();

export const EmptyResponseSchema = z
  .object({
    hasError: z.boolean().optional(),
    statusCode: z.number().optional(),
    message: z.unknown().optional(),
    data: z.unknown().optional(),
    response: z.unknown().optional(),
    pagination: z.unknown().optional(),
  })
  .passthrough();

// ============================================
// SELECT OPTION SCHEMAS (Lookups)
// ============================================

/** Raw role object from /dynamic-management/roles/ */
export const RoleOptionSchema = z.object({
  id: z.string(),
  title: z.string(),
});
export type RoleOption = z.infer<typeof RoleOptionSchema>;

/** The API returns an array of role objects */
export const RolesResponseSchema = ApiResponseSchema(z.array(RoleOptionSchema));

/** Types are returned as an array of plain strings */
export const TypeOptionSchema = z.string();
export type TypeOption = string;

export const TypesResponseSchema = ApiResponseSchema(z.array(TypeOptionSchema));

// ============================================
// RAW API RESPONSE SCHEMAS (Nested)
// ============================================

/** A single role entry nested inside a type group */
const NestedRoleEntrySchema = z.object({
  id: z.string(),
  role: z.string(),
});

/** Raw API row: { type, roles: [{ id, role }] } */
export const DynamicRolesGroupSchema = z.object({
  type: z.string(),
  roles: z.array(NestedRoleEntrySchema),
});
export type DynamicRolesGroup = z.infer<typeof DynamicRolesGroupSchema>;

/** Full raw response for dynamic-role list */
export const DynamicRolesResponseSchema = ApiResponseSchema(
  z.array(DynamicRolesGroupSchema),
);

/** A single user entry nested inside a type group */
const NestedUserEntrySchema = z.object({
  dynamic_user_id: z.string(),
  full_name: z.string(),
  email: z.string(),
  muid: z.string(),
});

/** Raw API row: { type, users: [{ dynamic_user_id, full_name, email, muid }] } */
export const DynamicUsersGroupSchema = z.object({
  type: z.string(),
  users: z.array(NestedUserEntrySchema),
});
export type DynamicUsersGroup = z.infer<typeof DynamicUsersGroupSchema>;

/** Full raw response for dynamic-user list */
export const DynamicUsersResponseSchema = ApiResponseSchema(
  z.array(DynamicUsersGroupSchema),
);

// ============================================
// FLATTENED ROW SCHEMAS (For table display)
// ============================================

/** Flattened row for Dynamic Role table */
export const DynamicRoleItemSchema = z.object({
  id: z.string(),
  type: z.string(),
  role: z.string(),
});
export type DynamicRoleItem = z.infer<typeof DynamicRoleItemSchema>;

/** Flattened row for Dynamic User table */
export const DynamicUserItemSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string(),
  email: z.string(),
  muid: z.string(),
});
export type DynamicUserItem = z.infer<typeof DynamicUserItemSchema>;

// ============================================
// FLATTEN UTILITIES (schema-layer transforms)
// ============================================

/**
 * Flatten nested dynamic-roles API response into flat rows for the table.
 * Each type group produces one row per role inside it.
 */
export function flattenDynamicRoles(
  groups: DynamicRolesGroup[],
): DynamicRoleItem[] {
  return groups.flatMap((group) =>
    group.roles.map((entry) => ({
      id: entry.id,
      type: group.type,
      role: entry.role,
    })),
  );
}

/**
 * Flatten nested dynamic-users API response into flat rows for the table.
 * Each type group produces one row per user inside it.
 */
export function flattenDynamicUsers(
  groups: DynamicUsersGroup[],
): DynamicUserItem[] {
  return groups.flatMap((group) =>
    group.users.map((entry) => ({
      id: entry.dynamic_user_id,
      type: group.type,
      name: entry.full_name,
      email: entry.email,
      muid: entry.muid,
    })),
  );
}

// ============================================
// REQUEST SCHEMAS (Form validation)
// ============================================

export const CreateDynamicRoleRequestSchema = z.object({
  type: z.string().min(1, "Type is required"),
  role: z.string().min(1, "Role is required"),
});
export type CreateDynamicRoleRequest = z.infer<
  typeof CreateDynamicRoleRequestSchema
>;

export const CreateDynamicUserRequestSchema = z.object({
  type: z.string().min(1, "Type is required"),
  user: z.string().min(1, "User (MUID or email) is required"),
});
export type CreateDynamicUserRequest = z.infer<
  typeof CreateDynamicUserRequestSchema
>;

export const UpdateDynamicRoleRequestSchema = z.object({
  new_role: z.string().min(1, "Role is required"),
});
export type UpdateDynamicRoleRequest = z.infer<
  typeof UpdateDynamicRoleRequestSchema
>;

export const UpdateDynamicUserRequestSchema = z.object({
  new_user: z.string().min(1, "User (MUID or email) is required"),
});
export type UpdateDynamicUserRequest = z.infer<
  typeof UpdateDynamicUserRequestSchema
>;
