import { describe, expect, it } from "vitest";
import { ApiError, getApiErrorCode, getApiErrorNumber } from "./errors";

const apiError = (data: unknown) => new ApiError(400, "x", data);

describe("getApiErrorCode", () => {
  it("reads message.error_code from the Django envelope", () => {
    const error = apiError({
      message: { general: ["taken"], error_code: "email_taken" },
      response: {},
    });
    expect(getApiErrorCode(error)).toBe("email_taken");
  });

  it("is null for other errors and for envelopes without a code", () => {
    expect(getApiErrorCode(new Error("x"))).toBeNull();
    expect(
      getApiErrorCode(apiError({ message: { general: ["x"] } })),
    ).toBeNull();
    expect(getApiErrorCode(apiError(undefined))).toBeNull();
  });
});

describe("getApiErrorNumber", () => {
  it("reads numeric hints from the failure's response", () => {
    const error = apiError({ message: {}, response: { retry_after: 42 } });
    expect(getApiErrorNumber(error, "retry_after")).toBe(42);
    expect(getApiErrorNumber(error, "attempts_left")).toBeNull();
  });
});
