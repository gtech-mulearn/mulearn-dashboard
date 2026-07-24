import { describe, expect, it } from "vitest";
import {
  MentorApplicationMutationResponseSchema,
  MentorApplicationResponseSchema,
} from "./index";

const responseEnvelope = {
  hasError: false,
  statusCode: 200,
  message: { general: ["Mentor application updated successfully."] },
};

describe("mentor onboarding response schemas", () => {
  it("accepts the register mutation acknowledgement", () => {
    const result = MentorApplicationMutationResponseSchema.safeParse({
      ...responseEnvelope,
      response: { message: "Application updated" },
    });

    expect(result.success).toBe(true);
  });

  it("continues to require a full mentor profile for profile reads", () => {
    const result = MentorApplicationResponseSchema.safeParse({
      ...responseEnvelope,
      response: { message: "Application updated" },
    });

    expect(result.success).toBe(false);
  });
});
