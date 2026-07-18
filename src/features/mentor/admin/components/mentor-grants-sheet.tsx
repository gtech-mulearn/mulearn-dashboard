"use client";

import { useQuery } from "@tanstack/react-query";
import { ShieldOff } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { StateDisplay } from "@/components/ui/state-display";
import { fetchIgOptions } from "../api/ig-options.api";
import {
  useMentorGrants,
  useRevokeMentorGrant,
} from "../hooks/use-mentor-grants";
import type { MentorGrant } from "../schemas";

const SCOPE_LABELS: Record<string, string> = {
  MENTOR: "Platform Mentor",
  IG_MENTOR: "Interest Group",
  COMPANY_MENTOR: "Company",
  CAMPUS_MENTOR: "Campus",
};

function formatDate(value?: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
}

interface MentorGrantsSheetProps {
  mentorId: string;
  mentorName: string;
  mentorMuid?: string;
  /** Org name for Company/Campus scopes when the page knows it (e.g. the
   *  company owner's own company). Raw scope ids are never rendered. */
  employer?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MentorGrantsSheet({
  mentorId,
  mentorName,
  mentorMuid,
  employer,
  open,
  onOpenChange,
}: MentorGrantsSheetProps) {
  const { data: grants, isLoading } = useMentorGrants(mentorId, open);
  const revoke = useRevokeMentorGrant(mentorId);
  const [confirmGrant, setConfirmGrant] = useState<MentorGrant | null>(null);

  // IG id → name map, so IG scopes show their group name (never the id).
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

  // Human name for a grant. UUIDs are never shown: unresolvable scopes fall
  // back to their type label alone.
  function scopeName(grant: MentorGrant): string {
    if (grant.scope_type === "IG_MENTOR") {
      return igNameById.get(grant.scope_id ?? "") ?? SCOPE_LABELS.IG_MENTOR;
    }
    if (grant.scope_type === "MENTOR") return "Platform-wide";
    return employer ?? SCOPE_LABELS[grant.scope_type] ?? grant.scope_type;
  }

  function scopeMeta(grant: MentorGrant): string {
    const parts: string[] = [];
    const label = SCOPE_LABELS[grant.scope_type] ?? grant.scope_type;
    if (scopeName(grant) !== label) parts.push(label);
    if (grant.granted_by_name)
      parts.push(`granted by ${grant.granted_by_name}`);
    const when = formatDate(grant.granted_at);
    if (when) parts.push(when);
    return parts.join(" · ");
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{mentorName}</SheetTitle>
          <SheetDescription>
            {mentorMuid ? `${mentorMuid} · ` : ""}
            Scopes are independent — removing one never touches the others,
            their profile, or their employment.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-2 px-4 pb-4">
          {isLoading || (igOptions.isLoading && !igOptions.data) ? (
            [1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))
          ) : !grants || grants.length === 0 ? (
            <StateDisplay
              variant="no-results"
              title="No scopes"
              description="This mentor holds no scope grants yet."
            />
          ) : (
            grants.map((grant) => (
              <div
                key={grant.id}
                className="flex items-center gap-3 rounded-xl border border-border/50 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {scopeName(grant)}
                  </p>
                  {scopeMeta(grant) ? (
                    <p className="truncate text-xs text-muted-foreground">
                      {scopeMeta(grant)}
                    </p>
                  ) : null}
                </div>
                {grant.is_active ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-destructive"
                    disabled={revoke.isPending}
                    onClick={() => setConfirmGrant(grant)}
                  >
                    <ShieldOff className="h-3.5 w-3.5" /> Revoke
                  </Button>
                ) : (
                  <Badge variant="outline" className="shrink-0">
                    Revoked
                  </Badge>
                )}
              </div>
            ))
          )}
        </div>

        <ConfirmDialog
          open={Boolean(confirmGrant)}
          onOpenChange={(o) => !o && setConfirmGrant(null)}
          title={
            confirmGrant
              ? `Revoke "${scopeName(confirmGrant)}"?`
              : "Revoke this scope?"
          }
          description={`Removes only this scope's authority. ${mentorName}'s profile, employment and other scopes stay intact.`}
          confirmLabel="Revoke scope"
          isPending={revoke.isPending}
          onConfirm={() => {
            if (!confirmGrant) return;
            revoke.mutate(confirmGrant.id, {
              onSuccess: () => setConfirmGrant(null),
            });
          }}
        />
      </SheetContent>
    </Sheet>
  );
}
