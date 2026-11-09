import { getApiErrorCode, getApiErrorNumber } from "@/api/errors";
import { getApiResponseError } from "@/hooks/use-get-error";

/** The sentence to show under a code input after a failed check. */
export function codeErrorMessage(error: unknown): string {
  const code = getApiErrorCode(error);
  if (code === "invalid_code") {
    const left = getApiErrorNumber(error, "attempts_left");
    if (!left) return "Too many wrong tries. Request a new code.";
    return `That code isn't right. ${left} ${left === 1 ? "try" : "tries"} left.`;
  }
  if (code === "code_expired") {
    return "This code has expired. Request a new one.";
  }
  return getApiResponseError(error, {
    fallback: "We couldn't check the code. Please try again.",
  });
}
