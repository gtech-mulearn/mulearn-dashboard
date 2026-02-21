/**
 * Dynamic Type API Functions
 *
 * 📍 src/features/dynamic-type/api/dynamic-type.api.ts
 *
 * Fetch functions do NOT pass a schema to apiClient for GET calls.
 * The apiClient will auto-extract `rawData.response` (or return rawData
 * directly), then we validate only the inner payload with Zod.
 * This makes us immune to variations in the Django outer wrapper structure.
 */

import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { z } from "zod";
import type {
  DynamicRolesGroup,
  DynamicUsersGroup,
  RoleOption,
  TypeOption,
} from "../schemas";
import {
  DynamicRolesGroupSchema,
  DynamicUsersGroupSchema,
  EmptyResponseSchema,
  RoleOptionSchema,
} from "../schemas";

// ============================================
// Helper: extract + validate inner payload
// ============================================

/**
 * Tries to parse `data` against `innerSchema` using three strategies:
 *   1. Direct parse  → apiClient already unwrapped to the payload
 *   2. data.data     → real API wraps in { data: [...], pagination: {...} }
 *   3. data.response → legacy wrapper some endpoints may still use
 *
 * Throws a descriptive error if all three fail so TanStack Query
 * surfaces it visibly in the UI error state.
 */
function extractAndValidate<T>(raw: unknown, innerSchema: z.ZodType<T>): T {
  // 1. Direct parse – apiClient already gave us the inner payload
  const direct = innerSchema.safeParse(raw);
  if (direct.success) return direct.data;

  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;

    // 2. { data: [...], pagination: {...} } — real API shape
    if ("data" in obj) {
      const fromData = innerSchema.safeParse(obj.data);
      if (fromData.success) return fromData.data;
    }

    // 3. { response: [...] } — legacy Django wrapper
    if ("response" in obj) {
      const fromResponse = innerSchema.safeParse(obj.response);
      if (fromResponse.success) return fromResponse.data;
    }
  }

  // All strategies exhausted — log details and throw
  console.error("❌ Dynamic-type inner schema mismatch", {
    received: raw,
    directError: direct.error?.format(),
  });
  throw new Error(
    "Unexpected API response shape from dynamic-management endpoint",
  );
}

// ============================================
// Lookups (for Select dropdowns)
// ============================================

/** Fetch roles available for the type-role dropdown. */
export async function fetchRoles(): Promise<RoleOption[]> {
  // No schema → apiClient auto-extracts .response
  const data = await apiClient.get(endpoints.admin.dynamicType.roles);
  return extractAndValidate(data, z.array(RoleOptionSchema));
}

/** Fetch types (plain strings) available for the type dropdown. */
export async function fetchTypes(): Promise<TypeOption[]> {
  const data = await apiClient.get(endpoints.admin.dynamicType.types);
  return extractAndValidate(data, z.array(z.string()));
}

// ============================================
// Dynamic Role-Type CRUD
// ============================================

/** Fetch all dynamic role-type mappings (nested by type). */
export async function fetchDynamicRoles(): Promise<DynamicRolesGroup[]> {
  const data = await apiClient.get(endpoints.admin.dynamicType.dynamicRoles);
  return extractAndValidate(data, z.array(DynamicRolesGroupSchema));
}

/** Create a new dynamic role-type mapping. */
export async function createDynamicRole(data: {
  type: string;
  role: string;
}): Promise<void> {
  await apiClient.post(
    endpoints.admin.dynamicType.createDynamicRole,
    data,
    EmptyResponseSchema,
  );
}

/** Update an existing dynamic role-type mapping. */
export async function updateDynamicRole(
  id: string,
  data: { new_role: string },
): Promise<void> {
  await apiClient.patch(
    endpoints.admin.dynamicType.updateDynamicRole(id),
    data,
    EmptyResponseSchema,
  );
}

/** Delete a dynamic role-type mapping. */
export async function deleteDynamicRole(id: string): Promise<void> {
  await apiClient.delete(
    endpoints.admin.dynamicType.deleteDynamicRole(id),
    EmptyResponseSchema,
  );
}

// ============================================
// Dynamic User-Type CRUD
// ============================================

/** Fetch all dynamic user-type mappings (nested by type). */
export async function fetchDynamicUsers(): Promise<DynamicUsersGroup[]> {
  const data = await apiClient.get(endpoints.admin.dynamicType.dynamicUsers);
  return extractAndValidate(data, z.array(DynamicUsersGroupSchema));
}

/** Create a new dynamic user-type mapping. user = muid or email. */
export async function createDynamicUser(data: {
  type: string;
  user: string;
}): Promise<void> {
  await apiClient.post(
    endpoints.admin.dynamicType.createDynamicUser,
    data,
    EmptyResponseSchema,
  );
}

/** Update an existing dynamic user-type mapping. new_user = muid or email. */
export async function updateDynamicUser(
  id: string,
  data: { new_user: string },
): Promise<void> {
  await apiClient.patch(
    endpoints.admin.dynamicType.updateDynamicUser(id),
    data,
    EmptyResponseSchema,
  );
}

/** Delete a dynamic user-type mapping. */
export async function deleteDynamicUser(id: string): Promise<void> {
  await apiClient.delete(
    endpoints.admin.dynamicType.deleteDynamicUser(id),
    EmptyResponseSchema,
  );
}
