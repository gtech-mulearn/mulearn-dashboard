"use client";

import { Loader2, UserCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useMentorIgRoles, useSwitchMentorPersona } from "../../hooks/use-home";

export function MentorSetupPrompt() {
  const { data: igRoles, isLoading, isError } = useMentorIgRoles();
  const switchPersona = useSwitchMentorPersona();
  const autoSwitchedRef = useRef(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Auto-switch when user has exactly one IG role and we haven't tried yet.
  useEffect(() => {
    if (
      autoSwitchedRef.current ||
      isLoading ||
      !igRoles ||
      igRoles.length !== 1 ||
      switchPersona.isPending
    ) {
      return;
    }
    autoSwitchedRef.current = true;
    switchPersona.mutate(igRoles[0].role_link_id);
  }, [igRoles, isLoading, switchPersona]);

  if (isLoading || (igRoles?.length === 1 && !switchPersona.isError)) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border bg-card p-12 text-center shadow-sm">
        <Loader2 className="mb-4 size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Activating your mentor dashboard…
        </p>
      </div>
    );
  }

  if (isError || !igRoles || igRoles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border bg-card p-12 text-center shadow-sm">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
          <UserCheck className="size-7 text-primary" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-foreground">
          No mentor role assigned
        </h2>
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">
          You don&apos;t have an active mentor assignment for any interest
          group. Contact an admin to be assigned as a mentor.
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

  // Multiple IGs — show selector
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border bg-card p-10 text-center shadow-sm">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
        <UserCheck className="size-7 text-primary" />
      </div>
      <h2 className="mb-2 text-xl font-bold text-foreground">
        Choose your active interest group
      </h2>
      <p className="mb-6 max-w-md text-sm text-muted-foreground">
        You mentor multiple interest groups. Select which one to activate for
        this dashboard session — you can switch any time.
      </p>

      <div className="mb-6 flex w-full max-w-md flex-col gap-2">
        {igRoles.map((role) => {
          const isSelected = selectedId === role.role_link_id;
          return (
            <button
              key={role.role_link_id}
              type="button"
              onClick={() => setSelectedId(role.role_link_id)}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted"
              }`}
            >
              <span className="font-medium text-foreground">
                {role.ig_name}
              </span>
              {role.is_primary && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  Primary
                </span>
              )}
            </button>
          );
        })}
      </div>

      <Button
        type="button"
        variant="default"
        disabled={!selectedId || switchPersona.isPending}
        onClick={() => selectedId && switchPersona.mutate(selectedId)}
        className="rounded-full px-6"
      >
        {switchPersona.isPending && <Loader2 className="size-4 animate-spin" />}
        Activate dashboard
      </Button>

      {switchPersona.isError && (
        <p className="mt-3 text-xs text-destructive">
          Failed to activate. Please try again.
        </p>
      )}
    </div>
  );
}
