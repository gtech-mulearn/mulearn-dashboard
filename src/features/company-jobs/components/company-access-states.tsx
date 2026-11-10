"use client";

import { Lock, type LucideIcon, ShieldAlert } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { CompanyAccessRole } from "../lib/company-access";

export function CompanyPageSkeleton() {
  return (
    <div className="space-y-6 p-6" aria-busy="true">
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

function AccessState({
  icon: Icon,
  title,
  children,
  extra,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  /** Shown between the explanation and the way out (e.g. invitations). */
  extra?: ReactNode;
}) {
  return (
    <div className="flex min-h-100 flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="rounded-full bg-muted p-4">
        <Icon className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="max-w-md text-sm text-muted-foreground">{children}</p>
      {extra}
      <Button asChild variant="outline">
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  );
}

/** Signed in, but not an owner, co-admin or company mentor of any company. */
export function CompanyNoAccessState({
  invitations,
}: {
  /** Pending co-admin invitations the user can accept here. */
  invitations?: ReactNode;
}) {
  return (
    <AccessState
      icon={Lock}
      title="You're not part of a company on muLearn"
      extra={invitations}
    >
      Company pages are for company owners, co-admins and company mentors. If
      you were invited to help manage a company, accept the invitation and try
      again.
    </AccessState>
  );
}

/** Part of a company, but this page needs more than the user's role allows. */
export function CompanyForbiddenState({ role }: { role: CompanyAccessRole }) {
  return (
    <AccessState icon={ShieldAlert} title="You don't have access to this page">
      {role === "company_mentor"
        ? "As a company mentor you can post jobs, create tasks, and view analytics and feedback. Ask a company admin if you need more access."
        : "Only the company owner can open this page."}
    </AccessState>
  );
}
