import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { env } from "../../../../config/env";
import { authStore } from "@/lib/auth";
import {
  type Role,
  type RoleFormValues,
  type RoleListData,
  type RoleUser,
  type BulkImportResult,
  GenericMutationResponseSchema,
  RoleListResponseSchema,
  RoleUserFlexibleResponseSchema,
} from "../schemas";

interface FetchRolesParams {
  pageIndex: number;
  perPage: number;
  search?: string;
  sortBy?: string;
}

// ─── Roles CRUD ───────────────────────────────────────────────────────────────

export async function fetchRoles(
  params: FetchRolesParams,
): Promise<RoleListData> {
  const query = new URLSearchParams({
    perPage: String(params.perPage),
    pageIndex: String(params.pageIndex),
  });
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.sortBy?.trim()) query.set("sortBy", params.sortBy.trim());

  const response = await apiClient.get(
    `${endpoints.manageRoles.list}?${query.toString()}`,
    RoleListResponseSchema,
  );
  return response.response;
}

export async function createRole(payload: RoleFormValues): Promise<void> {
  await apiClient.post(
    endpoints.manageRoles.create,
    payload,
    GenericMutationResponseSchema,
  );
}

export async function updateRole(
  id: string,
  payload: RoleFormValues,
): Promise<void> {
  await apiClient.patch(
    endpoints.manageRoles.update(id),
    payload,
    GenericMutationResponseSchema,
  );
}

export async function deleteRole(id: string): Promise<void> {
  await apiClient.delete(
    endpoints.manageRoles.delete(id),
    GenericMutationResponseSchema,
  );
}

// ─── CSV download ─────────────────────────────────────────────────────────────

export async function downloadRolesCsvBlob(): Promise<void> {
  const blob = await apiClient.get<Blob>(endpoints.manageRoles.csv, undefined, {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "roles.csv";

  document.body.appendChild(a);
  a.click();
  a.remove();

  window.URL.revokeObjectURL(url);
}

// ─── User-Role (single assign / remove) ──────────────────────────────────────

/** Safely extract a RoleUser[] from either a plain array or paginated wrapper */
function extractUserArray(data: RoleUser[] | { data: RoleUser[] }): RoleUser[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && "data" in data)
    return (data as { data: RoleUser[] }).data;
  return [];
}

export async function fetchUsersByRole(
  roleId: string,
  search?: string,
): Promise<RoleUser[]> {
  const url = search?.trim()
    ? `${endpoints.manageRoles.userRoleSearch(roleId)}?search=${encodeURIComponent(search.trim())}`
    : endpoints.manageRoles.userRoleSearch(roleId);

  const response = await apiClient.get(url, RoleUserFlexibleResponseSchema);
  return extractUserArray(response.response);
}

export async function assignUserRole(payload: {
  user_id: string;
  role_id: string;
}): Promise<void> {
  await apiClient.post(
    endpoints.manageRoles.userRole,
    payload,
    GenericMutationResponseSchema,
  );
}

export async function removeUserRole(payload: {
  user_id: string;
  role_id: string;
}): Promise<void> {
  await apiClient.delete(
    endpoints.manageRoles.userRole,
    payload,
    GenericMutationResponseSchema,
  );
}

// ─── Bulk assign / remove ─────────────────────────────────────────────────────

export async function fetchBulkRoleUsers(roleId: string): Promise<RoleUser[]> {
  const response = await apiClient.get(
    endpoints.manageRoles.bulkAssign(roleId),
    RoleUserFlexibleResponseSchema,
  );
  return extractUserArray(response.response);
}

export async function fetchUsersWithoutRole(
  roleId: string,
): Promise<RoleUser[]> {
  const response = await apiClient.put(
    endpoints.manageRoles.bulkAssign(roleId),
    {},
    RoleUserFlexibleResponseSchema,
  );
  return extractUserArray(response.response);
}

export async function bulkAssignRole(
  roleId: string,
  users: string[],
): Promise<void> {
  await apiClient.post(
    endpoints.manageRoles.bulkAssign(roleId),
    { users },
    GenericMutationResponseSchema,
  );
}

export async function bulkRemoveRole(
  roleId: string,
  users: string[],
): Promise<void> {
  await apiClient.patch(
    endpoints.manageRoles.bulkAssign(roleId),
    { users },
    GenericMutationResponseSchema,
  );
}

// ─── Excel template + bulk import ────────────────────────────────────────────

export async function downloadBaseTemplate(): Promise<void> {
  const blob = await apiClient.get<Blob>(
    endpoints.manageRoles.baseTemplate,
    undefined,
    { responseType: "blob" },
  );

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "role-assignment-template.xlsx";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function bulkAssignFromExcel(
  file: File,
): Promise<BulkImportResult> {
  const formData = new FormData();
  formData.append("user_roles_list", file);
  const response = await apiClient.post(
    endpoints.manageRoles.bulkAssignExcel,
    formData,
    undefined,
    { isFormData: true },
  );

  // Extract the result from the response
  if (response && typeof response === "object" && "response" in response) {
    const result = (response as { response: Record<string, unknown> }).response;
    return {
      success_count:
        typeof result?.success_count === "number" ? result.success_count : 0,
      error_count:
        typeof result?.error_count === "number" ? result.error_count : 0,
      errors: Array.isArray(result?.errors) ? result.errors : [],
      message: typeof result?.message === "string" ? result.message : undefined,
    };
  }

  return {
    success_count: 0,
    error_count: 0,
    errors: [],
  };
}

// Re-export Role type for convenience
export type { Role, RoleUser };
