import { describe, expect, it } from "vitest";
import { formatSessionType, upperEnum } from "./enum-casing";

describe("upperEnum", () => {
  const SessionType = upperEnum([
    "IG_SESSION",
    "CAMPUS_SESSION",
    "COMPANY_SESSION",
  ]);

  it("accepts the backend's values in any case", () => {
    expect(SessionType.parse("ig_session")).toBe("IG_SESSION");
    expect(SessionType.parse("COMPANY_SESSION")).toBe("COMPANY_SESSION");
  });

  it("still rejects unknown values", () => {
    expect(SessionType.safeParse("other").success).toBe(false);
  });
});

describe("formatSessionType", () => {
  it("names the session's owner type", () => {
    expect(formatSessionType("COMPANY_SESSION")).toBe("Company");
    expect(formatSessionType("campus_session")).toBe("Campus");
    expect(formatSessionType("IG_SESSION")).toBe("Interest group");
    expect(formatSessionType(null)).toBe("Session");
  });
});
