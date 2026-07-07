"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { ProfileEditFormValues } from "../../schemas";

export function StepLegal() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ProfileEditFormValues>();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Legal &amp; Verification
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Provide your company&apos;s legal details for verification purposes.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <p className="text-sm font-medium text-foreground">Legal Name</p>
          <Input
            {...register("legal_name")}
            className="rounded-xl border-border bg-background"
            placeholder="e.g. Acme Corporation Pvt. Ltd."
          />
          {errors.legal_name?.message && (
            <p className="text-xs text-destructive">
              {errors.legal_name.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            Registration Number
          </p>
          <Input
            {...register("registration_number")}
            className="rounded-xl border-border bg-background"
            placeholder="e.g. U72900KL2020PTC012345"
          />
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            Tax ID / GST Number
          </p>
          <Input
            {...register("tax_id")}
            className="rounded-xl border-border bg-background"
            placeholder="e.g. 29ABCDE1234F1Z5"
          />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <p className="text-sm font-medium text-foreground">
            Verification Document URL
          </p>
          <Input
            {...register("verification_document_url")}
            disabled
            className="rounded-xl border-border bg-background/50 text-muted-foreground"
            placeholder="https://docs.example.com/certificate.pdf"
          />
          <p className="text-xs text-muted-foreground">
            Document URL (cannot be changed)
          </p>
        </div>
      </div>
    </div>
  );
}
