"use client";

import {
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  Globe,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  XCircle,
} from "lucide-react";
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
import type { CompanyVerificationItem } from "../schemas";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending_verification: {
    label: "Pending Verification",
    className: "border-warning/50 bg-warning/10 text-warning",
  },
  active: {
    label: "Active",
    className: "border-success/50 bg-success/10 text-success",
  },
  rejected: {
    label: "Rejected",
    className: "border-destructive/50 bg-destructive/10 text-destructive",
  },
  inactive: {
    label: "Inactive",
    className: "border-border bg-muted text-muted-foreground",
  },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "border-border bg-muted text-muted-foreground",
  };
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

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

// ─── Props ────────────────────────────────────────────────────────────────────

interface CompanyDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: CompanyVerificationItem | null;
  onApprove: (company: CompanyVerificationItem) => void;
  onReject: (company: CompanyVerificationItem) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CompanyDetailSheet({
  open,
  onOpenChange,
  company,
  onApprove,
  onReject,
}: CompanyDetailSheetProps) {
  if (!company) return null;

  const canAct =
    company.status === "pending_verification" ||
    (company.status as string) === "pending" ||
    !company.status;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-lg">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              <SheetTitle className="text-xl font-bold leading-tight">
                {company.name}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Slug: {company.slug}
              </SheetDescription>
            </div>
            <StatusBadge status={company.status} />
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto py-6">
          {/* Point of Contact */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Point of Contact
            </h3>
            <div className="space-y-3">
              <DetailRow
                icon={<Building2 className="h-4 w-4" />}
                label="Name"
                value={company.poc_name}
              />
              <DetailRow
                icon={<Mail className="h-4 w-4" />}
                label="Email"
                value={
                  company.poc_email ? (
                    <a
                      href={`mailto:${company.poc_email}`}
                      className="text-primary hover:underline"
                    >
                      {company.poc_email}
                    </a>
                  ) : null
                }
              />
              <DetailRow
                icon={<Phone className="h-4 w-4" />}
                label="Phone"
                value={company.poc_phone}
              />
            </div>
          </section>

          <Separator />

          {/* Company Details */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Company Details
            </h3>
            <div className="space-y-3">
              <DetailRow
                icon={<Building2 className="h-4 w-4" />}
                label="Industry"
                value={company.industry_sector}
              />
              <DetailRow
                icon={<MapPin className="h-4 w-4" />}
                label="Location"
                value={company.location}
              />
              {company.website_link && (
                <DetailRow
                  icon={<Globe className="h-4 w-4" />}
                  label="Website"
                  value={
                    <a
                      href={company.website_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      {company.website_link}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  }
                />
              )}
              {company.poc_email && (
                <DetailRow
                  icon={<Linkedin className="h-4 w-4" />}
                  label="LinkedIn"
                  value="—"
                />
              )}
            </div>
          </section>

          <Separator />

          {/* Verification Timeline */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Verification Timeline
            </h3>
            <div className="space-y-3">
              <DetailRow
                icon={<Calendar className="h-4 w-4" />}
                label="Registered On"
                value={formatDate(company.created_at)}
              />
              <DetailRow
                icon={<Clock className="h-4 w-4" />}
                label="Verification Requested"
                value={formatDate(company.verification_requested_at)}
              />
              {company.verified_at && (
                <DetailRow
                  icon={<CheckCircle className="h-4 w-4 text-success" />}
                  label="Verified At"
                  value={formatDate(company.verified_at)}
                />
              )}
              {company.rejection_reason && (
                <DetailRow
                  icon={<XCircle className="h-4 w-4 text-destructive" />}
                  label="Rejection Reason"
                  value={
                    <span className="text-destructive">
                      {company.rejection_reason}
                    </span>
                  }
                />
              )}
            </div>
          </section>
        </div>

        {/* Actions Footer */}
        {canAct && (
          <div className="border-t pt-4">
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-2xl border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => {
                  onReject(company);
                  onOpenChange(false);
                }}
              >
                <XCircle className="mr-1.5 h-4 w-4" />
                Reject
              </Button>
              <Button
                className="flex-1 rounded-2xl bg-success text-primary-foreground hover:bg-success/90"
                onClick={() => {
                  onApprove(company);
                  onOpenChange(false);
                }}
              >
                <CheckCircle className="mr-1.5 h-4 w-4" />
                Approve
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
