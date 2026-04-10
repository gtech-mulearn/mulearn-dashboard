// src/api/client.ts
// Client-side API gateways — mirrors the old repo's publicGateway / privateGateway pattern.
// ─────────────────────────────────────────────────────────────────────────────
// publicApiClient  → no auth, for unauthenticated endpoints
// apiClient        → attaches Bearer token, handles token expiry / redirect
// ─────────────────────────────────────────────────────────────────────────────

import type { z } from "zod";
import { refreshAccessToken } from "@/features/auth";
import { env } from "../../config/env";
import { authStore } from "../lib/auth";
import { ApiError, extractDjangoMessage } from "./errors";

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

// ─── Token expiry detection ─────────────────────────────────────────────────

function handleTokenExpiry(rawData: unknown): void {
  if (typeof window === "undefined") return;

  if (
    rawData &&
    typeof rawData === "object" &&
    "hasError" in rawData &&
    "statusCode" in rawData
  ) {
    const data = rawData as {
      hasError: boolean;
      statusCode: number;
      message?: { general?: string[] };
    };

    if (
      data.statusCode === 1000 ||
      data.message?.general?.some(
        (msg) =>
          msg.toLowerCase().includes("token expired") ||
          msg.toLowerCase().includes("token invalid") ||
          msg.toLowerCase().includes("invalid token"),
      )
    ) {
      authStore.clearTokens();
      window.location.href = "/login";
    }
  }
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
}

type ClientOptions = {
  headers?: HeadersInit;
  responseType?: "json" | "blob";
  /** When true, sends body as FormData (no JSON.stringify, no Content-Type header) */
  isFormData?: boolean;
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
    return (await res.blob()) as T;
  }

  const rawData = await res.json().catch(() => null);

  if (options.authenticated) {
    handleTokenExpiry(rawData);

    if (res.status === 401 || res.status === 403) {
      const refreshToken = authStore.getRefreshToken();

      if (!refreshToken) {
        authStore.clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        throw new ApiError(
          res.status,
          "Unauthorized - redirecting to login",
          rawData,
        );
      }

      try {
        const newToken = await refreshAccessToken(refreshToken);
        const newAccessToken = newToken.accessToken;

        if (!newAccessToken) {
          authStore.clearTokens();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          throw new ApiError(
            res.status,
            "Token refresh failed - no new token",
            null,
          );
        }

        authStore.setTokens(newAccessToken, refreshToken);

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

        if (retryRes.status === 401 || retryRes.status === 403) {
          authStore.clearTokens();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          throw new ApiError(retryRes.status, "Retry failed", null);
        }

        const retryData = await retryRes.json().catch(() => null);

        if (options.schema) {
          const parsed = options.schema.safeParse(retryData);
          if (!parsed.success) {
            console.error(
              `⚠️ API schema mismatch [${endpoint}]`,
              parsed.error.issues,
            );
            return retryData as T;
          }
          return parsed.data;
        }
        return retryData?.response ?? (retryData as T);
      } catch {
        authStore.clearTokens();
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
    console.error("[API Client] Business error:", {
      endpoint,
      status: res.status,
      message: backendMsg,
      rawData,
      error,
    });
    throw error;
  }

  if (!res.ok) {
    const backendMsg = extractDjangoMessage(rawData);
    const error = new ApiError(
      res.status,
      backendMsg || `Request failed: ${endpoint}`,
      rawData,
    );
    console.error("[API Client] HTTP error:", {
      endpoint,
      status: res.status,
      statusText: res.statusText,
      message: backendMsg,
      rawData,
      error,
    });
    throw error;
  }

  if (options.schema) {
    const parsed = options.schema.safeParse(rawData);
    if (!parsed.success) {
      console.error(`⚠️ API schema mismatch [${endpoint}]`, parsed.error.issues);
      // Return raw data preserving the full envelope shape.
      // Schemas are defensive — a mismatch should not crash the UI.
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
