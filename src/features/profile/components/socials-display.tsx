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
import {
  Check,
  Dribbble,
  Facebook,
  Github,
  Instagram,
  Linkedin,
  Pencil,
  X,
} from "lucide-react";
import type { ElementType, SVGProps } from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Loader from "@/app/loading";
import { updateSocials } from "../api";
import { useSocials } from "../hooks";
import { profileKeys } from "../hooks/query-keys";

interface SocialsDisplayProps {
  isOwnProfile: boolean;
}

type SocialIcon = ElementType<{ className?: string }>;

const _XTwitterLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M13.7 10.6 20.4 3h-1.6l-5.8 6.6L8.4 3H3l7 10-7 8h1.6l6.1-7 4.9 7H21l-7.3-10.4Zm-2.2 2.5-.7-1L5.2 4.2h2.4l4.5 6.4.7 1 5.9 8.4h-2.4l-4.8-6.9Z" />
  </svg>
);

const BehanceLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M3 6h6.1c2.3 0 3.7 1.2 3.7 3.1 0 1.1-.5 2-1.5 2.5 1.3.4 2 1.4 2 2.9 0 2.2-1.7 3.5-4.3 3.5H3V6Zm3 4.7h2.5c.9 0 1.4-.4 1.4-1.1s-.5-1.1-1.4-1.1H6v2.2Zm0 4.8h2.8c1 0 1.6-.4 1.6-1.3 0-.8-.6-1.2-1.6-1.2H6v2.5Z" />
    <path d="M15.1 7h5.6v1.6h-5.6V7Zm2.9 3.2c2.5 0 4 1.8 4 4.3v.7h-5.9c.2.9.9 1.5 1.9 1.5.8 0 1.3-.3 1.7-.9h2.1c-.6 1.7-2 2.6-3.8 2.6-2.5 0-4.1-1.7-4.1-4.1s1.6-4.1 4.1-4.1Zm1.8 3.4c-.1-.9-.8-1.5-1.8-1.5-.9 0-1.6.6-1.8 1.5h3.6Z" />
  </svg>
);

const StackOverflowLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="m17.6 19.2.1-5h1.8l-.1 6.8H4.5v-6.8h1.8v5h11.3Z" />
    <path d="M8.1 17.2h7.8v-1.8H8.1v1.8Zm.2-4 7.6 1.6.4-1.8-7.6-1.6-.4 1.8Zm1-3.8 7 3.3.8-1.6-7-3.3-.8 1.6Zm2-3.5 5.9 5.1 1.2-1.4-5.9-5.1-1.2 1.4Zm3.8-3.7-1.5 1 4.3 6.5 1.5-1-4.3-6.5Z" />
  </svg>
);

const MediumLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <ellipse cx="7.4" cy="12" rx="4.4" ry="6.4" />
    <ellipse cx="15" cy="12" rx="2.2" ry="5.9" />
    <ellipse cx="19.3" cy="12" rx="1" ry="5.4" />
  </svg>
);

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
  {
    key: "facebook",
    icon: Facebook,
    baseUrl: "https://facebook.com/",
    placeholder: "Facebook username",
    color: "#1877F2",
  },
  {
    key: "behance",
    icon: BehanceLogo,
    baseUrl: "https://behance.net/",
    placeholder: "Behance username",
    color: "#1769FF",
  },
  {
    key: "dribble",
    icon: Dribbble,
    baseUrl: "https://dribbble.com/",
    placeholder: "Dribbble username",
    color: "#EA4C89",
  },
  {
    key: "stackoverflow",
    icon: StackOverflowLogo,
    baseUrl: "https://stackoverflow.com/users/",
    placeholder: "Stack Overflow user ID",
    color: "#F48024",
  },
  {
    key: "medium",
    icon: MediumLogo,
    baseUrl: "https://medium.com/@",
    placeholder: "Medium username",
    color: "#000",
  },
];

type SocialFormValues = {
  github: string;
  linkedin: string;
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
