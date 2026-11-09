import { describe, expect, it } from "vitest";
import { EmailVerificationStatusSchema } from "./email-verification.schema";

describe("EmailVerificationStatusSchema", () => {
  // Spec C D2: verification is unconditional, so the backend reports no switch.
  it("parses a status without enforced", () => {
    expect(() =>
      EmailVerificationStatusSchema.parse({
        email: "a@b.co",
        verified: false,
        verified_at: null,
        via: null,
        has_password: true,
      }),
    ).not.toThrow();
  });
});
