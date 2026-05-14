"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { ProfileEditFormValues } from "../../schemas";

export function StepContact() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ProfileEditFormValues>();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Contact &amp; Links
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          How can candidates and partners reach your company?
        </p>
      </div>

      <div className="space-y-5">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Email Address</p>
          <Input
            {...register("email")}
            type="email"
            className="rounded-xl border-border bg-background"
            placeholder="contact@yourcompany.com"
          />
          {errors.email?.message && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Website</p>
          <Input
            {...register("website_link")}
            type="url"
            className="rounded-xl border-border bg-background"
            placeholder="https://yourcompany.com"
          />
          {errors.website_link?.message && (
            <p className="text-xs text-destructive">
              {errors.website_link.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">LinkedIn URL</p>
          <Input
            {...register("linkedin_url")}
            type="url"
            className="rounded-xl border-border bg-background"
            placeholder="https://linkedin.com/company/..."
          />
          {errors.linkedin_url?.message && (
            <p className="text-xs text-destructive">
              {errors.linkedin_url.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
