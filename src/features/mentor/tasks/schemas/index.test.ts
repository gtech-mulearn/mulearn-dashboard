/**
 * Mentor Task Form Schema — Unit Tests
 *
 * 📍 src/features/mentor/tasks/schemas/index.test.ts
 *
 * Regression test for the "Submit New Task" form (mentor task-request page):
 * whitespace-only hashtags must be rejected, matching the behavior already
 * enforced for the admin task form (src/features/tasks/schemas/tasks.schema.ts).
 */

import { describe, expect, it } from "vitest";
import { MentorTaskFormSchema } from "./index";

const validBase = {
  title: "Design a PR Campaign",
  karma: 100,
  usage_count: 1,
  description: "",
  type: "type-id",
  level: "level-id",
  ig: "ig-id",
  skill_ids: [] as string[],
};

describe("MentorTaskFormSchema — hashtag", () => {
  it("rejects an empty hashtag", () => {
    const result = MentorTaskFormSchema.safeParse({
      ...validBase,
      hashtag: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a whitespace-only hashtag", () => {
    const result = MentorTaskFormSchema.safeParse({
      ...validBase,
      hashtag: "   ",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a valid hashtag", () => {
    const result = MentorTaskFormSchema.safeParse({
      ...validBase,
      hashtag: "pr-campaign-design",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a hashtag with surrounding whitespace but real content", () => {
    const result = MentorTaskFormSchema.safeParse({
      ...validBase,
      hashtag: "  pr-campaign-design  ",
    });
    expect(result.success).toBe(true);
  });
});
