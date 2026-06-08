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
  if (!data) return null;

  if (typeof data === "string") return data;

  if (data instanceof Error) {
    return data.message;
  }

  if (typeof data !== "object") return null;
  const d = data as Record<string, unknown>;

  const msg = d.message;
  if (msg && typeof msg === "object") {
    const msgObj = msg as Record<string, unknown>;

    // { message: { general: ["..."] } } — most common MuLearn shape
    const general = msgObj.general;
    if (Array.isArray(general) && typeof general[0] === "string") {
      return general[0];
    }

    // { message: { field_name: ["..."], other_field: ["..."] } }
    // — Django / DRF field-level validation errors
    const parts: string[] = [];
    for (const [field, errors] of Object.entries(msgObj)) {
      if (Array.isArray(errors)) {
        const joined = errors
          .filter((e): e is string => typeof e === "string")
          .join(", ");
        if (joined) parts.push(`${field}: ${joined}`);
      } else if (typeof errors === "string" && errors) {
        parts.push(`${field}: ${errors}`);
      }
    }
    if (parts.length > 0) return parts.join(" | ");
  }

  if (typeof msg === "string") return msg;

  if (typeof d.detail === "string") return d.detail;

  return null;
}
