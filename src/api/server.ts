// src/api/server.ts
// Server-side API gateways — mirrors client.ts pattern for Server Components / Route Handlers.
// ─────────────────────────────────────────────────────────────────────────────
// publicServerClient  → no auth, for unauthenticated endpoints
// serverApiClient     → attaches Bearer token from cookies
// ─────────────────────────────────────────────────────────────────────────────
// ⚠️  This file must only be imported from Server Components / Route Handlers.

import { cookies } from "next/headers";
import type { z } from "zod";
import { env } from "../../config/env";

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
  if (typeof d.detail === "string") return d.detail;
  return null;
}

// ─── URL + Headers ──────────────────────────────────────────────────────────

function getBaseUrl(): string {
  return env.BACKEND_URL ?? env.NEXT_PUBLIC_DJANGO_API_URL;
}

const BASE_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
};

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { ...BASE_HEADERS };

  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
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
      console.error("❌ API schema mismatch (server)", {
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
