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
import { Textarea } from "@/components/ui/textarea";
import { useUpdateMentorProfile } from "@/features/mentor/onboarding/hooks/use-onboarding";
import type { MentorApplication } from "@/features/mentor/onboarding/schemas";
import { useUpdateProfile, useUpdateProfileImage } from "@/features/profile";
import type { UserProfile } from "@/features/profile/schemas";

const MentorEditSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required"),
  about: z.string().trim().optional(),
  expertise: z.string().trim().optional(),
  profile_pic: z.any().optional(),
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

  const form = useForm<MentorEditValues>({
    resolver: zodResolver(MentorEditSchema) as any,
    defaultValues: {
      full_name: userProfile.full_name ?? "",
      about: mentorProfile.about ?? "",
      expertise: mentorProfile.expertise ?? "",
      profile_pic: undefined,
    },
  });

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      form.reset({
        full_name: userProfile.full_name ?? "",
        about: mentorProfile.about ?? "",
        expertise: mentorProfile.expertise ?? "",
        profile_pic: undefined,
      });
      setPreviewUrl(null);
    }
  }, [
    open,
    userProfile.full_name,
    mentorProfile.about,
    mentorProfile.expertise,
    form,
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    form.setValue("profile_pic", file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleSubmit = async (values: MentorEditValues) => {
    try {
      // 1. Update learner profile fields (name)
      const [firstName, ...lastParts] = (values.full_name ?? "").split(" ");
      await updateProfileMutation.mutateAsync({
        first_name: firstName?.trim() ?? "",
        last_name: lastParts.join(" ").trim(),
        full_name: values.full_name ?? "",
      });

      // 2. Update mentor profile fields (about, expertise)
      await updateMentorProfileMutation.mutateAsync({
        about: values.about ?? "",
        expertise: values.expertise ?? "",
      });

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
                    unoptimized
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

            {/* Expertise tags */}
            <FormField
              control={form.control as any}
              name="expertise"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expertise</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. React, Python, Machine Learning"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Enter comma-separated skills or topics you can mentor in.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
