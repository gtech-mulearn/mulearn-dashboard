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
import { type Resolver, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
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
import { useInterestGroupsList } from "@/features/home/hooks";
import {
  useChangeCompany,
  useUpdateMentorProfile,
} from "@/features/mentor/onboarding/hooks/use-onboarding";
import type {
  MentorApplication,
  MentorProfileWrite,
} from "@/features/mentor/onboarding/schemas";
import { useCompanies } from "@/features/onboarding/hooks";
import { useUpdateProfile, useUpdateProfileImage } from "@/features/profile";
import type { UserProfile } from "@/features/profile/schemas";
import {
  MAX_IMAGE_UPLOAD_LABEL,
  validateImageFile,
} from "@/lib/constants/upload";

const baseMentorEditSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required"),
  about: z.string().trim().optional(),
  // Edit form: expertise is optional and must NOT hard-block saving other
  // fields. The form initializes this to an array (never undefined), so a
  // `.min(3)` here silently invalidated the whole form for any mentor onboarded
  // with fewer than 3 skills — making "Save" do nothing. The onboarding form
  // keeps its own min(3) quality bar for new applicants.
  expertise: z.array(z.string()).optional(),
  // §2.5: an approved mentor must always mentor at least one Interest Group
  preferred_ig_ids: z
    .array(z.string())
    .min(1, "You must mentor at least one Interest Group"),
  org: z.string().optional(),
  org_reason: z.string().trim().optional(),
  linkedin: z
    .string()
    .trim()
    .regex(
      /^https?:\/\/(www\.)?linkedin\.com\/.*$/,
      "Enter a valid LinkedIn URL",
    )
    .optional()
    .or(z.literal("")),
  profile_pic: z.instanceof(File).optional(),
});

const getMentorEditSchema = (originalOrg: string | undefined | null) =>
  baseMentorEditSchema.superRefine((data, ctx) => {
    if (data.org && data.org !== (originalOrg ?? "") && !data.org_reason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please provide a reason for changing your company.",
        path: ["org_reason"],
      });
    }
  });

