/**
 * Profile Update Utilities
 *
 * 📍 src/features/profile/utils/profile-update.utils.ts
 *
 * Builds the PATCH body for the Edit Profile modal.
 */

import type {
  EditableProfile,
  EditProfileFormValues,
  UpdateProfileRequest,
  UserProfile,
} from "../schemas";

type DirtyFields = Partial<Record<keyof EditProfileFormValues, boolean>>;

/**
 * The PATCH body for the profile fields the modal changed, or null when none
 * did. Untouched fields fall back to the current values.
 */
export function buildProfileUpdate(
  data: EditProfileFormValues,
  dirtyFields: DirtyFields,
  editableProfile: EditableProfile | undefined,
  profile: UserProfile,
): UpdateProfileRequest | null {
  const hasProfileUpdates = Boolean(
    dirtyFields.full_name ||
      dirtyFields.mobile ||
      dirtyFields.gender ||
      dirtyFields.dob ||
      dirtyFields.district_id ||
      dirtyFields.communities,
  );
  if (!hasProfileUpdates) return null;

  const baseFullName =
    editableProfile?.full_name?.trim() || profile.full_name?.trim() || "";
  const finalFullName = data.full_name?.trim() || baseFullName;

  const baseMobile = editableProfile?.mobile?.trim() || profile.mobile || "";
  const baseGender = editableProfile?.gender?.trim() || profile.gender || "";
  const baseDob = editableProfile?.dob?.trim() || profile.dob || "";
  const baseDistrictId =
    editableProfile?.district?.id || profile.org_district_id || null;
  const baseCommunities = editableProfile?.communities ?? [];

  // No email: it changes only through Account settings (spec A §3.5), and a
  // tab opened before such a change would otherwise send the old address.
  return {
    full_name: finalFullName,
    mobile: data.mobile?.trim() || baseMobile,
    gender: data.gender?.trim() || baseGender,
    dob: data.dob?.trim() || baseDob,
    district_id: dirtyFields.district_id
      ? data.district_id || null
      : baseDistrictId,
    communities: dirtyFields.communities
      ? (data.communities ?? [])
      : baseCommunities,
  };
}
