/**
 * Mentor Edit Profile Modal
 *
 * 📍 src/features/mentor/profile/components/mentor-edit-profile-modal.tsx
 *
 * Mentor-specific edit form. Drops college/state/district/department fields.
 * Allows editing: photo, name, bio (about), expertise (tags), preferred IGs.
 * Shows read-only: tier, verification status, hours.
 */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import { TagInput } from "@/components/ui/tag-input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useInterestGroupsList } from "@/features/home/hooks";
import { useUpdateMentorProfile } from "@/features/mentor/onboarding/hooks/use-onboarding";
import type {
  MentorApplication,
  OnboardingFormValues,
} from "@/features/mentor/onboarding/schemas";
import { useUpdateProfile, useUpdateProfileImage } from "@/features/profile";
import type { UserProfile } from "@/features/profile/schemas";

const MentorEditSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required"),
  about: z.string().trim().optional(),
  expertise: z.array(z.string()).optional(),
  preferred_ig_ids: z.array(z.string()).optional(),
  org: z.string().optional(),
  profile_pic: z.instanceof(File).optional(),
});

type MentorEditValues = z.infer<typeof MentorEditSchema>;

interface MentorEditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userProfile: UserProfile;
  mentorProfile: MentorApplication;
  onSaved?: () => void;
}

