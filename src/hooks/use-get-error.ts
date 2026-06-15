import { ApiError } from "@/api";
import { extractDjangoMessage } from "@/api/errors";

export type ApiResponseErrorOptions = {
  fallback?: string;
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

    // 2. ApiError.message
    if (error.message) return error.message;
  }

  // 3. Plain string
  if (typeof error === "string") return error;

  // 4. Generic Error / object with message
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
