"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCompanyProfile } from "@/features/company-jobs/hooks/use-company-profile";
import { ProfileStepper } from "@/features/company-profile";

function ProfileEditContent() {
  const { profile, isLoading } = useCompanyProfile();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!profile) return null;

  return <ProfileStepper profile={profile} />;
}

export function EditProfilePageClient() {
  return (
    <div className="space-y-6 px-1 py-1 sm:px-2">
      <div className="flex items-start gap-3 sm:items-center">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="mt-0.5 shrink-0 gap-1.5 text-muted-foreground sm:mt-0"
        >
          <Link href="/dashboard/profile">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Edit Company Profile
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Update your company information across 4 sections
          </p>
        </div>
      </div>

      <ProfileEditContent />
    </div>
  );
}
