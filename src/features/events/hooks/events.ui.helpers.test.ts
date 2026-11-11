import { describe, expect, it } from "vitest";
import { historyAction } from "./events.ui.helpers";

describe("historyAction", () => {
  it("labels new upper-case actions like the old lower-case rows", () => {
    expect(historyAction({ id: "1", action: "EVENT_CREATED" })).toBe(
      historyAction({ id: "2", action: "event_created" }),
    );
    expect(historyAction({ id: "3", action: "COLLABORATOR_INVITED" })).toBe(
      "collaborator invited",
    );
  });
});
