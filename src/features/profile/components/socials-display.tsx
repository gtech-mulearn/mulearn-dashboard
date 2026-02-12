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
import { Check, Pencil, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  FaFacebook,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaMedium,
  FaStackOverflow,
} from "react-icons/fa";
import { FaBehance, FaDribbble, FaXTwitter } from "react-icons/fa6";
import { toast } from "sonner";
import Loader from "@/app/loading";
import { updateSocials } from "../api";
import { useSocials } from "../hooks";
import { profileKeys } from "../hooks/query-keys";

interface SocialsDisplayProps {
  isOwnProfile: boolean;
}

const socialLinks = [
  {
    key: "github",
    icon: FaGithub,
    baseUrl: "https://github.com/",
    placeholder: "GitHub username",
    color: "#333",
  },
  {
    key: "linkedin",
    icon: FaLinkedin,
    baseUrl: "https://linkedin.com/in/",
    placeholder: "LinkedIn username",
    color: "#0077B5",
  },
  {
    key: "twitter",
    icon: FaXTwitter,
    baseUrl: "https://x.com/",
    placeholder: "X (Twitter) username",
    color: "#000",
  },
  {
    key: "instagram",
    icon: FaInstagram,
    baseUrl: "https://instagram.com/",
    placeholder: "Instagram username",
    color: "#E4405F",
  },
  {
    key: "facebook",
    icon: FaFacebook,
    baseUrl: "https://facebook.com/",
    placeholder: "Facebook username",
    color: "#1877F2",
  },
  {
    key: "behance",
    icon: FaBehance,
    baseUrl: "https://behance.net/",
    placeholder: "Behance username",
    color: "#1769FF",
  },
  {
    key: "dribble",
    icon: FaDribbble,
    baseUrl: "https://dribbble.com/",
    placeholder: "Dribbble username",
    color: "#EA4C89",
  },
  {
    key: "stackoverflow",
    icon: FaStackOverflow,
    baseUrl: "https://stackoverflow.com/users/",
    placeholder: "Stack Overflow user ID",
    color: "#F48024",
  },
  {
    key: "medium",
    icon: FaMedium,
    baseUrl: "https://medium.com/@",
    placeholder: "Medium username",
    color: "#000",
  },
];

type SocialFormValues = {
  github: string;
  linkedin: string;
  twitter: string;
  instagram: string;
  facebook: string;
  behance: string;
  dribble: string;
  stackoverflow: string;
  medium: string;
};

export function SocialsDisplay({ isOwnProfile }: SocialsDisplayProps) {
  const { data: socials, isLoading } = useSocials();
  const queryClient = useQueryClient();

  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formValues, setFormValues] = useState<SocialFormValues>({
    github: "",
    linkedin: "",
    twitter: "",
    instagram: "",
    facebook: "",
    behance: "",
    dribble: "",
    stackoverflow: "",
    medium: "",
  });

  // Initialize form with current values
  useEffect(() => {
    if (socials) {
      setFormValues({
        github: socials.github || "",
        linkedin: socials.linkedin || "",
        twitter: socials.twitter || "",
        instagram: socials.instagram || "",
        facebook: socials.facebook || "",
        behance: socials.behance || "",
        dribble: socials.dribble || "",
        stackoverflow: socials.stackoverflow || "",
        medium: socials.medium || "",
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
        twitter: socials.twitter || "",
        instagram: socials.instagram || "",
        facebook: socials.facebook || "",
        behance: socials.behance || "",
        dribble: socials.dribble || "",
        stackoverflow: socials.stackoverflow || "",
        medium: socials.medium || "",
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
        <h3 className="font-semibold text-gray-900">Connect with me</h3>
        {isOwnProfile && (
          <div className="flex gap-2">
            {!editMode ? (
              <button
                type="button"
                onClick={() => setEditMode(true)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-[#456ff6] transition-colors hover:bg-blue-100"
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
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-500 transition-colors hover:bg-red-100"
                  title="Cancel"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-green-50 text-green-600 transition-colors hover:bg-green-100"
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
              const value = formValues[link.key as keyof SocialFormValues];
              const Icon = link.icon;
              return (
                <a
                  key={link.key}
                  href={`${link.baseUrl}${value}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-all hover:scale-110"
                  style={{ color: link.color }}
                  title={link.key}
                >
                  <Icon className="h-5 w-5" />
                </a>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
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
            const value = formValues[link.key as keyof SocialFormValues];
            return (
              <div key={link.key} className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100"
                  style={{ color: link.color }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder={link.placeholder}
                  value={value}
                  onChange={(e) =>
                    handleChange(
                      link.key as keyof SocialFormValues,
                      e.target.value,
                    )
                  }
                  className="flex-1 border-b border-blue-200 bg-transparent py-1 text-sm outline-none placeholder:text-gray-400 focus:border-[#456ff6]"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
