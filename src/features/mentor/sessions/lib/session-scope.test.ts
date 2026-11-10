import { describe, expect, it } from "vitest";
import { scopeLabel, scopeOptions, sessionTypeForScope } from "./session-scope";

describe("sessionTypeForScope", () => {
  it("maps each mentor grant to the session type it can create", () => {
    expect(sessionTypeForScope("IG_MENTOR")).toBe("IG_SESSION");
    expect(sessionTypeForScope("CAMPUS_MENTOR")).toBe("CAMPUS_SESSION");
    expect(sessionTypeForScope("COMPANY_MENTOR")).toBe("COMPANY_SESSION");
    expect(sessionTypeForScope("X")).toBeNull();
  });
});

describe("scopeOptions", () => {
  it("offers one option per grant and drops unknown or duplicate scopes", () => {
    expect(
      scopeOptions([
        { scope_type: "IG_MENTOR", scope_id: "ig1" },
        { scope_type: "CAMPUS_MENTOR", scope_id: "org1" },
        { scope_type: "CAMPUS_MENTOR", scope_id: "org1" },
        { scope_type: "SOMETHING", scope_id: "z" },
      ]),
    ).toEqual([
      { value: "IG_MENTOR:ig1", scopeType: "IG_MENTOR", entityId: "ig1" },
      {
        value: "CAMPUS_MENTOR:org1",
        scopeType: "CAMPUS_MENTOR",
        entityId: "org1",
      },
    ]);
  });

  it("offers a global mentor any interest group (picked separately)", () => {
    expect(scopeOptions([{ scope_type: "MENTOR", scope_id: "" }])).toEqual([
      { value: "MENTOR", scopeType: "MENTOR", entityId: "" },
    ]);
  });
});

describe("scopeLabel", () => {
  const context = {
    igs: [{ id: "ig1", name: "Web Development" }],
    applications: [{ org: "org1", company: "GEC Thrissur" }],
  };

  it("names IG, campus and company scopes", () => {
    expect(
      scopeLabel(
        { value: "IG_MENTOR:ig1", scopeType: "IG_MENTOR", entityId: "ig1" },
        context,
      ),
    ).toBe("Web Development · Interest group");
    expect(
      scopeLabel(
        {
          value: "CAMPUS_MENTOR:org1",
          scopeType: "CAMPUS_MENTOR",
          entityId: "org1",
        },
        context,
      ),
    ).toBe("GEC Thrissur · Campus");
    expect(
      scopeLabel(
        {
          value: "COMPANY_MENTOR:org9",
          scopeType: "COMPANY_MENTOR",
          entityId: "org9",
        },
        context,
      ),
    ).toBe("Your company · Company");
  });
});
