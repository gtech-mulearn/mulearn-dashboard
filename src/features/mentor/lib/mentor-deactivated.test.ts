import { describe, expect, it } from "vitest";
import { ApiError } from "@/api/errors";
import { isMentorDeactivatedError } from "./mentor-deactivated";

const MSG =
  "Your mentor account is deactivated. Please contact an administrator.";

describe("isMentorDeactivatedError", () => {
  it("recognises the backend's mentor_active_required 403", () => {
    expect(isMentorDeactivatedError(new ApiError(403, MSG))).toBe(true);
  });

  it("ignores other 403s and other statuses", () => {
    expect(isMentorDeactivatedError(new ApiError(403, "Forbidden"))).toBe(
      false,
    );
    expect(isMentorDeactivatedError(new ApiError(500, MSG))).toBe(false);
    expect(isMentorDeactivatedError(null)).toBe(false);
  });
});
