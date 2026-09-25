import { describe, expect, it } from "vitest";
import { RoleVerificationItemSchema } from "./index";

// Mirrors UserVerificationSerializer.Meta.fields
// (mulearnbackend/api/dashboard/user/dash_user_serializer.py).
const item = {
  id: "0f8fad5b-d9cb-469f-a165-70867728950e",
  user_id: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  full_name: "Asha Enabler",
  muid: "asha@mulearn",
  discord_id: null,
  email: "asha@example.com",
  mobile: null,
  gender: null,
  dob: null,
  joined: "2026-09-20T08:00:00Z",
  created_at: "2026-09-21T09:30:00Z",
  district: null,
  state: null,
  country: null,
  verified: false,
  role_id: "9b2d2c4e-5f1a-4c3b-8d7e-6a5b4c3d2e1f",
  role_title: "Enabler",
  organizations: [],
  interest_groups: [],
  role_profile: { type: "enabler" },
};

describe("RoleVerificationItemSchema", () => {
  it("keeps the role link's own created_at for the Requested column", () => {
    const parsed = RoleVerificationItemSchema.safeParse(item);
    expect(parsed.success).toBe(true);
    expect(parsed.success && parsed.data.created_at).toBe(
      "2026-09-21T09:30:00Z",
    );
  });

  it("accepts a response from a backend that predates created_at", () => {
    const { created_at: _omitted, ...legacy } = item;
    expect(RoleVerificationItemSchema.safeParse(legacy).success).toBe(true);
  });
});
