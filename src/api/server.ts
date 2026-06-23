// src/api/server.ts
// Server-side API gateways — mirrors client.ts pattern for Server Components / Route Handlers.
// ─────────────────────────────────────────────────────────────────────────────
// publicServerClient  → no auth, for unauthenticated endpoints
// serverApiClient     → attaches Bearer token from cookies
// ─────────────────────────────────────────────────────────────────────────────
// ⚠️  This file must only be imported from Server Components / Route Handlers.

import { cookies } from "next/headers";
import type { z } from "zod";
import { getBaseUrl } from "./base-url.server";
import { ApiError, logSchemaMismatch } from "./errors";
import { getApiResponseError } from "@/hooks/use-get-error";
import { refreshAccessTokenServer } from "./refresh.server";

// ─── URL + Headers ──────────────────────────────────────────────────────────

if (process.env.NODE_ENV === "production" && !process.env.BACKEND_URL) {
  console.warn(
    "[server] BACKEND_URL is not set — falling back to NEXT_PUBLIC_DJANGO_API_URL. " +
      "Set BACKEND_URL to an internal VPC endpoint for better performance and security.",
  );
}

const BASE_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
};

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { ...BASE_HEADERS };

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
}

async function refreshAndSetToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) return null;

  try {
    const newAccessToken = await refreshAccessTokenServer(refreshToken);

    if (newAccessToken) {
      const isProduction = process.env.NODE_ENV === "production";
      cookieStore.set("accessToken", newAccessToken, {
        httpOnly: true,
        expires: new Date(Date.now() + 86_400_000),
        secure: isProduction,
        sameSite: "strict",
        path: "/",
      });
      cookieStore.set("isAuthenticated", "true", {
        expires: new Date(Date.now() + 86_400_000),
        secure: isProduction,
        sameSite: "strict",
        path: "/",
      });
      return newAccessToken;
    }

    return null;
  } catch {
    return null;
  }
}

// ─── Request options ────────────────────────────────────────────────────────

interface RequestOptions<T> {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  schema?: z.ZodSchema<T>;
  headers?: HeadersInit;
  next?: NextFetchRequestConfig;
  /**
   * When true, a Zod schema-parse failure throws an `ApiError` instead of
   * returning the unvalidated raw payload. Default is lenient (returns raw,
   * but the mismatch is always logged).
   */
  strictSchema?: boolean;
}

type ServerOptions = {
  headers?: HeadersInit;
  next?: NextFetchRequestConfig;
  /** See RequestOptions.strictSchema */
  strictSchema?: boolean;
};

// ─── Core request fn ────────────────────────────────────────────────────────

async function request<T>(
  endpoint: string,
  options: RequestOptions<T> & { authenticated: boolean },
): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${endpoint}`, {
    method: options.method,
    headers: {
      ...(options.authenticated ? await getAuthHeaders() : BASE_HEADERS),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    next: options.next,
  });

  const rawData = await res.json().catch(() => null);

  if (!res.ok) {
    if ((res.status === 401 || res.status === 403) && options.authenticated) {
      const newAccessToken = await refreshAndSetToken();

      if (newAccessToken) {
        const retryRes = await fetch(`${getBaseUrl()}${endpoint}`, {
          method: options.method,
          headers: {
            ...(options.authenticated ? await getAuthHeaders() : BASE_HEADERS),
            Authorization: `Bearer ${newAccessToken}`,
            ...options.headers,
          },
          body: options.body ? JSON.stringify(options.body) : undefined,
          next: options.next,
        });

        if (retryRes.ok) {
          const retryData = await retryRes.json().catch(() => null);

          if (options.schema) {
            const parsed = options.schema.safeParse(retryData);
            if (!parsed.success) {
              logSchemaMismatch(`${endpoint} (server)`, parsed.error.issues);
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

          const data =
            retryData &&
            typeof retryData === "object" &&
            "response" in retryData
              ? retryData.response
              : retryData;

          return data as T;
        }
      }
    }

    const backendMsg = getApiResponseError(rawData, {
      fallback: "Something went wrong. Please try again.",
    });
    throw new ApiError(res.status, backendMsg, rawData);
  }

  if (options.schema) {
    const parsed = options.schema.safeParse(rawData);
    if (!parsed.success) {
      logSchemaMismatch(`${endpoint} (server)`, parsed.error.issues);
      if (options.strictSchema) {
        throw new ApiError(
          res.status,
          `Schema validation failed: ${endpoint}`,
          rawData,
        );
      }
      // Lenient default: return the raw payload preserving the envelope shape.
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

function createServerGateway(authenticated: boolean) {
  return {
    get: <T>(
      endpoint: string,
      schema?: z.ZodSchema<T>,
      options?: ServerOptions,
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
      options?: ServerOptions,
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
      options?: ServerOptions,
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
      options?: ServerOptions,
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
      options?: ServerOptions,
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

/** Public gateway — no auth, for unauthenticated server-side calls */
export const publicServerClient = createServerGateway(false);

/** Private gateway — attaches Bearer token from cookies */
export const serverApiClient = createServerGateway(true);
