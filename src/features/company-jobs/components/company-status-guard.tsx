"use client";
import { AlertTriangle, Clock, Lock, ShieldX, XCircle } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { NoCompanyAccessError } from "../api/jobs.api";
import { COMPANY_STATUS_CONFIG } from "../constants";
import { useCompanyProfile } from "../hooks";
import type { CompanyStatus } from "../types";
import {
  CompanyNoAccessState,
  CompanyPageSkeleton,
} from "./company-access-states";

interface CompanyStatusGuardProps {
  children: ReactNode;
}

const STATUS_ICONS: Record<string, React.ElementType> = {
  verified: ShieldX,
  pending: Clock,
  rejected: XCircle,
  inactive: AlertTriangle,
};

export function CompanyStatusGuard({ children }: CompanyStatusGuardProps) {
  const { profile, isActive, isLoading, isError, error } = useCompanyProfile();

  if (isLoading) return <CompanyPageSkeleton />;

  // Access ended mid-session (invite revoked, grant expired) — the layout's
  // CompanyAccessGate catches this on the next probe.
  if (isError && error instanceof NoCompanyAccessError) {
    return <CompanyNoAccessState />;
  }

  // Error fetching profile
  if (isError) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-6">
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">
          Unable to load company profile
        </h2>
        <p className="max-w-md text-center text-sm text-muted-foreground">
          {process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again later."}
        </p>
      </div>
    );
  }

  // Company is active — render children
  if (isActive) {
    return <>{children}</>;
  }

  // Not active — show overlay on top of children
  const status = (profile?.status ?? "inactive") as CompanyStatus;
  const config =
    COMPANY_STATUS_CONFIG[status] ?? COMPANY_STATUS_CONFIG.inactive;
  const Icon = STATUS_ICONS[status] ?? AlertTriangle;

  return (
    <div className="relative min-h-[400px]">
      <div className="pointer-events-none select-none opacity-30 blur-[2px] transition-all duration-300">
        {children}
      </div>

      <div className="absolute inset-0 z-10 flex items-center justify-center p-6">
        <div className="flex w-full max-w-sm flex-col items-center justify-center gap-4 rounded-2xl border bg-background/95 p-8 text-center shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div
            className={`rounded-full p-4 ${config.bgColor} border ${config.borderColor}`}
          >
            <Icon className={`h-10 w-10 ${config.color}`} />
          </div>

          <div>
            <span
              className={`mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${config.bgColor} ${config.color} border ${config.borderColor}`}
            >
              <Lock className="h-3 w-3" />
              {config.label}
            </span>
            <h2 className="text-xl font-semibold text-foreground">
              Feature Locked
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {config.message}
            </p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              Available after company verification
            </p>
          </div>

          {status === "pending" && (
            <Button asChild className="mt-2 w-full" variant="outline">
              <Link href="/dashboard/company/profile/edit">
                Update Company Registration
              </Link>
            </Button>
          )}

          {status === "rejected" && (
            <div className="mt-2 w-full space-y-3">
              {profile?.rejection_reason && (
                <div className="rounded-lg bg-destructive/10 p-3 text-left text-sm text-destructive">
                  <span className="font-semibold">Reason:</span>{" "}
                  {profile.rejection_reason}
                </div>
              )}
              <Button asChild className="w-full">
                <Link href="/dashboard/company/profile/edit">
                  Resubmit Company Registration
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
