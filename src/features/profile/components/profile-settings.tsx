/**
 * Profile Settings Component
 *
 * 📍 src/features/profile/components/profile-settings.tsx
 *
 * Toggle switches for profile visibility and work preferences.
 */

"use client";

import Loader from "@/app/loading";
import { Switch } from "@/components/ui/switch";
import {
  useTogglePublicProfile,
  useUpdatePreferences,
  useUserPreferences,
} from "../hooks";

interface ProfileSettingsProps {
  isPublic: boolean | null;
}

export function ProfileSettings({ isPublic }: ProfileSettingsProps) {
  const { data: preferences, isLoading: isLoadingPrefs } = useUserPreferences();
  const togglePublic = useTogglePublicProfile();
  const updatePreferences = useUpdatePreferences();

  const settings = [
    {
      id: "public",
      label: "Public Profile",
      description: "Allow others to view your profile",
      checked: isPublic ?? false,
      onChange: (checked: boolean) => togglePublic.mutate(checked),
      isLoading: togglePublic.isPending,
    },
    {
      id: "work",
      label: "Open to Work",
      description: "Show recruiters you're looking for opportunities",
      checked: preferences?.interested_in_work ?? false,
      onChange: (checked: boolean) =>
        updatePreferences.mutate({ interested_in_work: checked }),
      isLoading: updatePreferences.isPending,
    },
    {
      id: "gigs",
      label: "Open to Gigs",
      description: "Available for freelance work and gigs",
      checked: preferences?.interested_in_gig_work ?? false,
      onChange: (checked: boolean) =>
        updatePreferences.mutate({ interested_in_gig_work: checked }),
      isLoading: updatePreferences.isPending,
    },
  ];

  if (isLoadingPrefs) {
    return <Loader />;
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground">Profile Settings</h3>
      <div className="space-y-3">
        {settings.map((setting) => (
          <div
            key={setting.id}
            className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
          >
            <div>
              <p className="text-sm font-medium text-foreground">
                {setting.label}
              </p>
              <p className="text-xs text-gray-500">{setting.description}</p>
            </div>
            <div className="relative">
              {setting.isLoading && (
                <div className="absolute -left-6 top-1/2 -translate-y-1/2">
                  <Loader />
                </div>
              )}
              <Switch
                checked={setting.checked}
                onCheckedChange={setting.onChange}
                disabled={setting.isLoading}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
