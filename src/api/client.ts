// src/api/client.ts
import type { z } from "zod";
import { env } from "../../config/env";

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
 * Get authorization header if token is available.
 */
import { authStore } from "../lib/auth";

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json; charset=utf-8",
  };

  const token = authStore.getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Check if response indicates token expiry/invalid and redirect to login
 */
function handleTokenExpiry(rawData: unknown): void {
  if (typeof window === "undefined") return; // Only run on client

  // Check for Django token expiry response format
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

    // Check for token expired/invalid (statusCode 1000 or specific messages)
    if (
      data.statusCode === 1000 ||
      data.message?.general?.some(
        (msg) =>
          msg.toLowerCase().includes("token expired") ||
          msg.toLowerCase().includes("token invalid") ||
          msg.toLowerCase().includes("invalid token"),
      )
    ) {
      // Clear tokens
      authStore.clearTokens();

      // Redirect to login
      window.location.href = "/login";
    }
  }
}

async function request<T>(
  endpoint: string,
  options: {
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
    schema?: z.ZodSchema<T>;
    headers?: HeadersInit;
  },
): Promise<T> {
  const res = await fetch(`${env.NEXT_PUBLIC_DJANGO_API_URL}${endpoint}`, {
    method: options.method,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const rawData = await res.json().catch(() => null);

  // Check for token expiry on ANY response (even non-ok ones)
  handleTokenExpiry(rawData);

  // Handle 401 Unauthorized and 403 Forbidden (token expired/invalid)
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

  if (!res.ok) {
    throw new ApiError(res.status, `Request failed: ${endpoint}`, rawData);
  }

  // Validate FIRST against the full response schema (which includes the wrapper)
  // Then the schema's type will determine what gets returned
  if (options.schema) {
    const parsed = options.schema.safeParse(rawData);
    if (!parsed.success) {
      console.error("❌ API schema mismatch", parsed.error.format());
      throw new Error("Invalid API response");
    }
    return parsed.data;
  }

  // If no schema, extract response from Django wrapper
  const data =
    rawData && typeof rawData === "object" && "response" in rawData
      ? rawData.response
      : rawData;

  return data as T;
}

export const apiClient = {
  get: <T>(endpoint: string, schema?: z.ZodSchema<T>) =>
    request<T>(endpoint, {
      method: "GET",
      schema,
    }),

  post: <T>(endpoint: string, body: unknown, schema?: z.ZodSchema<T>) =>
    request<T>(endpoint, {
      method: "POST",
      body,
      schema,
    }),

  put: <T>(endpoint: string, body: unknown, schema?: z.ZodSchema<T>) =>
    request<T>(endpoint, {
      method: "PUT",
      body,
      schema,
    }),

  patch: <T>(endpoint: string, body: unknown, schema?: z.ZodSchema<T>) =>
    request<T>(endpoint, {
      method: "PATCH",
      body,
      schema,
    }),

  delete: <T>(endpoint: string, schema?: z.ZodSchema<T>) =>
    request<T>(endpoint, {
      method: "DELETE",
      schema,
    }),
};
