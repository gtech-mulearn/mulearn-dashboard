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
 * Handles (in priority order):
 *  1. `{ message: { general: ["..."] } }`      — muLearn custom envelope
 *  2. `{ message: { field: ["..."] } }`         — muLearn field-level errors
 *  3. `{ message: "..." }`                      — plain string message
 *  4. `{ response: { field: ["..."] } }`        — errors packed in `response`
 *  5. `{ detail: "..." }`                       — DRF standard
 *  6. `{ field: ["..."], ... }`                 — flat DRF validation dict
 */
export function extractDjangoMessage(data: unknown): string | null {
  if (!data) return null;
  if (typeof data === "string") return data;
  if (data instanceof Error) return data.message;
  if (typeof data !== "object") return null;

  const d = data as Record<string, unknown>;

  // 1 & 2 & 3: Check `message` field
  const msg = d.message;
  if (msg != null) {
    if (typeof msg === "string") return msg || null;

    if (typeof msg === "object") {
      const msgObj = msg as Record<string, unknown>;

      // 1. { message: { general: ["..."] } }
      if (Array.isArray(msgObj.general) && msgObj.general.length > 0) {
        if (typeof msgObj.general[0] === "string") {
          return msgObj.general[0];
        }
        if (
          typeof msgObj.general[0] === "object" &&
          msgObj.general[0] !== null
        ) {
          // { message: { general: [ { country: ["Unknown field."] } ] } }
          const genParts: string[] = [];
          for (const [field, errors] of Object.entries(
            msgObj.general[0] as Record<string, unknown>,
          )) {
            if (Array.isArray(errors)) {
              const joined = errors
                .filter((e): e is string => typeof e === "string")
                .join(", ");
              if (joined) genParts.push(`${field}: ${joined}`);
            } else if (typeof errors === "string" && errors) {
              genParts.push(`${field}: ${errors}`);
            }
          }
          if (genParts.length > 0) return genParts.join(" | ");
        }
      }

      // 2. { message: { field: ["..."], ... } }
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
  }

  // 4. Check `response` field for validation errors
  // Django sometimes sends { hasError: true, message: null, response: { field: ["err"] } }
  const resp = d.response;
  if (resp != null && typeof resp === "object" && !Array.isArray(resp)) {
    const respObj = resp as Record<string, unknown>;
    const respParts: string[] = [];
    for (const [field, errors] of Object.entries(respObj)) {
      if (Array.isArray(errors)) {
        const joined = errors
          .filter((e): e is string => typeof e === "string")
          .join(", ");
        if (joined) respParts.push(`${field}: ${joined}`);
      } else if (typeof errors === "string" && errors) {
        respParts.push(`${field}: ${errors}`);
      }
    }
    if (respParts.length > 0) return respParts.join(" | ");
  }

  // 5. { detail: "..." } — standard DRF
  if (typeof d.detail === "string") return d.detail;

  // 6. Flat DRF validation dict at root: { field: ["..."] }
  const SKIP_KEYS = new Set([
    "hasError",
    "statusCode",
    "message",
    "response",
    "detail",
  ]);
  const rootParts: string[] = [];
  for (const [field, errors] of Object.entries(d)) {
    if (SKIP_KEYS.has(field)) continue;
    if (Array.isArray(errors)) {
      const joined = errors
        .filter((e): e is string => typeof e === "string")
        .join(", ");
      if (joined) rootParts.push(`${field}: ${joined}`);
    } else if (typeof errors === "string" && errors) {
      rootParts.push(`${field}: ${errors}`);
    }
  }
  if (rootParts.length > 0) return rootParts.join(" | ");

  return null;
}
