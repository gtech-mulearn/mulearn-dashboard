import { describe, expect, it } from "vitest";
import { splitProfileEdit } from "./split-profile-edit";

describe("splitProfileEdit", () => {
  it("never puts preferred_ig_ids in the profile patch", () => {
    const r = splitProfileEdit(
      { about: "new", preferred_ig_ids: ["b", "a"] },
      { about: "old", preferred_ig_ids: ["a", "b"] },
    );
    expect(r.profilePatch).toEqual({ about: "new" });
    expect(r.profilePatch).not.toHaveProperty("preferred_ig_ids");
  });

  it("treats the same IGs in a different order as unchanged", () => {
    expect(
      splitProfileEdit(
        { preferred_ig_ids: ["b", "a"] },
        { preferred_ig_ids: ["a", "b"] },
      ).igChange,
    ).toBeNull();
  });

  it("returns the new IG list when it changed", () => {
    expect(
      splitProfileEdit({ preferred_ig_ids: ["c"] }, { preferred_ig_ids: ["a"] })
        .igChange,
    ).toEqual(["c"]);
  });

  it("joins expertise chips and only sends it when changed", () => {
    expect(
      splitProfileEdit({ expertise: ["x", "y"] }, { expertise: "x, y" })
        .profilePatch,
    ).toEqual({});
    expect(
      splitProfileEdit({ expertise: ["x", "z"] }, { expertise: "x, y" })
        .profilePatch,
    ).toEqual({ expertise: "x, z" });
  });

  it("sends weekly availability changes, including clearing it", () => {
    expect(
      splitProfileEdit({ hours: "5-10" }, { hours: "2-5" }).profilePatch,
    ).toEqual({ hours: "5-10" });
    expect(
      splitProfileEdit({ hours: undefined }, { hours: "2-5" }).profilePatch,
    ).toEqual({ hours: null });
  });

  it("sends nothing when nothing changed", () => {
    expect(
      splitProfileEdit(
        { about: "a", linkedin: "https://linkedin.com/in/x" },
        { about: "a", linkedin: "https://linkedin.com/in/x" },
      ),
    ).toEqual({ profilePatch: {}, igChange: null });
  });
});
