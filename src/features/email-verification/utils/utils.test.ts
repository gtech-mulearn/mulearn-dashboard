import { describe, expect, it } from "vitest";
import { ApiError } from "@/api/errors";
import { codeErrorMessage } from "./code-error-message";
import { maskEmail } from "./mask-email";

const failure = (code: string, response: Record<string, unknown> = {}) =>
  new ApiError(400, "server message", {
    message: { general: ["server message"], error_code: code },
    response,
  });

describe("maskEmail", () => {
  it("keeps the first letter and the domain", () => {
    expect(maskEmail("Asha@Gmail.com")).toBe("a•••@gmail.com");
    expect(maskEmail("nope")).toBe("•••");
  });
});

describe("codeErrorMessage", () => {
  it("counts the tries left", () => {
    expect(
      codeErrorMessage(failure("invalid_code", { attempts_left: 3 })),
    ).toBe("That code isn't right. 3 tries left.");
    expect(
      codeErrorMessage(failure("invalid_code", { attempts_left: 1 })),
    ).toBe("That code isn't right. 1 try left.");
    expect(
      codeErrorMessage(failure("invalid_code", { attempts_left: 0 })),
    ).toBe("Too many wrong tries. Request a new code.");
  });

  it("explains expiry and falls back to the server message", () => {
    expect(codeErrorMessage(failure("code_expired"))).toBe(
      "This code has expired. Request a new one.",
    );
    expect(codeErrorMessage(failure("mail_send_failed"))).toBe(
      "server message",
    );
  });
});
