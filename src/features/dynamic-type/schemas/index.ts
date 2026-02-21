/**
 * Dynamic Type Schemas Index
 *
 * 📍 src/features/dynamic-type/schemas/index.ts
 */

export {
  // Response schemas
  RoleOptionSchema,
  RolesResponseSchema,
  TypesResponseSchema,
  DynamicRolesGroupSchema,
  DynamicRolesResponseSchema,
  DynamicUsersGroupSchema,
  DynamicUsersResponseSchema,
  EmptyResponseSchema,
  // Flatten utilities
  flattenDynamicRoles,
  flattenDynamicUsers,
  // Request schemas
  CreateDynamicRoleRequestSchema,
  CreateDynamicUserRequestSchema,
  UpdateDynamicRoleRequestSchema,
  UpdateDynamicUserRequestSchema,
} from "./dynamic-type.schema";

export type {
  RoleOption,
  TypeOption,
  DynamicRolesGroup,
  DynamicUsersGroup,
  DynamicRoleItem,
  DynamicUserItem,
  CreateDynamicRoleRequest,
  CreateDynamicUserRequest,
  UpdateDynamicRoleRequest,
  UpdateDynamicUserRequest,
} from "./dynamic-type.schema";
