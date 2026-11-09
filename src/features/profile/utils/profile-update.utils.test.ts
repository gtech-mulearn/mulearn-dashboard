import { describe, expect, it } from "vitest";
import type {
  EditableProfile,
  EditProfileFormValues,
  UserProfile,
} from "../schemas";
import { buildProfileUpdate } from "./profile-update.utils";

const profile = {
  full_name: "Asha Nair",
  email: "new@example.com",
  mobile: "9876543210",
  gender: "Female",
  dob: "2000-01-01",
  org_district_id: "d-1",
} as unknown as UserProfile;

// A tab opened before the email was changed in Account settings still holds
// the old address.
const staleEditable = {
  full_name: "Asha Nair",
  email: "old@example.com",
  mobile: "9876543210",
  gender: "Female",
  dob: "2000-01-01",
  district: { id: "d-1" },
  communities: [],
} as unknown as EditableProfile;

const form = {
  full_name: "Asha N",
  email: "old@example.com",
} as unknown as EditProfileFormValues;

describe("buildProfileUpdate", () => {
  it("never sends the email, so a stale tab cannot revert a verified change", () => {
    const body = buildProfileUpdate(
      form,
      { full_name: true },
      staleEditable,
      profile,
    );
    expect(body).not.toBeNull();
    expect(body).not.toHaveProperty("email");
    expect(body?.full_name).toBe("Asha N");
  });

  it("sends nothing when no profile field changed", () => {
    expect(
      buildProfileUpdate(form, { profile_pic: true }, staleEditable, profile),
    ).toBeNull();
  });
});
