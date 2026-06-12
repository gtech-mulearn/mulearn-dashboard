/**
 * Socials Display Component
 *
 * 📍 src/features/profile/components/socials-display.tsx
 *
 * Shows user's social media links with inline editing.
 * Card expands vertically when editing.
 */

"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Check, Github, Instagram, Linkedin, Pencil, X } from "lucide-react";
import type { ElementType } from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Loader from "@/app/loading";
import { updateSocials } from "../api";
import { usePublicSocials, useSocials } from "../hooks";
import { profileKeys } from "../hooks/query-keys";

interface SocialsDisplayProps {
  isOwnProfile: boolean;
  /** muid of the profile owner — used to fetch socials on a public profile. */
  muid?: string;
}

type SocialIcon = ElementType<{ className?: string }>;

// TODO: social icon brand colors are per-platform brand identities — leave as-is per design-system exception
const socialLinks: {
  key: keyof SocialFormValues;
  icon: SocialIcon;
  baseUrl: string;
  placeholder: string;
  color: string;
}[] = [
  {
    key: "github",
    icon: Github,
    baseUrl: "https://github.com/",
    placeholder: "GitHub username",
    color: "#333",
  },
  {
    key: "linkedin",
    icon: Linkedin,
    baseUrl: "https://linkedin.com/in/",
    placeholder: "LinkedIn username",
    color: "#0077B5",
  },
  {
    key: "instagram",
    icon: Instagram,
    baseUrl: "https://instagram.com/",
    placeholder: "Instagram username",
    color: "#E4405F",
  },
];

type SocialFormValues = {
  github: string;
  linkedin: string;
  instagram: string;
};

export function SocialsDisplay({ isOwnProfile, muid }: SocialsDisplayProps) {
  // Use the current user's own socials, or the profile owner's PUBLIC socials by
  // muid — never the self endpoint on someone else's profile (that would show
  // the viewer's links instead of the owner's).
  const ownSocials = useSocials(isOwnProfile);
  const publicSocials = usePublicSocials(muid ?? "", !isOwnProfile);
  const { data: socials, isLoading } = isOwnProfile
    ? ownSocials
    : publicSocials;
  const queryClient = useQueryClient();

  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formValues, setFormValues] = useState<SocialFormValues>({
    github: "",
    linkedin: "",
    instagram: "",
  });

  // Initialize form with current values
  useEffect(() => {
    if (socials) {
      setFormValues({
        github: socials.github || "",
        linkedin: socials.linkedin || "",
        instagram: socials.instagram || "",
      });
    }
  }, [socials]);

  const handleChange = (key: keyof SocialFormValues, value: string) => {
    // Validate: only allow alphanumeric, dash, underscore, slash, dot
    if (value && !/^[a-zA-Z0-9-_/.]*$/.test(value)) {
      return;
    }
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSocials(formValues);
      await queryClient.invalidateQueries({ queryKey: profileKeys.socials() });
      setEditMode(false);
      toast.success("Social links updated");
    } catch {
      toast.error("Failed to update social links");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    if (socials) {
      setFormValues({
        github: socials.github || "",
        linkedin: socials.linkedin || "",
        instagram: socials.instagram || "",
      });
    }
    setEditMode(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-16 items-center justify-center">
        <Loader />
      </div>
    );
  }

  // Get only socials that have values (for display mode)
  const activeSocials = socialLinks.filter(
    (link) => formValues[link.key as keyof SocialFormValues],
  );

  return (
    <div className="space-y-3">
      {/* Header with edit/save buttons */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Connect with me</h3>
        {isOwnProfile && (
          <div className="flex gap-2">
            {!editMode ? (
              <button
                type="button"
                onClick={() => setEditMode(true)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20"
                title="Edit"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20"
                  title="Cancel"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-success/10 text-success transition-colors hover:bg-success/20"
                  title="Save"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Display/Edit Mode */}
      {!editMode ? (
        // View mode - show icons horizontally
        activeSocials.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {activeSocials.map((link) => {
              const value = formValues[link.key];
              const Icon = link.icon;
              return (
                <a
                  key={link.key}
                  href={`${link.baseUrl}${value}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted transition-all hover:scale-110"
                  style={{ color: link.color }}
                  title={link.key}
                >
                  <Icon className="h-5 w-5" />
                </a>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {isOwnProfile
              ? "You have not connected any social media to your profile yet."
              : "No social links added yet"}
          </p>
        )
      ) : (
        // Edit mode - expand vertically with inputs
        <div className="space-y-3">
          {socialLinks.map((link) => {
            const Icon = link.icon;
            const value = formValues[link.key];
            return (
              <div key={link.key} className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted"
                  style={{ color: link.color }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder={link.placeholder}
                  value={value}
                  onChange={(e) => handleChange(link.key, e.target.value)}
                  className="flex-1 border-b border-border bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground focus:border-ring"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
