import { describe, expect, it } from "vitest";
import { keepRequestsForRole } from "./role-rows";

const row = (id: string, role_title: string) => ({ id, role_title });

describe("keepRequestsForRole", () => {
  it("drops other roles' requests if the backend ignored ?role= (older deploy)", () => {
    // Approving a Mentor/Company link here would bypass their own flows.
    const rows = [
      row("1", "Enabler"),
      row("2", "Mentor"),
      row("3", "Company"),
      row("4", "Enabler"),
    ];
    expect(keepRequestsForRole(rows, "Enabler").map((r) => r.id)).toEqual([
      "1",
      "4",
    ]);
  });

  it("keeps every row when the backend already filtered", () => {
    const rows = [row("1", "Enabler"), row("2", "Enabler")];
    expect(keepRequestsForRole(rows, "Enabler")).toEqual(rows);
  });
});
