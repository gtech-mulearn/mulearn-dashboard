// src/api/errors.ts
// Shared API error utilities used by both client-side and server-side API gateways.

/** What the backend's envelope adds to an error (backend issue 0019). All optional. */
export interface ApiErrorDetails {
  /** A stable error code clients can branch on, such as `validation_error`. */
  code?: string;
  /** The backend's request id, for support and logs. */
  requestId?: string;
  /** The envelope's own `statusCode` (`1000` for a token failure). */
  statusCode?: number;
  /** The endpoint that failed. */
  endpoint?: string;
  /** Field errors from `message.fields`, nested ones under dotted keys (`address.city`). */
  fieldErrors?: Record<string, string[]>;
}

export const DEFAULT_ERROR_MESSAGE = "Something went wrong. Please try again.";

/**
 * Represents an HTTP error from the API layer.
 * Thrown by both `apiClient` (client-side) and `serverApiClient` (server-side).
 */
export class ApiError extends Error {
  code?: string;
  requestId?: string;
  statusCode?: number;
  endpoint?: string;
  fieldErrors?: Record<string, string[]>;

  constructor(
    public status: number,
    public message: string,
    public data?: unknown,
    details: ApiErrorDetails = {},
  ) {
    super(message);
    this.code = details.code;
    this.requestId = details.requestId;
    this.statusCode = details.statusCode;
    this.endpoint = details.endpoint;
    this.fieldErrors = details.fieldErrors;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Flatten `message.fields` to dotted keys; non_field_errors are returned apart. */
function flattenFields(
  fields: Record<string, unknown>,
  prefix = "",
  out: Record<string, string[]> = {},
  nonField: string[] = [],
): { fieldErrors: Record<string, string[]>; nonField: string[] } {
  for (const [key, value] of Object.entries(fields)) {
    if (!prefix && key === "non_field_errors") {
      if (Array.isArray(value)) nonField.push(...value.map(String));
      continue;
    }
    const path = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(value)) {
      const messages = value.filter(
        (item): item is string => typeof item === "string",
      );
      if (messages.length > 0) out[path] = messages;
      value.forEach((item, index) => {
        if (isRecord(item))
          flattenFields(item, `${path}.${index}`, out, nonField);
      });
    } else if (isRecord(value)) {
      flattenFields(value, path, out, nonField);
    } else if (typeof value === "string") {
      out[path] = [value];
    }
  }
  return { fieldErrors: out, nonField };
}

/**
 * Build the ApiError for a failed response, from its status and parsed body.
 *
 * The message is taken as `extractDjangoMessage` does, so errors from today's envelopes keep
 * their messages exactly. When it finds none, the first non-field error is used, then the first
 * field error, then `fallback`. The envelope's `code`, `requestId` and `statusCode` are read when
 * present, and `message.fields` becomes `fieldErrors` (ADR-006, 06-backend-contract.md).
 */
export function parseApiError(
  status: number,
  data: unknown,
  endpoint?: string,
  fallback: string = DEFAULT_ERROR_MESSAGE,
): ApiError {
  const envelope = isRecord(data) ? data : null;
  const message =
    envelope && isRecord(envelope.message) ? envelope.message : null;
  const { fieldErrors, nonField } =
    message && isRecord(message.fields)
      ? flattenFields(message.fields)
      : { fieldErrors: {}, nonField: [] as string[] };
  const firstField = Object.values(fieldErrors)[0]?.[0];
  const text =
    extractDjangoMessage(data) ?? nonField[0] ?? firstField ?? fallback;
  return new ApiError(status, text, data, {
    code: typeof envelope?.code === "string" ? envelope.code : undefined,
    requestId:
      typeof envelope?.requestId === "string" ? envelope.requestId : undefined,
    statusCode:
      typeof envelope?.statusCode === "number"
        ? envelope.statusCode
        : undefined,
    endpoint,
    fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
  });
}

/**
 * The ApiError for a failed `authedFetch` response. Reads the body, unless the caller already
 * did and passes it as `data`. A caller with its own wording passes `message`, which wins.
 */
export async function toApiError(
  response: Response,
  endpoint?: string,
  options: { data?: unknown; message?: string; fallback?: string } = {},
): Promise<ApiError> {
  const data =
    "data" in options ? options.data : await response.json().catch(() => null);
  const error = parseApiError(
    response.status,
    data,
    endpoint,
    options.fallback,
  );
  if (options.message !== undefined) error.message = options.message;
  return error;
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
  if (process.env.NODE_ENV === "development") {
    console.error(`⚠️ API schema mismatch [${endpoint}]`, issues);
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
