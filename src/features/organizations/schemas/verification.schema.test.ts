import { describe, expect, it } from "vitest";
import {
  toVerifyOrgPayload,
  UnverifiedOrgItemSchema,
  VerifyOrgFormSchema,
} from "./verification.schema";

// Mirrors UnverifiedOrganizationsSerializer
// (mulearnbackend/api/dashboard/organisation/serializers.py).
const row = {
  id: "3f2504e0-4f89-41d3-9a0c-0305e82c3301",
  title: "Govt. Engineering College, Somewhere",
  org_type: "College",
  graduation_year: 2027,
  department: "Computer Science",
  created_by: "Ravi",
  created_by_muid: "ravi@mulearn",
  created_by_email: "ravi@example.com",
  created_at: "2026-09-24T11:00:00Z",
};

describe("UnverifiedOrgItemSchema", () => {
  it("keeps the submitter contact fields", () => {
    const parsed = UnverifiedOrgItemSchema.safeParse(row);
    expect(parsed.success && parsed.data.created_by_muid).toBe("ravi@mulearn");
  });

  it("accepts a row whose department is null (DRF omits the key)", () => {
    const { department: _omitted, ...noDepartment } = row;
    expect(UnverifiedOrgItemSchema.safeParse(noDepartment).success).toBe(true);
  });

  it("accepts a row from a backend without the contact fields", () => {
    const { created_by_muid: _muid, created_by_email: _email, ...legacy } = row;
    expect(UnverifiedOrgItemSchema.safeParse(legacy).success).toBe(true);
  });
});

describe("VerifyOrgFormSchema", () => {
  it("requires an organization to approve", () => {
    expect(VerifyOrgFormSchema.safeParse({ verified: true }).success).toBe(
      false,
    );
  });

  it("approves with an organization", () => {
    expect(
      VerifyOrgFormSchema.safeParse({ verified: true, org_id: "org-1" })
        .success,
    ).toBe(true);
  });

  it("rejects without an organization", () => {
    expect(VerifyOrgFormSchema.safeParse({ verified: false }).success).toBe(
      true,
    );
  });
});

describe("toVerifyOrgPayload", () => {
  it("never sends an org with a rejection, even if one was picked", () => {
    expect(toVerifyOrgPayload("reject", "org-1")).toEqual({ verified: false });
  });

  it("sends the trimmed org with an approval", () => {
    expect(toVerifyOrgPayload("approve", "  org-1 ")).toEqual({
      verified: true,
      org_id: "org-1",
    });
  });
});
