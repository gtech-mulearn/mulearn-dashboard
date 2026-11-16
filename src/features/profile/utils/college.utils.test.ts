import { describe, expect, it } from "vitest";
import { profileCollegeId } from "./college.utils";

describe("profileCollegeId", () => {
  it("is the college when its code comes with it", () => {
    expect(profileCollegeId({ college_id: "cet", college_code: "CET" })).toBe(
      "cet",
    );
  });

  it("ignores a mentor's company id sent as college_id with no code", () => {
    expect(
      profileCollegeId({ college_id: "company-uuid", college_code: null }),
    ).toBe("");
  });

  it("is empty with no college", () => {
    expect(profileCollegeId({})).toBe("");
  });
});
