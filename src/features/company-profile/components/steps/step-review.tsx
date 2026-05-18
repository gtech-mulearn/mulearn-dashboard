"use client";

/**
 * StepReview — Step 5: Read-only summary of all form values before submission
 *
 * 📍 src/features/company-profile/components/steps/step-review.tsx
 */

import { useFormContext, useWatch } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import type { ProfileEditFormValues } from "../../schemas";

function ReviewRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <span className="min-w-[160px] text-sm font-medium text-muted-foreground shrink-0">
        {label}
      </span>
      <span className="text-sm text-foreground break-all">
        {value ?? <span className="italic text-muted-foreground">—</span>}
      </span>
    </div>
  );
}

function ReviewSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground border-b pb-1">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function TagList({ items }: { items: string[] | null | undefined }) {
  if (!items || items.length === 0) {
    return <span className="italic text-muted-foreground text-sm">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <Badge key={item} variant="secondary">
          {item}
        </Badge>
      ))}
    </div>
  );
}

export function StepReview() {
  const form = useFormContext<ProfileEditFormValues>();
  const values = useWatch({ control: form.control }) as ProfileEditFormValues;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Review &amp; Save
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Review your changes before saving. Click Back to edit any section.
        </p>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <ReviewSection title="Basic Info">
          <ReviewRow label="Company Name" value={values.name || null} />
          <ReviewRow label="Slug" value={values.slug || null} />
          <ReviewRow label="Description" value={values.description || null} />
          <ReviewRow
            label="Industry / Sector"
            value={values.industry_sector ?? null}
          />
          <ReviewRow label="Company Size" value={values.company_size ?? null} />
          <ReviewRow
            label="Founded Year"
            value={values.founded_year?.toString() ?? null}
          />
          <ReviewRow label="Location" value={values.location ?? null} />
        </ReviewSection>

        {/* Contact */}
        <ReviewSection title="Contact &amp; Links">
          <ReviewRow label="Email" value={values.email ?? null} />
          <ReviewRow label="Website" value={values.website_link ?? null} />
          <ReviewRow label="LinkedIn" value={values.linkedin_url ?? null} />
        </ReviewSection>

        {/* Legal */}
        <ReviewSection title="Legal &amp; Verification">
          <ReviewRow label="Legal Name" value={values.legal_name ?? null} />
          <ReviewRow
            label="Registration No."
            value={values.registration_number ?? null}
          />
          <ReviewRow label="Tax ID" value={values.tax_id ?? null} />
          <ReviewRow
            label="Verification Doc"
            value={values.verification_document_url ?? null}
          />
        </ReviewSection>

        {/* Culture */}
        <ReviewSection title="Culture &amp; Brand">
          <ReviewRow
            label="Remote Policy"
            value={values.remote_policy ?? null}
          />
          <ReviewRow
            label="Culture &amp; Values"
            value={values.culture_text ?? null}
          />
          <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
            <span className="min-w-[160px] text-sm font-medium text-muted-foreground shrink-0">
              Tech Stack
            </span>
            <TagList items={values.tech_stack} />
          </div>
          <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
            <span className="min-w-[160px] text-sm font-medium text-muted-foreground shrink-0">
              Perks &amp; Benefits
            </span>
            <TagList items={values.perks} />
          </div>
        </ReviewSection>
      </div>
    </div>
  );
}
