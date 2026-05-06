"use client";
import { AlertTriangle, Clock, ShieldX, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { COMPANY_STATUS_CONFIG } from "../constants";
import { useCompanyProfile } from "../hooks";
import type { CompanyStatus } from "../types";

interface CompanyStatusGuardProps {
  children: ReactNode;
}

const STATUS_ICONS: Record<CompanyStatus, React.ElementType> = {
  active: ShieldX,
  pending_verification: Clock,
  rejected: XCircle,
  inactive: AlertTriangle,
};

export function CompanyStatusGuard({ children }: CompanyStatusGuardProps) {
  const { profile, isActive, isLoading, isError, error } = useCompanyProfile();

  // Loading state — skeleton
  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(["a", "b", "c"] as const).map((k) => (
            <Skeleton key={k} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
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
          {error instanceof Error
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

  // Not active — show status-specific banner
  const status = (profile?.status ?? "inactive") as CompanyStatus;
  const config =
    COMPANY_STATUS_CONFIG[status] ?? COMPANY_STATUS_CONFIG.inactive;
  const Icon = STATUS_ICONS[status] ?? AlertTriangle;

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-6 p-6">
      <div
        className={`rounded-full p-4 ${config.bgColor} border ${config.borderColor}`}
      >
        <Icon className={`h-10 w-10 ${config.color}`} />
      </div>
      <div className="text-center">
        <span
          className={`mb-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${config.bgColor} ${config.color} border ${config.borderColor}`}
        >
          {config.label}
        </span>
        <h2 className="mt-3 text-xl font-semibold text-foreground">
          Job Management Unavailable
        </h2>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
          {config.message}
        </p>
      </div>
    </div>
  );
}
