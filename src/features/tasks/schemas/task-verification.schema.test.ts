import { describe, expect, it } from "vitest";
import {
  ReviewActionSchema,
  TaskVerificationItemSchema,
} from "./task-verification.schema";

describe("ReviewActionSchema", () => {
  it("accepts a change request with a reason", () => {
    expect(
      ReviewActionSchema.parse({ action: "request_changes", reason: "x" }),
    ).toEqual({ action: "request_changes", reason: "x" });
  });

  it("requires a reason to request changes or reject", () => {
    expect(
      ReviewActionSchema.safeParse({ action: "request_changes" }).success,
    ).toBe(false);
    expect(
      ReviewActionSchema.safeParse({ action: "reject", reason: "   " }).success,
    ).toBe(false);
  });

  it("approves without a reason", () => {
    expect(ReviewActionSchema.safeParse({ action: "approve" }).success).toBe(
      true,
    );
  });
});

describe("TaskVerificationItemSchema", () => {
  it("reads the changes_requested status the backend now sets", () => {
    const parsed = TaskVerificationItemSchema.safeParse({
      id: "t1",
      title: "Build a CLI",
      hashtag: "#cli",
      approval_status: "changes_requested",
    });
    expect(parsed.success && parsed.data.approval_status).toBe(
      "changes_requested",
    );
  });
});
