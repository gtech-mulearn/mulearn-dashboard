"use client";

import { UserCheck } from "lucide-react";
import Link from "next/link";

/**
 * Shown when the mentor dashboard is opened without any active mentor
 * scope. All of a mentor's scopes are active at once (no persona
 * switching) — so the only thing to say here is who can grant access.
 */
export function MentorSetupPrompt() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border bg-card p-12 text-center shadow-sm">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
        <UserCheck className="size-7 text-primary" />
      </div>
      <h2 className="mb-2 text-xl font-bold text-foreground">
        No mentor access yet
      </h2>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        You don&apos;t hold any active mentor scope. Apply to become a mentor,
        or contact an admin, your campus, or your company to be assigned.
      </p>
      <Link
        href="/dashboard/profile"
        className="inline-flex items-center gap-2 rounded-full border px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
      >
        Open profile
      </Link>
    </div>
  );
}
