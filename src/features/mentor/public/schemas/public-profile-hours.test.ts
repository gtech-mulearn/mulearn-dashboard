import { describe, expect, it } from "vitest";
import { PublicMentorProfileSchema } from ".";

describe("PublicMentorProfileSchema hours", () => {
  it("keeps the backend's weekly-hours range", () => {
    expect(PublicMentorProfileSchema.parse({ hours: "2-5" }).hours).toBe("2-5");
  });

  it("allows a mentor with no hours set", () => {
    expect(PublicMentorProfileSchema.parse({ hours: null }).hours).toBeNull();
  });
});
