import { describe, expect, it } from "vitest";
import { nextSortState } from "./sort-cycle";

describe("nextSortState", () => {
  it("starts ascending on an unsorted table", () => {
    expect(nextSortState("", "created_at")).toBe("created_at");
  });

  it("flips ascending to descending", () => {
    expect(nextSortState("created_at", "created_at")).toBe("-created_at");
  });

  it("clears the sort after descending", () => {
    expect(nextSortState("-created_at", "created_at")).toBe("");
  });

  it("restarts ascending when a different column is clicked", () => {
    expect(nextSortState("-created_at", "title")).toBe("title");
  });

  it("does not confuse columns that share a prefix", () => {
    expect(nextSortState("-created_at", "created")).toBe("created");
    expect(nextSortState("created", "created_at")).toBe("created_at");
  });
});
