// src/api/errors.ts
// Shared API error utilities used by both client-side and server-side API gateways.

/**
 * Represents an HTTP error from the API layer.
 * Thrown by both `apiClient` (client-side) and `serverApiClient` (server-side).
 */
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
export function extractDjangoMessage(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  const msg = d.message;
  if (msg && typeof msg === "object") {
    const general = (msg as Record<string, unknown>).general;
    if (Array.isArray(general) && general.length > 0) {
      const first = general[0];
      if (typeof first === "string") return first;
      if (first && typeof first === "object") {
        const [field, value] = Object.entries(first)[0] ?? [];
        if (Array.isArray(value) && typeof value[0] === "string") {
          return field ? `${field}: ${value[0]}` : value[0];
        }
      }
    }
  }

  // DRF fallback → detail
  if (typeof d.detail === "string") return d.detail;

  return null;
}
