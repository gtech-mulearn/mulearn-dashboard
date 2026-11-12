import { describe, expect, it } from "vitest";
import { applicableChecklistEntries } from "./completion";

describe("applicableChecklistEntries", () => {
  it("drops checks the backend marks not applicable (null)", () => {
    expect(
      applicableChecklistEntries({
        about: true,
        expertise: false,
        linkedin: true,
        preferred_igs: null,
      }),
    ).toEqual([
      ["about", true],
      ["expertise", false],
      ["linkedin", true],
    ]);
  });

  it("keeps a failed IG check for IG mentors", () => {
    expect(
      applicableChecklistEntries({
        about: true,
        expertise: true,
        linkedin: true,
        preferred_igs: false,
      }),
    ).toContainEqual(["preferred_igs", false]);
  });
});
