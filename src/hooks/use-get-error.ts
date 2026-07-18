import { ApiError } from "@/api";
import { extractDjangoMessage } from "@/api/errors";

export type ApiResponseErrorOptions = {
  fallback?: string;
};

const FIELD_NAME_PATTERN = /_/g;

const formatFieldName = (field: string): string =>
  field.replace(FIELD_NAME_PATTERN, " ");

const collectValidationMessages = (
  value: unknown,
  field?: string,
): string[] => {
  if (!value) return [];

  if (typeof value === "string") {
    return field ? [`${formatFieldName(field)}: ${value}`] : [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectValidationMessages(item, field));
  }

  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(
      ([key, nestedValue]) =>
        collectValidationMessages(nestedValue, key === "general" ? field : key),
    );
  }

  return [];
};

const extractNestedValidationMessage = (data: unknown): string | null => {
  if (!data || typeof data !== "object") return null;

  const message = (data as Record<string, unknown>).message;
  const messages = collectValidationMessages(message);

  return messages.length > 0 ? messages.join(" | ") : null;
};

export const getApiResponseError = (
  error: unknown,
  options: ApiResponseErrorOptions = {},
): string => {
  const { fallback = "An unexpected error occurred" } = options;

  if (error instanceof ApiError) {
    // 1. Django-style message extraction
    const djangoMessage = extractDjangoMessage(error.data);
    if (djangoMessage) return djangoMessage;

    // 2. Nested Django/DRF validation payloads
    const nestedValidationMessage = extractNestedValidationMessage(error.data);
    if (nestedValidationMessage) return nestedValidationMessage;

    // 3. ApiError.message
    if (error.message) return error.message;
  }

  // 4. Plain string
  if (typeof error === "string") return error;

  // 5. Generic Error / object with message
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  ) {
    return (error as Record<string, unknown>).message as string;
  }

  return fallback;
};
