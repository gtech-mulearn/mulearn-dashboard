import { describe, expect, it } from "vitest";
import { APP_STATUS_META, APP_STATUS_TRANSITIONS } from "../constants";
import { normalizeStatus } from "./applicants-section";

describe("applicant status (release 1.91)", () => {
  it("keeps a withdrawn application withdrawn instead of pending", () => {
    expect(normalizeStatus("Withdrawn")).toBe("withdrawn");
    expect(normalizeStatus("Pending")).toBe("pending");
  });

  it("labels withdrawn and allows no further status changes", () => {
    expect(APP_STATUS_META.withdrawn?.label).toBe("Withdrawn");
    expect(APP_STATUS_TRANSITIONS.withdrawn).toEqual([]);
  });
});
