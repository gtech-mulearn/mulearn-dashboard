/**
 * Dynamic Type — TypeScript types
 *
 * 📍 src/features/dynamic-type/types/dynamic-type.type.ts
 *
 * Re-exports inferred Zod types for use across the feature.
 */

// All types come from Zod schema inference — no duplication.
export type {
  CreateDynamicRoleRequest,
  CreateDynamicUserRequest,
  DynamicRoleItem,
  DynamicRolesGroup,
  DynamicUserItem,
  DynamicUsersGroup,
  RoleOption,
  TypeOption,
  UpdateDynamicRoleRequest,
  UpdateDynamicUserRequest,
} from "../schemas";

/** Pagination params passed to query hooks */
export interface PaginationParams {
  page: number;
  perPage: number;
  search?: string;
  sortBy?: string;
}

/** A select option shape used in shadcn Select */
export interface SelectOption {
  value: string;
  label: string;
}

/** Which tab is currently active */
export type DynamicTypeTab = "role" | "user";

/** Mode of the form dialog */
export type FormDialogMode = "create" | "edit";
