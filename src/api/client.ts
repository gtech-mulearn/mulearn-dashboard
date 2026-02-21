// src/api/client.ts
// Client-side API gateways — mirrors the old repo's publicGateway / privateGateway pattern.
// ─────────────────────────────────────────────────────────────────────────────
// publicApiClient  → no auth, for unauthenticated endpoints
// apiClient        → attaches Bearer token, handles token expiry / redirect
// ─────────────────────────────────────────────────────────────────────────────

import type { z } from "zod";
import { env } from "../../config/env";
import { authStore } from "../lib/auth";

// ─── Errors ─────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: unknown,
  ) {
    super(message);
  }
}

/**
 * Extract a human-readable error message from Django's standard error envelope.
 *
 * Handles:
 *  - `{ message: { general: ["..."] } }`  (most common)
 *  - `{ detail: "..." }`                  (DRF style)
 */
function extractDjangoMessage(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  const msg = d.message;
  if (msg && typeof msg === "object") {
    const general = (msg as Record<string, unknown>).general;
    if (Array.isArray(general) && typeof general[0] === "string") {
      return general[0];
    }
  }

  // DRF fallback → detail
  if (typeof d.detail === "string") return d.detail;

  return null;
}

// ─── Headers ────────────────────────────────────────────────────────────────

const BASE_HEADERS: Record<string, string> = {
  "Content-Type": "application/json;",
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
}

type ClientOptions = {
  headers?: HeadersInit;
  responseType?: "json" | "blob";
};

// ─── Core request fn (shared by both gateways) ─────────────────────────────

async function request<T>(
  endpoint: string,
  options: RequestOptions<T> & { authenticated: boolean },
): Promise<T> {
  const res = await fetch(`${env.NEXT_PUBLIC_DJANGO_API_URL}${endpoint}`, {
    method: options.method,
    headers: {
      ...(options.authenticated ? getAuthHeaders() : BASE_HEADERS),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (options.responseType === "blob") {
    return (await res.blob()) as T;
  }

  const rawData = await res.json().catch(() => null);

  // Token expiry handling only for authenticated calls
  if (options.authenticated) {
    handleTokenExpiry(rawData);

    if (res.status === 401 || res.status === 403) {
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
      console.error("❌ API schema mismatch", {
        endpoint,
        errors: parsed.error.format(),
        rawData,
      });
      throw new Error("Invalid API response");
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
      schema?: z.ZodSchema<T>,
      options?: ClientOptions,
    ) =>
      request<T>(endpoint, {
        method: "DELETE",
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
