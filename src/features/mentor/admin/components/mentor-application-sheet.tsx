"use client";

import { useQuery } from "@tanstack/react-query";
import { type ReactNode, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatShortDate } from "@/lib/datetime";
import { fetchIgOptions } from "../api/ig-options.api";
import { resolveStatus, statusBadge } from "../lib/status";
import type { MentorApplicationListItem } from "../schemas";

interface MentorApplicationSheetProps {
  application: MentorApplicationListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-0.5 text-sm text-foreground break-words">
        {children || "—"}
      </div>
    </div>
  );
}

export function MentorApplicationSheet({
  application,
  open,
  onOpenChange,
}: MentorApplicationSheetProps) {
  // Same key as the assign dialog and grants sheet, so the IG list is shared.
  const igOptions = useQuery({
    queryKey: ["mentor-assign-ig-options"],
    queryFn: fetchIgOptions,
    enabled: open,
    staleTime: 10 * 60 * 1000,
  });
  const igNameById = useMemo(
    () => new Map((igOptions.data ?? []).map((ig) => [ig.id, ig.name])),
    [igOptions.data],
  );

  if (!application) return null;

  const badge = statusBadge(resolveStatus(application));
  const igNames = (application.preferred_ig_ids ?? []).map(
    (id) => igNameById.get(String(id)) ?? String(id),
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-lg">
        <SheetHeader className="border-b pb-4">
          <SheetTitle>
            {application.user_full_name ||
              application.full_name ||
              "Mentor application"}
          </SheetTitle>
          <SheetDescription>{application.muid ?? ""}</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 p-4">
          <Field label="Status">
            <Badge variant={badge.variant}>{badge.label}</Badge>
          </Field>
          <Field label="Email">
            {application.user_email || application.email}
          </Field>
          <Field label="Tier">{application.mentor_tier}</Field>
          <Field label="Organization">{application.org_name}</Field>
          <Field label="Preferred interest groups">{igNames.join(", ")}</Field>
          <Field label="Reason">{application.reason}</Field>
          <Field label="Verification note">
            {application.verification_note}
          </Field>
          <Field label="Applied">
            {formatShortDate(application.created_at)}
          </Field>
          <Field label="Verified">
            {application.verified_at
              ? formatShortDate(application.verified_at)
              : null}
          </Field>
        </div>
      </SheetContent>
    </Sheet>
  );
}
