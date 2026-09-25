import { describe, expect, it } from "vitest";
import {
  parseVerificationTab,
  VERIFICATION_TABS,
  verificationTabHref,
} from "./tabs";

describe("parseVerificationTab", () => {
  it.each(VERIFICATION_TABS)("accepts %s", (tab) => {
    expect(parseVerificationTab(tab)).toBe(tab);
  });

  it("is case-insensitive, so hand-typed links still work", () => {
    expect(parseVerificationTab("Company")).toBe("company");
  });

  it.each([
    null,
    undefined,
    "",
    "roster",
    "manage-companies",
  ])("falls back to mentor for %j", (value) => {
    expect(parseVerificationTab(value)).toBe("mentor");
  });
});

describe("verificationTabHref", () => {
  it("deep-links to the unified page", () => {
    expect(verificationTabHref("college")).toBe(
      "/dashboard/management/role-verification?tab=college",
    );
  });
});
