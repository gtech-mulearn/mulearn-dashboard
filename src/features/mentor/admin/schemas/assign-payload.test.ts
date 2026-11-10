import { describe, expect, it } from "vitest";
import { AssignMentorsPayloadSchema, MentorApplicationListItemSchema } from ".";

const base = {
  user_muids: ["someone@mulearn"],
  mentor_tier: "IG_MENTOR",
  ig_ids: ["ig-1"],
};

describe("AssignMentorsPayloadSchema hours", () => {
  it("accepts a weekly-hours range", () => {
    expect(
      AssignMentorsPayloadSchema.parse({ ...base, hours: "2-5" }).hours,
    ).toBe("2-5");
  });

  it("rejects a bare number, which the backend refuses", () => {
    expect(
      AssignMentorsPayloadSchema.safeParse({ ...base, hours: 5 }).success,
    ).toBe(false);
  });

  it("allows hours to be left out", () => {
    expect(AssignMentorsPayloadSchema.safeParse(base).success).toBe(true);
  });
});

describe("MentorApplicationListItemSchema hours", () => {
  it("keeps the stored range instead of coercing it to 0", () => {
    const parsed = MentorApplicationListItemSchema.safeParse({
      id: "a1",
      hours: "10+",
    });
    expect(parsed.success && parsed.data.hours).toBe("10+");
  });
});
