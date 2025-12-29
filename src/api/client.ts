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

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(res.status, `Request failed: ${endpoint}`, data);
  }

  if (options.schema) {
    const parsed = options.schema.safeParse(data);
    if (!parsed.success) {
      console.error("❌ API schema mismatch", parsed.error.format());
      throw new Error("Invalid API response");
    }
    return parsed.data;
  }

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