type MentorEditValues = z.infer<typeof baseMentorEditSchema>;

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
  const changeCompanyMutation = useChangeCompany();

  const isPending =
    updateProfileMutation.isPending ||
    updateProfileImageMutation.isPending ||
    updateMentorProfileMutation.isPending ||
    changeCompanyMutation.isPending;

  const { data: igList = [] } = useInterestGroupsList();
  const igOptions = igList.map((ig) => ({ value: ig.id, label: ig.name }));
  const { data: companies = [] } = useCompanies();
  const companyOptions = companies.map((c) => ({ id: c.id, title: c.title }));

  const form = useForm<MentorEditValues>({
    resolver: zodResolver(
      getMentorEditSchema(mentorProfile.org),
    ) as Resolver<MentorEditValues>,
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
      org_reason: "",
      linkedin: mentorProfile.linkedin ?? mentorProfile.linkedin_url ?? "",
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
        org_reason: "",
        linkedin: mentorProfile.linkedin ?? mentorProfile.linkedin_url ?? "",
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
    mentorProfile.linkedin,
    mentorProfile.linkedin_url,
    form,
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateImageFile(file);
    if (error) {
      toast.error(error);
      e.target.value = "";
      return;
    }

    form.setValue("profile_pic", file, { shouldDirty: true });
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleSubmit = async (values: MentorEditValues) => {
    // IG selection is open to every tier (org and IG scopes coexist). The
    // backend enforces "keep at least one scope" — surfaced via the mutation's
    // error toast — so no tier-specific block is needed here.
    try {
      // 1. Update learner profile fields (name) if changed
      if (values.full_name !== userProfile.full_name) {
        await updateProfileMutation.mutateAsync({
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
      const isLinkedinChanged =
        values.linkedin !==
        (mentorProfile.linkedin ?? mentorProfile.linkedin_url ?? "");

      if (
        isAboutChanged ||
        isExpertiseChanged ||
        isIgsChanged ||
        isLinkedinChanged
      ) {
        const payload: Partial<MentorProfileWrite> = {};
        if (isAboutChanged) payload.about = values.about ?? "";
        if (isExpertiseChanged) payload.expertise = newExpertise;
        if (isIgsChanged) payload.preferred_ig_ids = values.preferred_ig_ids;
        if (isLinkedinChanged) payload.linkedin = values.linkedin ?? "";

        await updateMentorProfileMutation.mutateAsync(payload);
      }

      // 3. Request company affiliation change if org changed
      const isOrgChanged =
        values.org && values.org !== (mentorProfile.org ?? "");
      if (isOrgChanged) {
        await changeCompanyMutation.mutateAsync({
          org_id: values.org as string,
          ...(values.org_reason?.trim()
            ? { reason: values.org_reason.trim() }
            : {}),
        });
      }

      // 4. Update profile photo if changed
      if (values.profile_pic instanceof File) {
        await updateProfileImageMutation.mutateAsync({
          profilePic: values.profile_pic,
          userId: userProfile.id,
        });
      }

      onOpenChange(false);
    } catch {
      // Individual mutation hooks surface their own toasts
    } finally {
      // Re-sync even on partial failure: earlier steps may have persisted
      // before a later one failed, and the parent must not show stale data.
      onSaved?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-0 p-0 max-w-lg">
        <DialogHeader className="shrink-0 px-4 pt-4 pb-3 sm:px-6 sm:pt-6 sm:pb-4">
          <DialogTitle>Edit Mentor Profile</DialogTitle>
          <DialogDescription>
            Update your public-facing mentor profile. Tier and verification
            status can only be changed by an admin.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col min-h-0"
          >
            <div className="overflow-y-auto px-4 py-4 sm:px-6 space-y-5">
              {/* Profile photo */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border bg-muted">
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
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                    >
                      <X className="mr-1 h-3.5 w-3.5" />
                      Remove
                    </Button>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {MAX_IMAGE_UPLOAD_LABEL} · PNG, JPG, GIF, WebP
                  </p>
                </div>
              </div>

              {/* Name */}
              <FormField
                control={form.control}
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

              {/* LinkedIn */}
              <FormField
                control={form.control}
                name="linkedin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://www.linkedin.com/in/username"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Bio */}
              <FormField
                control={form.control}
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

              {/* Preferred IGs — available to every tier. IG mentoring is an
                  orthogonal scope that coexists with any company/campus scope. */}
              <div className="space-y-2">
                <div className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Preferred Interest Groups
                </div>
                <MultiSelect
                  options={igOptions}
                  value={form.watch("preferred_ig_ids") ?? []}
                  onChange={(vals) =>
                    form.setValue("preferred_ig_ids", vals, {
                      shouldDirty: true,
                    })
                  }
                  placeholder="Select IGs you want to mentor in..."
                />
                <p className="text-[0.8rem] text-muted-foreground">
                  Changes to your Interest Groups apply immediately.
                </p>
              </div>

              {/* Affiliation — editable via mentor/change-company/ */}
              <div className="space-y-2">
                <div className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Company
                </div>
                <Combobox
                  options={companyOptions}
                  value={form.watch("org") ?? ""}
                  onValueChange={(val: string) => {
                    form.setValue("org", val, { shouldDirty: true });
                  }}
                  placeholder="Select your company…"
                />
                {/* Show reason field only when org has been changed */}
                {form.watch("org") &&
                  form.watch("org") !== (mentorProfile.org ?? "") && (
                    <FormField
                      control={form.control}
                      name="org_reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reason for change</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Relocating to a new employer"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            This request will be pending admin approval.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
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
            </div>

            <DialogFooter className="shrink-0 px-4 py-4 sm:px-6 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="w-full sm:w-auto"
              >
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
