/**
 * Profile Mutations
 *
 * 📍 src/features/profile/hooks/use-profile-mutations.ts
 *
 * Mutation hooks for profile updates with cache invalidation.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  togglePublicProfile,
  updateProfileImage,
  updateSocials,
  updateUserPreferences,
} from "../api";
import type { Socials, UserPreferences } from "../schemas";
import { profileKeys } from "./query-keys";
import { authKeys } from "@/features/auth/hooks/query-keys";

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
    onError: () => {
      toast.error("Failed to update profile visibility");
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
    onError: () => {
      toast.error("Failed to update social links");
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
    onError: () => {
      toast.error("Failed to update preferences");
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
    mutationFn: (imageUrl: string) => updateProfileImage(imageUrl),
    onSuccess: () => {
      // Invalidate both profile and user info caches
      queryClient.invalidateQueries({ queryKey: profileKeys.profile() });
      queryClient.invalidateQueries({ queryKey: authKeys.userInfo() });
      toast.success("Profile image updated");
    },
    onError: () => {
      toast.error("Failed to update profile image");
    },
  });
}
