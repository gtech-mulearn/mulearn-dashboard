/**
 * Profile Mutations
 *
 * 📍 src/features/profile/hooks/use-profile-mutations.ts
 *
 * Mutation hooks for profile updates with cache invalidation.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import { authKeys } from "@/features/auth/hooks/query-keys";
import {
  deleteCoverPic,
  issueVC,
  togglePublicProfile,
  updateProfile,
  updateProfileImage,
  updateSocials,
  updateUserPreferences,
  updateVCURL,
  uploadCoverPic,
} from "../api";
import type {
  Socials,
  UpdateProfileRequest,
  UserPreferences,
  VCCredentialInfo,
  VCSubjectInfo,
} from "../schemas";
import { profileKeys } from "./query-keys";

/**
 * Toggle profile public/private status.
 * Invalidates profile cache on success.
 */
export function useTogglePublicProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (isPublic: boolean) =>
      togglePublicProfile({ is_public: isPublic }),
    onSuccess: () => {
      // Invalidate profile to refetch with new status
      queryClient.invalidateQueries({ queryKey: profileKeys.profile() });
      toast.success("Profile visibility updated");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to update profile visibility",
        }),
      );
    },
  });
}

/**
 * Update user's social links.
 * Invalidates socials cache on success.
 */
export function useUpdateSocials() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (socials: Partial<Socials>) => updateSocials(socials),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.socials() });
      toast.success("Social links updated");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to update social links",
        }),
      );
    },
  });
}

/**
 * Update user preferences (work, gigs).
 * Invalidates preferences cache on success.
 */
export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (preferences: Partial<UserPreferences>) =>
      updateUserPreferences(preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.preferences() });
      toast.success("Preferences updated");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to update preferences",
        }),
      );
    },
  });
}

/**
 * Update profile image.
 * Invalidates both profile and user info caches.
 */
export function useUpdateProfileImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      profilePic,
      userId,
    }: {
      profilePic: File;
      userId: string;
    }) => updateProfileImage(profilePic, userId),
    onSuccess: () => {
      // Invalidate both profile and user info caches
      queryClient.invalidateQueries({ queryKey: profileKeys.profile() });
      queryClient.invalidateQueries({
        queryKey: profileKeys.editableProfile(),
      });
      queryClient.invalidateQueries({ queryKey: authKeys.userInfo() });
      toast.success("Profile image updated");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to update profile image",
        }),
      );
    },
  });
}

/**
 * Upload (POST) user's profile cover image.
 * Invalidates profile + all public profile caches so the banner re-renders.
 */
export function useUploadCoverPic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cover: File) => uploadCoverPic(cover),
    onSuccess: (newCoverUrl) => {
      // Optimistically patch the cached profile with the new cover URL
      queryClient.setQueriesData(
        { queryKey: ["profile", "user-profile"] },
        (old: Record<string, unknown> | undefined) => {
          if (!old) return old;
          return { ...old, cover_pic: newCoverUrl };
        },
      );
      // Also invalidate to ensure full consistency
      queryClient.invalidateQueries({ queryKey: profileKeys.profile() });
      queryClient.invalidateQueries({
        queryKey: [...profileKeys.all, "public-profile"],
      });
      toast.success("Cover photo updated");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to update cover photo",
        }),
      );
    },
  });
}

/**
 * Delete user's profile cover image.
 * Invalidates profile + all public profile caches.
 */
export function useDeleteCoverPic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteCoverPic(),
    onSuccess: () => {
      // Optimistically clear cover_pic in the cached profile
      queryClient.setQueriesData(
        { queryKey: ["profile", "user-profile"] },
        (old: Record<string, unknown> | undefined) => {
          if (!old) return old;
          return { ...old, cover_pic: null };
        },
      );
      queryClient.invalidateQueries({ queryKey: profileKeys.profile() });
      queryClient.invalidateQueries({
        queryKey: [...profileKeys.all, "public-profile"],
      });
      toast.success("Cover photo removed");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to remove cover photo",
        }),
      );
    },
  });
}

/** Update profile fields */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileData: UpdateProfileRequest) =>
      updateProfile(profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.profile() });
      queryClient.invalidateQueries({
        queryKey: profileKeys.editableProfile(),
      });
      queryClient.invalidateQueries({ queryKey: authKeys.userInfo() });
      toast.success("Profile updated");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to update profile" }),
      );
    },
  });
}
/**
 * Issue a Verifiable Credential.
 * Issues the VC via QSeverse, then updates the VC URL in the backend.
 * Invalidates profile cache on success.
 */
export function useIssueVCMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      subjectInfo,
      credentialInfo,
      templateId,
      achievementId,
    }: {
      subjectInfo: VCSubjectInfo;
      credentialInfo: VCCredentialInfo;
      templateId: string;
      achievementId: string;
    }) => {
      const result = await issueVC(subjectInfo, credentialInfo, templateId);

      if (result && result.length > 0) {
        const vcUrl = result[0].subject_info.s3_url;
        await updateVCURL(achievementId, vcUrl);
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.profile() });
      toast.success("Verifiable Credential issued successfully!");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to issue Verifiable Credential",
        }),
      );
    },
  });
}
