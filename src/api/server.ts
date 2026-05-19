// src/api/server.ts
// Server-side API gateways — mirrors client.ts pattern for Server Components / Route Handlers.
// ─────────────────────────────────────────────────────────────────────────────
// publicServerClient  → no auth, for unauthenticated endpoints
// serverApiClient     → attaches Bearer token from cookies
// ─────────────────────────────────────────────────────────────────────────────
// ⚠️  This file must only be imported from Server Components / Route Handlers.

import { cookies } from "next/headers";
import type { z } from "zod";
import { refreshAccessToken } from "@/features/auth/api/auth.api";
import { env } from "../../config/env";
import { ApiError, extractDjangoMessage } from "./errors";

// ─── URL + Headers ──────────────────────────────────────────────────────────

if (process.env.NODE_ENV === "production" && !process.env.BACKEND_URL) {
  console.warn(
    "[server] BACKEND_URL is not set — falling back to NEXT_PUBLIC_DJANGO_API_URL. " +
      "Set BACKEND_URL to an internal VPC endpoint for better performance and security.",
  );
}

function getBaseUrl(): string {
  return env.BACKEND_URL ?? env.NEXT_PUBLIC_DJANGO_API_URL;
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
    const result = await refreshAccessToken(refreshToken);
    const newAccessToken = result.accessToken;

    if (newAccessToken) {
      // Persist the refreshed token so subsequent server requests in this
      // render cycle (and the next page load) use the new token.
      cookieStore.set("accessToken", newAccessToken, {
        expires: new Date(Date.now() + 86_400_000), // 1 day
        secure: process.env.NODE_ENV === "production",
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
}

type ServerOptions = {
  headers?: HeadersInit;
  next?: NextFetchRequestConfig;
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
              if (process.env.NODE_ENV === "development") {
                console.error(
                  `⚠️ API schema mismatch (server) [${endpoint}]`,
                  parsed.error.issues,
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

    const backendMsg = extractDjangoMessage(rawData);
    throw new ApiError(
      res.status,
      backendMsg || `Request failed: ${endpoint}`,
      rawData,
    );
  }

  if (options.schema) {
    const parsed = options.schema.safeParse(rawData);
    if (!parsed.success) {
      if (process.env.NODE_ENV === "development") {
        console.error(
          `⚠️ API schema mismatch (server) [${endpoint}]`,
          parsed.error.issues,
        );
      }
      // Return raw data preserving the full envelope shape.
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
