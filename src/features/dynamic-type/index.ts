/**
 * Dynamic Type Feature
 *
 * 📍 src/features/dynamic-type/index.ts
 *
 * Public API for the dynamic-type admin feature.
 */

// ── API Functions ──────────────────────────────────────────────────────────
export {
  createDynamicRole,
  createDynamicUser,
  deleteDynamicRole,
  deleteDynamicUser,
  fetchDynamicRoles,
  fetchDynamicUsers,
  fetchRoles,
  fetchTypes,
  updateDynamicRole,
  updateDynamicUser,
} from "./api";

// ── Components ─────────────────────────────────────────────────────────────
export {
  DynamicRoleTable,
  DynamicTypeFormDialog,
  DynamicTypePage,
  DynamicUserTable,
} from "./components";

// ── Hooks ──────────────────────────────────────────────────────────────────
export {
  dynamicTypeKeys,
  useCreateDynamicRole,
  useCreateDynamicUser,
  useDeleteDynamicRole,
  useDeleteDynamicUser,
  useDynamicRoles,
  useDynamicUsers,
  useRoleOptions,
  useTypeOptions,
  useUpdateDynamicRole,
  useUpdateDynamicUser,
} from "./hooks";

// ── Types ──────────────────────────────────────────────────────────────────
export type {
  CreateDynamicRoleRequest,
  CreateDynamicUserRequest,
  DynamicRoleItem,
  DynamicTypeTab,
  DynamicUserItem,
  FormDialogMode,
  PaginationParams,
  RoleOption,
  SelectOption,
  TypeOption,
  UpdateDynamicRoleRequest,
  UpdateDynamicUserRequest,
} from "./types";
