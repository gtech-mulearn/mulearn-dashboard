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
 *  - `{ message: { field_name: ["..."] } }` (field-specific validation errors)
 *  - `{ detail: "..." }`                  (DRF style)
 */
export function extractDjangoMessage(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  const msg = d.message;
  if (msg && typeof msg === "object") {
    const msgObj = msg as Record<string, unknown>;

    // First check for general messages
    const general = msgObj.general;
    if (Array.isArray(general) && typeof general[0] === "string") {
      return general[0];
    }

    // Then check for field-specific validation errors (e.g., title, description, etc.)
    for (const key in msgObj) {
      const value = msgObj[key];
      if (Array.isArray(value) && typeof value[0] === "string") {
        return value[0];
      }
    }
  }

  // DRF fallback → detail
  if (typeof d.detail === "string") return d.detail;

  return null;
}

/**
 * Check if the error indicates a duplicate/already exists error.
 * Common patterns: "already exists", "duplicate", "unique constraint"
 * Checks both the error data and the error message itself.
 */
export function isDuplicateError(error: unknown): boolean {
  // Check if it's an ApiError instance
  if (error instanceof ApiError) {
    // Check the error message
    const msgLower = error.message.toLowerCase();
    if (
      msgLower.includes("already exists") ||
      msgLower.includes("duplicate") ||
      msgLower.includes("unique constraint") ||
      msgLower.includes("must be unique")
    ) {
      return true;
    }

    // Also check the data field
    if (error.data && typeof error.data === "object") {
      const message = extractDjangoMessage(error.data);
      if (message) {
        const dataMsg = message.toLowerCase();
        return (
          dataMsg.includes("already exists") ||
          dataMsg.includes("duplicate") ||
          dataMsg.includes("unique constraint") ||
          dataMsg.includes("must be unique")
        );
      }
    }
  }

  return false;
}
