import { describe, expect, it } from "vitest";
import { isActionable, resolveStatus, statusBadge } from "./status";

describe("resolveStatus", () => {
  it("uses status when present, including GRANT_REVOKED", () => {
    expect(resolveStatus({ status: "GRANT_REVOKED" })).toBe("GRANT_REVOKED");
  });

  it("falls back to is_verified for legacy rows", () => {
    expect(resolveStatus({ is_verified: true })).toBe("APPROVED");
  });

  it("treats a legacy row with a note as rejected", () => {
    expect(resolveStatus({ verification_note: "duplicate" })).toBe("REJECTED");
  });

  it("treats a legacy row with nothing as pending", () => {
    expect(resolveStatus({})).toBe("PENDING");
  });
});

describe("statusBadge", () => {
  it("labels a revoked grant as Revoked, not Pending", () => {
    expect(statusBadge("GRANT_REVOKED")).toEqual({
      label: "Revoked",
      variant: "outline",
    });
  });

  it("keeps the existing pending badge", () => {
    expect(statusBadge("PENDING")).toEqual({
      label: "Pending",
      variant: "warning",
    });
  });

  it("shows an unknown status verbatim instead of guessing", () => {
    expect(statusBadge("ON_HOLD")).toEqual({
      label: "ON_HOLD",
      variant: "outline",
    });
  });
});

describe("isActionable", () => {
  it("only allows decisions on pending applications", () => {
    expect(isActionable({ status: "PENDING" })).toBe(true);
    expect(isActionable({ status: "GRANT_REVOKED" })).toBe(false);
  });
});
