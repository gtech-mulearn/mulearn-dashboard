/**
 * Profile Sidebar Component
 *
 * 📍 src/features/profile/components/profile-sidebar.tsx
 *
 * Clean sidebar with settings, socials, and roles.
 */

"use client";

import { ChevronRight, Settings } from "lucide-react";
import type { UserProfile } from "../schemas";
import { ProfileSettings } from "./profile-settings";
import { RolesDisplay } from "./roles-display";
import { SocialsDisplay } from "./socials-display";

interface ProfileSidebarProps {
  profile: UserProfile;
  isOwnProfile: boolean;
  onAccountSettings?: () => void;
}

export function ProfileSidebar({
  profile,
  isOwnProfile,
  onAccountSettings,
}: ProfileSidebarProps) {
  return (
    <div className="space-y-4">
      {/* Quick Actions - Only for own profile */}
      {isOwnProfile && (
        <div className="rounded-2xl bg-white shadow-sm">
          <div className="p-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Quick Actions
            </h3>
            <div className="space-y-1">
              <button
                type="button"
                onClick={onAccountSettings}
                className="flex w-full items-center justify-between rounded-xl p-3 text-left transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                    <Settings className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Account Settings
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Visibility */}
      {isOwnProfile && (
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <ProfileSettings isPublic={profile.is_public} />
        </div>
      )}

      {/* Socials */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <SocialsDisplay isOwnProfile={isOwnProfile} />
      </div>

      {/* Roles */}
      {profile.roles.length > 0 && (
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <RolesDisplay roles={profile.roles} />
        </div>
      )}
    </div>
  );
}
