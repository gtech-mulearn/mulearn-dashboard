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
 * Log an API response/schema validation mismatch.
 *
 * Logged UNCONDITIONALLY (including production) so silent backend shape drift is
 * visible in monitoring instead of being swallowed in dev-only branches. The
 * gateways still return the raw payload by default (lenient), but callers can
 * opt into strict mode (`strictSchema: true`) to turn a mismatch into an
 * `ApiError`. See src/api/client.ts / server.ts.
 */
export function logSchemaMismatch(endpoint: string, issues: unknown): void {
  console.error(`⚠️ API schema mismatch [${endpoint}]`, issues);
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
    // Check for "general" first
    if (
      Array.isArray(msgObj.general) &&
      typeof msgObj.general[0] === "string"
    ) {
      return msgObj.general[0];
    }
    // Fallback: take the first value from any other key in the message object
    for (const key of Object.keys(msgObj)) {
      const val = msgObj[key];
      if (Array.isArray(val) && typeof val[0] === "string") {
        return val[0];
      }
      if (typeof val === "string") {
        return val;
      }
    }
  }

  if (typeof msg === "string") return msg;

  if (typeof d.detail === "string") return d.detail;

  return null;
}
