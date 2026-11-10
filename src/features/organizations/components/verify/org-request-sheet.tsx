"use client";

import {
  Building2,
  Calendar,
  CheckCircle,
  GraduationCap,
  Hash,
  Mail,
  User,
  XCircle,
} from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatShortDate } from "@/lib/datetime";
import type { UnverifiedOrgItem } from "../../schemas/verification.schema";

interface DetailRowProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}

// Same row as the company detail sheet, so the tabs' "View" panels match.
function DetailRow({ icon, label, value }: DetailRowProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div className="mt-0.5 text-sm font-medium text-foreground break-words">
          {value || "—"}
        </div>
      </div>
    </div>
  );
}

interface OrgRequestSheetProps {
  org: UnverifiedOrgItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (org: UnverifiedOrgItem) => void;
  onReject: (org: UnverifiedOrgItem) => void;
}

export function OrgRequestSheet({
  org,
  open,
  onOpenChange,
  onApprove,
  onReject,
}: OrgRequestSheetProps) {
  if (!org) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-lg">
        {/* pr-10 keeps the type badge clear of the close button
            (absolute top-4 right-4). */}
        <SheetHeader className="border-b pb-4 pr-10">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              <SheetTitle className="text-xl font-bold leading-tight">
                {org.title}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Organization request
              </SheetDescription>
            </div>
            <Badge variant="outline">{org.org_type}</Badge>
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Request
            </h3>
            <div className="space-y-3">
              <DetailRow
                icon={<Building2 className="h-4 w-4" />}
                label="Type"
                value={org.org_type}
              />
              <DetailRow
                icon={<GraduationCap className="h-4 w-4" />}
                label="Department"
                value={org.department}
              />
              <DetailRow
                icon={<Calendar className="h-4 w-4" />}
                label="Graduation Year"
                value={org.graduation_year ? String(org.graduation_year) : null}
              />
            </div>
          </section>

          <Separator />

          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Submitted By
            </h3>
            <div className="space-y-3">
              <DetailRow
                icon={<User className="h-4 w-4" />}
                label="Name"
                value={org.created_by}
              />
              <DetailRow
                icon={<Hash className="h-4 w-4" />}
                label="MuID"
                value={org.created_by_muid}
              />
              <DetailRow
                icon={<Mail className="h-4 w-4" />}
                label="Email"
                value={
                  org.created_by_email ? (
                    <a
                      href={`mailto:${org.created_by_email}`}
                      className="text-primary hover:underline"
                    >
                      {org.created_by_email}
                    </a>
                  ) : null
                }
              />
              <DetailRow
                icon={<Calendar className="h-4 w-4" />}
                label="Submitted"
                value={formatShortDate(org.created_at)}
              />
            </div>
          </section>
        </div>

        {/* Every row in this queue is pending, so the actions always apply.
            They hand off to the approve / reject dialogs. */}
        <div className="border-t p-4">
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 rounded-2xl border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => {
                onReject(org);
                onOpenChange(false);
              }}
              aria-label="Reject request"
            >
              <XCircle className="mr-1.5 h-4 w-4" />
              Reject
            </Button>
            <Button
              className="flex-1 rounded-2xl bg-success border-bg-success text-primary-foreground hover:bg-success/90"
              onClick={() => {
                onApprove(org);
                onOpenChange(false);
              }}
              aria-label="Approve request"
            >
              <CheckCircle className="mr-1.5 h-4 w-4" />
              Approve
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
