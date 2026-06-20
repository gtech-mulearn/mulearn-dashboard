// src/api/client.ts
// Client-side API gateways. The browser calls the Django backend DIRECTLY and
// attaches Authorization: Bearer <accessToken cookie>. Token expiry triggers a
// client-side refresh + one retry. See
// docs/superpowers/specs/2026-06-20-remove-bff-proxy-design.md.
// ─────────────────────────────────────────────────────────────────────────────
// publicApiClient  → no auth header
// apiClient        → attaches Bearer token, refreshes on expiry, redirects on fail
// authedFetch      → raw fetch with Bearer + refresh-retry (for multipart callers)
// ─────────────────────────────────────────────────────────────────────────────

import type { z } from "zod";
import { env } from "../../config/env";
import { authStore } from "../lib/auth";
import { ApiError, extractDjangoMessage, logSchemaMismatch } from "./errors";
import { refreshAccessToken } from "./refresh.client";

// Re-export so existing `import { ApiError } from "@/api/client"` still works.
export { ApiError } from "./errors";

const API_BASE = env.NEXT_PUBLIC_DJANGO_API_URL;

const BASE_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
};

/** Detect a token-expiry response (mirrors the old BFF proxy logic). */
function isTokenExpired(status: number, data: unknown): boolean {
  if (status === 401) return true;
  if (
    data &&
    typeof data === "object" &&
    "statusCode" in data &&
    (data as { statusCode: number }).statusCode === 1000
  ) {
    return true;
  }
  if (data && typeof data === "object" && "message" in data) {
    const msg = data as { message?: { general?: (string | unknown)[] } };
    return (
      msg.message?.general?.some(
        (m) =>
          typeof m === "string" &&
          (m.toLowerCase().includes("token expired") ||
            m.toLowerCase().includes("token invalid") ||
            m.toLowerCase().includes("invalid token")),
      ) === true
    );
  }
  return false;
}

function redirectToLogin() {
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

interface RequestOptions<T> {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  schema?: z.ZodSchema<T>;
  headers?: HeadersInit;
  responseType?: "json" | "blob";
  /** When true, sends body as FormData (no JSON.stringify, no Content-Type). */
  isFormData?: boolean;
  /** When true, a 403 throws ApiError instead of the auth flow. */
  skipAuthRedirectOn403?: boolean;
  /** When true, a Zod parse failure throws instead of returning raw. */
  strictSchema?: boolean;
}

type ClientOptions = {
  headers?: HeadersInit;
  responseType?: "json" | "blob";
  isFormData?: boolean;
  skipAuthRedirectOn403?: boolean;
  strictSchema?: boolean;
};

/**
 * Raw authenticated fetch with Bearer + one refresh-retry on 401.
 * Used by multipart callers that manage their own body/error parsing.
 */
export async function authedFetch(
  endpoint: string,
  init: RequestInit,
): Promise<Response> {
  const url = `${API_BASE}${endpoint}`;
  const withAuth = (token: string | undefined): RequestInit => ({
    ...init,
    headers: {
      ...(init.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  let res = await fetch(url, withAuth(authStore.getAccessToken()));
  if (!res.ok) {
    // Peek the body via clone() so the caller can still read the original.
    const peeked = await res
      .clone()
      .json()
      .catch(() => null);
    if (isTokenExpired(res.status, peeked)) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        res = await fetch(url, withAuth(newToken));
      } else {
        await authStore.clearTokens();
        redirectToLogin();
        throw new ApiError(401, "Session expired");
      }
    }
  }
  return res;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions<T> & { authenticated: boolean },
): Promise<T> {
  const isFormData = options.isFormData === true;
  const requestHeaders: Record<string, string> = isFormData
    ? {}
    : { ...BASE_HEADERS };

  const send = (token: string | undefined) =>
    fetch(`${API_BASE}${endpoint}`, {
      method: options.method,
      headers: {
        ...requestHeaders,
        ...(options.authenticated && token
          ? { Authorization: `Bearer ${token}` }
          : {}),
        ...options.headers,
      },
      body: isFormData
        ? (options.body as FormData)
        : options.body
          ? JSON.stringify(options.body)
          : undefined,
      cache: "no-store",
    });

  let res = await send(
    options.authenticated ? authStore.getAccessToken() : undefined,
  );

  // ── Blob branch ───────────────────────────────────────────
  if (options.responseType === "blob") {
    if (res.ok) return (await res.blob()) as T;
    let errData = await res.json().catch(() => null);

    if (options.authenticated && isTokenExpired(res.status, errData)) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        res = await send(newToken);
        if (res.ok) return (await res.blob()) as T;
        errData = await res.json().catch(() => null);
      }
      if (!newToken || isTokenExpired(res.status, errData)) {
        await authStore.clearTokens();
        redirectToLogin();
        throw new ApiError(401, "Session expired", errData);
      }
    }
    throw new ApiError(
      res.status,
      extractDjangoMessage(errData) || `Request failed: ${endpoint}`,
      errData,
    );
  }

  // ── JSON branch ───────────────────────────────────────────
  let rawData = await res.json().catch(() => null);

  // Token-expiry → refresh + retry once
  if (options.authenticated && isTokenExpired(res.status, rawData)) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await send(newToken);
      rawData = await res.json().catch(() => null);
    }
    if (!newToken || isTokenExpired(res.status, rawData)) {
      await authStore.clearTokens();
      redirectToLogin();
      throw new ApiError(401, "Session expired", rawData);
    }
  }

  // Permission 403 (not token expiry) — throw as normal error
  if (res.status === 403 && options.skipAuthRedirectOn403) {
    const backendMsg = extractDjangoMessage(rawData);
    throw new ApiError(403, backendMsg || "Forbidden", rawData);
  }

  // Business error (hasError true even on 200)
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

/** Public gateway — no auth header. */
export const publicApiClient = createGateway(false);

/** Private gateway — attaches Bearer token, refreshes on expiry. */
export const apiClient = createGateway(true);
