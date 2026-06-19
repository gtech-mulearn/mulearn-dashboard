// src/api/client.ts
// Client-side API gateways — mirrors the old repo's publicGateway / privateGateway pattern.
// ─────────────────────────────────────────────────────────────────────────────
// publicApiClient  → no auth, for unauthenticated endpoints
// apiClient        → attaches Bearer token, handles token expiry / redirect
// ─────────────────────────────────────────────────────────────────────────────
//
// All browser traffic is routed through the same-origin BFF proxy at
// /api/backend. The proxy reads the HttpOnly accessToken cookie server-side
// and injects the Authorization header — the browser never touches the token.

import type { z } from "zod";
import { authStore } from "../lib/auth";
import { ApiError, extractDjangoMessage, logSchemaMismatch } from "./errors";

// Re-export so existing `import { ApiError } from "@/api/client"` still works.
export { ApiError } from "./errors";

// ─── Headers ────────────────────────────────────────────────────────────────

const BASE_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
};

// ─── Request options ────────────────────────────────────────────────────────

interface RequestOptions<T> {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  schema?: z.ZodSchema<T>;
  headers?: HeadersInit;
  responseType?: "json" | "blob";
  /** When true, sends body as FormData (no JSON.stringify, no Content-Type header) */
  isFormData?: boolean;
  /**
   * When true, a 403 response is thrown as ApiError instead of triggering the
   * global token-refresh → logout flow. Use for endpoints where 403 means
   * "resource not available to this user" (e.g. mentor persona not configured),
   * not "invalid credentials".
   */
  skipAuthRedirectOn403?: boolean;
  /**
   * When true, a Zod schema-parse failure throws an `ApiError` instead of
   * returning the unvalidated raw payload. Default is lenient (returns raw,
   * but the mismatch is always logged). Opt in for endpoints where a malformed
   * response should fail loudly rather than flow through as an unchecked cast.
   */
  strictSchema?: boolean;
}

type ClientOptions = {
  headers?: HeadersInit;
  responseType?: "json" | "blob";
  /** When true, sends body as FormData (no JSON.stringify, no Content-Type header) */
  isFormData?: boolean;
  /** See RequestOptions.skipAuthRedirectOn403 */
  skipAuthRedirectOn403?: boolean;
  /** See RequestOptions.strictSchema */
  strictSchema?: boolean;
};

// ─── Core request fn (shared by both gateways) ─────────────────────────────

async function request<T>(
  endpoint: string,
  options: RequestOptions<T> & { authenticated: boolean },
): Promise<T> {
  const isFormData = options.isFormData === true;

  const requestHeaders: Record<string, string> = isFormData
    ? {}
    : { ...BASE_HEADERS };

  const res = await fetch(`/api/backend${endpoint}`, {
    method: options.method,
    headers: {
      ...requestHeaders,
      ...options.headers,
    },
    body: isFormData
      ? (options.body as FormData)
      : options.body
        ? JSON.stringify(options.body)
        : undefined,
  });

  if (options.responseType === "blob") {
    if (res.ok) {
      return (await res.blob()) as T;
    }

    const errData = await res.json().catch(() => null);

    // 401 from proxy means refresh already failed — session is dead
    if (options.authenticated && res.status === 401) {
      await authStore.clearTokens();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new ApiError(401, "Session expired", errData);
    }

    throw new ApiError(
      res.status,
      extractDjangoMessage(errData) || `Request failed: ${endpoint}`,
      errData,
    );
  }

  const rawData = await res.json().catch(() => null);

  // 401 from proxy means refresh already failed — clear and redirect
  if (options.authenticated && res.status === 401) {
    await authStore.clearTokens();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new ApiError(401, "Session expired", rawData);
  }

  // Permission 403 with skipAuthRedirectOn403 — throw as normal error
  if (res.status === 403 && options.skipAuthRedirectOn403) {
    const backendMsg = extractDjangoMessage(rawData);
    throw new ApiError(403, backendMsg || "Forbidden", rawData);
  }

  // Check for hasError even if res.ok is true (business error)
  if (
    rawData &&
    typeof rawData === "object" &&
    "hasError" in rawData &&
    rawData.hasError === true
  ) {
    const backendMsg = extractDjangoMessage(rawData);
    const error = new ApiError(
      res.status,
      backendMsg || `Request failed: ${endpoint}`,
      rawData,
    );
    if (process.env.NODE_ENV === "development") {
      console.error(
        `[API Client] Business error: [Status ${res.status}] ${endpoint}\nMessage: ${backendMsg}`,
        rawData,
      );
    }
    throw error;
  }

  if (!res.ok) {
    const backendMsg = extractDjangoMessage(rawData);
    const error = new ApiError(
      res.status,
      backendMsg || `Request failed: ${endpoint}`,
      rawData,
    );
    if (process.env.NODE_ENV === "development") {
      console.error(
        `[API Client] HTTP error: [Status ${res.status}] ${endpoint}\nMessage: ${backendMsg}`,
        rawData,
      );
    }
    throw error;
  }

  if (options.schema) {
    const parsed = options.schema.safeParse(rawData);
    if (!parsed.success) {
      logSchemaMismatch(endpoint, parsed.error.issues);
      if (options.strictSchema) {
        throw new ApiError(
          res.status,
          `Schema validation failed: ${endpoint}`,
          rawData,
        );
      }
      return rawData as T;
    }
    return parsed.data;
  }

  // Unwrap Django response wrapper
  const data =
    rawData && typeof rawData === "object" && "response" in rawData
      ? rawData.response
      : rawData;

  return data as T;
}

// ─── Gateway factory ────────────────────────────────────────────────────────

function createGateway(authenticated: boolean) {
  return {
    get: <T>(
      endpoint: string,
      schema?: z.ZodSchema<T>,
      options?: ClientOptions,
    ) =>
      request<T>(endpoint, {
        method: "GET",
        schema,
        authenticated,
        ...options,
      }),

    post: <T>(
      endpoint: string,
      body: unknown,
      schema?: z.ZodSchema<T>,
      options?: ClientOptions,
    ) =>
      request<T>(endpoint, {
        method: "POST",
        body,
        schema,
        authenticated,
        ...options,
      }),

    put: <T>(
      endpoint: string,
      body: unknown,
      schema?: z.ZodSchema<T>,
      options?: ClientOptions,
    ) =>
      request<T>(endpoint, {
        method: "PUT",
        body,
        schema,
        authenticated,
        ...options,
      }),

    patch: <T>(
      endpoint: string,
      body: unknown,
      schema?: z.ZodSchema<T>,
      options?: ClientOptions,
    ) =>
      request<T>(endpoint, {
        method: "PATCH",
        body,
        schema,
        authenticated,
        ...options,
      }),

    delete: <T>(
      endpoint: string,
      body?: unknown,
      schema?: z.ZodSchema<T>,
      options?: ClientOptions,
    ) =>
      request<T>(endpoint, {
        method: "DELETE",
        body,
        schema,
        authenticated,
        ...options,
      }),
  };
}

// ─── Exports ────────────────────────────────────────────────────────────────

/** Public gateway — no auth header, no token expiry handling */
export const publicApiClient = createGateway(false);

/** Private gateway — attaches Bearer token, handles token expiry + redirect */
export const apiClient = createGateway(true);
