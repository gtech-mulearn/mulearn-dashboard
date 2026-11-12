import { describe, expect, it } from "vitest";
import {
  formatNumericRuleValue,
  RULE_TYPE_OPTIONS,
  SKILL_RULE_TYPES,
} from "./jobs.constants";

describe("skill eligibility rule (release 1.91)", () => {
  it("offers a Required skill rule", () => {
    expect(RULE_TYPE_OPTIONS).toContainEqual({
      value: "skill",
      label: "Required skill",
    });
    expect(SKILL_RULE_TYPES).toEqual(["skill"]);
  });

  it("keeps a skill id as-is instead of coercing it to a number", () => {
    expect(formatNumericRuleValue("skill", "abc")).toBe("abc");
    expect(formatNumericRuleValue("min_karma", "500")).toBe(500);
  });
});
