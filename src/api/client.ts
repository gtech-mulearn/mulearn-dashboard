// src/api/client.ts
// Client-side API gateways — mirrors the old repo's publicGateway / privateGateway pattern.
// ─────────────────────────────────────────────────────────────────────────────
// publicApiClient  → no auth, for unauthenticated endpoints
// apiClient        → attaches Bearer token, handles token expiry / redirect
// ─────────────────────────────────────────────────────────────────────────────

import type { z } from "zod";
import { env } from "../../config/env";
import { authStore } from "../lib/auth";
import { ApiError, extractDjangoMessage, logSchemaMismatch } from "./errors";

// Re-export so existing `import { ApiError } from "@/api/client"` still works.
export { ApiError } from "./errors";

// ─── Headers ────────────────────────────────────────────────────────────────

const BASE_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
};

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { ...BASE_HEADERS };
  const token = authStore.getAccessToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

// ─── Token refresh mutex ────────────────────────────────────────────────────

let refreshPromise: Promise<string | null> | null = null;

async function getRefreshedToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = fetch("/api/auth/refresh-token", { method: "POST" })
    .then(async (res) => {
      if (!res.ok) return null;
      const data = await res.json();
      return (data as { accessToken?: string }).accessToken ?? null;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

// ─── Token expiry detection ─────────────────────────────────────────────────

function isTokenExpiredError(rawData: unknown): boolean {
  if (
    rawData &&
    typeof rawData === "object" &&
    "hasError" in rawData &&
    "statusCode" in rawData
  ) {
    const data = rawData as {
      hasError: boolean;
      statusCode: number;
      message?: { general?: (string | Record<string, unknown>)[] };
    };

    return (
      data.statusCode === 1000 ||
      data.message?.general?.some(
        (msg) =>
          typeof msg === "string" &&
          (msg.toLowerCase().includes("token expired") ||
            msg.toLowerCase().includes("token invalid") ||
            msg.toLowerCase().includes("invalid token")),
      ) === true
    );
  }
  return false;
}

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

  // For FormData, let the browser set Content-Type (includes boundary).
  // For JSON, use the standard JSON headers.
  const baseHeaders = options.authenticated ? getAuthHeaders() : BASE_HEADERS;
  const requestHeaders: Record<string, string> = isFormData
    ? (() => {
        const h = { ...baseHeaders };
        delete h["Content-Type"];
        return h;
      })()
    : baseHeaders;

  const res = await fetch(`${env.NEXT_PUBLIC_DJANGO_API_URL}${endpoint}`, {
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

    // Non-OK blob request: for authenticated calls, attempt one token refresh +
    // retry so long-idle downloads succeed instead of saving an error body as a
    // file. On any other failure, throw a real ApiError (the caller must NOT
    // write the response to disk).
    if (options.authenticated && (res.status === 401 || res.status === 403)) {
      try {
        const newAccessToken = await getRefreshedToken();
        if (newAccessToken) {
          const retryRes = await fetch(
            `${env.NEXT_PUBLIC_DJANGO_API_URL}${endpoint}`,
            {
              method: options.method,
              headers: {
                ...requestHeaders,
                Authorization: `Bearer ${newAccessToken}`,
                ...options.headers,
              },
            },
          );
          if (retryRes.ok) {
            return (await retryRes.blob()) as T;
          }
        }
      } catch {
        // fall through to the error throw below
      }
    }

    const errData = await res.json().catch(() => null);
    throw new ApiError(
      res.status,
      extractDjangoMessage(errData) || `Request failed: ${endpoint}`,
      errData,
    );
  }

  const rawData = await res.json().catch(() => null);

  if (options.authenticated) {
    const isExpired = isTokenExpiredError(rawData);
    const is403 = res.status === 403;

    // If the caller opted out of the global 403 redirect (e.g. mentor overview
    // where 403 means "persona not configured", not "bad credentials"), throw
    // as a normal ApiError so the caller can handle it.
    if (is403 && options.skipAuthRedirectOn403) {
      const backendMsg = extractDjangoMessage(rawData);
      throw new ApiError(403, backendMsg || "Forbidden", rawData);
    }

    if (res.status === 401 || is403 || isExpired) {
      try {
        const newAccessToken = await getRefreshedToken();

        if (!newAccessToken) {
          await authStore.clearTokens();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          throw new ApiError(res.status, "Token refresh failed", null);
        }

        const retryRes = await fetch(
          `${env.NEXT_PUBLIC_DJANGO_API_URL}${endpoint}`,
          {
            method: options.method,
            headers: {
              ...requestHeaders,
              Authorization: `Bearer ${newAccessToken}`,
              ...options.headers,
            },
            body: isFormData
              ? (options.body as FormData)
              : options.body
                ? JSON.stringify(options.body)
                : undefined,
          },
        );

        const retryData = await retryRes.json().catch(() => null);

        if (
          retryRes.status === 401 ||
          retryRes.status === 403 ||
          isTokenExpiredError(retryData)
        ) {
          await authStore.clearTokens();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          throw new ApiError(
            retryRes.status,
            "Unauthorized after token refresh",
            retryData,
          );
        }

        if (options.schema) {
          const parsed = options.schema.safeParse(retryData);
          if (!parsed.success) {
            logSchemaMismatch(endpoint, parsed.error.issues);
            if (options.strictSchema) {
              throw new ApiError(
                retryRes.status,
                `Schema validation failed: ${endpoint}`,
                retryData,
              );
            }
            return retryData as T;
          }
          return parsed.data;
        }
        return retryData?.response ?? (retryData as T);
      } catch {
        await authStore.clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        throw new ApiError(
          res.status,
          "Unauthorized - redirecting to login",
          rawData,
        );
      }
    }
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
      // Lenient default: return the raw payload preserving the envelope shape.
      // Schemas are defensive — a mismatch should not crash the UI — but it IS
      // now logged unconditionally (see logSchemaMismatch).
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