export function MentorEditProfileModal({
  open,
  onOpenChange,
  userProfile,
  mentorProfile,
  onSaved,
}: MentorEditProfileModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const updateProfileMutation = useUpdateProfile();
  const updateProfileImageMutation = useUpdateProfileImage();
  const updateMentorProfileMutation = useUpdateMentorProfile();

  const isPending =
    updateProfileMutation.isPending ||
    updateProfileImageMutation.isPending ||
    updateMentorProfileMutation.isPending;

  const { data: igList = [] } = useInterestGroupsList();
  const igOptions = igList.map((ig) => ({ value: ig.id, label: ig.name }));

  const form = useForm<MentorEditValues>({
    resolver: zodResolver(MentorEditSchema) as any,
    defaultValues: {
      full_name: userProfile.full_name ?? "",
      about: mentorProfile.about ?? "",
      expertise: mentorProfile.expertise
        ? mentorProfile.expertise
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      preferred_ig_ids: mentorProfile.preferred_ig_ids ?? [],
      org: mentorProfile.org ?? "",
      profile_pic: undefined,
    },
  });

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      form.reset({
        full_name: userProfile.full_name ?? "",
        about: mentorProfile.about ?? "",
        expertise: mentorProfile.expertise
          ? mentorProfile.expertise
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        preferred_ig_ids: mentorProfile.preferred_ig_ids ?? [],
        org: mentorProfile.org ?? "",
        profile_pic: undefined,
      });
      setPreviewUrl(null);
    }
  }, [
    open,
    userProfile.full_name,
    mentorProfile.about,
    mentorProfile.expertise,
    mentorProfile.preferred_ig_ids,
    mentorProfile.org,
    form,
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    form.setValue("profile_pic", file, { shouldDirty: true });
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleSubmit = async (values: MentorEditValues) => {
    try {
      // 1. Update learner profile fields (name) if changed
      if (values.full_name !== userProfile.full_name) {
        const [firstName, ...lastParts] = (values.full_name ?? "").split(" ");
        await updateProfileMutation.mutateAsync({
          first_name: firstName?.trim() ?? "",
          last_name: lastParts.join(" ").trim(),
          full_name: values.full_name ?? "",
        });
      }

      // 2. Update mentor profile fields if changed
      const newExpertise = values.expertise?.join(", ") ?? "";
      const isAboutChanged = values.about !== (mentorProfile.about ?? "");
      const isExpertiseChanged =
        newExpertise !== (mentorProfile.expertise ?? "");
      const isIgsChanged =
        JSON.stringify(values.preferred_ig_ids ?? []) !==
        JSON.stringify(mentorProfile.preferred_ig_ids ?? []);

      if (isAboutChanged || isExpertiseChanged || isIgsChanged) {
        const payload: Partial<OnboardingFormValues> = {};
        if (isAboutChanged) payload.about = values.about ?? "";
        if (isExpertiseChanged) payload.expertise = newExpertise;
        if (isIgsChanged) payload.preferred_ig_ids = values.preferred_ig_ids;

        await updateMentorProfileMutation.mutateAsync(payload);
      }

      // 3. Update profile photo if changed
      if (values.profile_pic instanceof File) {
        await updateProfileImageMutation.mutateAsync({
          profilePic: values.profile_pic,
          userId: userProfile.id,
        });
      }

      toast.success("Profile updated successfully!");
      onOpenChange(false);
      onSaved?.();
    } catch {
      // Individual mutation hooks surface their own toasts
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Mentor Profile</DialogTitle>
          <DialogDescription>
            Update your public-facing mentor profile. Tier and verification
            status can only be changed by an admin.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit as any)}
            className="space-y-5"
          >
            {/* Profile photo */}
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl border bg-muted">
                {previewUrl || userProfile.profile_pic ? (
                  <Image
                    src={
                      previewUrl ?? `${userProfile.profile_pic}?${Date.now()}`
                    }
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-muted-foreground">
                    {userProfile.full_name?.charAt(0) ?? "?"}
                  </div>
                )}
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change Photo
                </Button>
                {previewUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-2 text-destructive hover:text-destructive"
                    onClick={() => {
                      setPreviewUrl(null);
                      form.setValue("profile_pic", undefined);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    <X className="mr-1 h-3.5 w-3.5" />
                    Remove
                  </Button>
                )}
              </div>
            </div>

            {/* Name */}
            <FormField
              control={form.control as any}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bio */}
            <FormField
              control={form.control as any}
              name="about"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell mentees about yourself, your experience, and what you can help with..."
                      className="min-h-[100px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Minimum 50 characters recommended.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Expertise tags (without FormField, plain labels to avoid FormField generic errors with TagInput) */}
            <div className="space-y-2">
              <div className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Expertise
              </div>
              <TagInput
                value={form.watch("expertise") ?? []}
                onChange={(tags) =>
                  form.setValue("expertise", tags, { shouldDirty: true })
                }
                placeholder="e.g. React, Python (press Enter)"
              />
              <p className="text-[0.8rem] text-muted-foreground">
                Enter comma-separated skills or topics you can mentor in.
              </p>
            </div>

            {/* Preferred IGs */}
            <div className="space-y-2">
              <div className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Preferred Interest Groups
              </div>
              <MultiSelect
                options={igOptions}
                value={form.watch("preferred_ig_ids") ?? []}
                onChange={(vals) =>
                  form.setValue("preferred_ig_ids", vals, { shouldDirty: true })
                }
                placeholder="Select IGs you want to mentor in..."
              />
            </div>

            {/* Affiliation */}
            <div className="space-y-2">
              <div className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Company / Campus Affiliation
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Input
                        value={form.watch("org") ?? ""}
                        placeholder="Affiliation"
                        disabled
                        className="cursor-not-allowed"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Affiliation editing coming soon.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Read-only: Tier */}
            {mentorProfile.mentor_tier && (
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-foreground">
                  Mentor Tier
                </p>
                <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
                  <span className="text-sm capitalize text-muted-foreground">
                    {mentorProfile.mentor_tier}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tier is set by an admin and cannot be self-edited.
                </p>
              </div>
            )}

            {/* Read-only: Hours */}
            {typeof mentorProfile.hours === "number" && (
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-foreground">
                  Accumulated Hours
                </p>
                <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
                  <span className="text-sm text-muted-foreground">
                    {mentorProfile.hours} hrs (system-calculated)
                  </span>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
