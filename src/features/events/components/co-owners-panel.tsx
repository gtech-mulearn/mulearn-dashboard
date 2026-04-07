"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { MuidSearchInput } from "@/components/ui/muid-search-input";
import { useAddCoOwner, useEventCoOwners, useRemoveCoOwner } from "../hooks";
import type { EventCoOwner } from "../types";

interface CoOwnersPanelProps {
  eventId: string;
  onActivity?: (activity: {
    type: "co-owner";
    action: string;
    label: string;
  }) => void;
}

export function CoOwnersPanel({ eventId, onActivity }: CoOwnersPanelProps) {
  const [selectedCoOwner, setSelectedCoOwner] = useState<EventCoOwner | null>(
    null,
  );
  const {
    data: coOwners,
    isLoading,
    isError,
    error,
    isFetching,
  } = useEventCoOwners(eventId);
  const addCoOwner = useAddCoOwner(eventId);
  const removeCoOwner = useRemoveCoOwner(eventId);

  const coOwnersList = Array.isArray(coOwners)
    ? coOwners
    : coOwners && typeof coOwners === "object" && "data" in coOwners
      ? Array.isArray((coOwners as { data?: unknown }).data)
        ? ((coOwners as { data?: EventCoOwner[] }).data ?? [])
        : []
      : [];

  const errorMessage =
    error instanceof Error ? error.message : "Failed to load co-owners";
  const isPermissionDenied = errorMessage
    .toLowerCase()
    .includes("permission denied");

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card/60 p-4 sm:p-5">
      <div className="space-y-1">
        <h3 className="text-base font-semibold tracking-tight text-foreground">
          Co-Owners
        </h3>
        <p className="text-sm text-muted-foreground">
          Search first, then review the current co-owners below.
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-border/70 bg-background/60 p-3">
        <MuidSearchInput
          placeholder="Search by name or muid..."
          onSelectUser={(user) => {
            if (!user.id) return;
            addCoOwner.mutate(
              { user_id: user.id },
              {
                onSuccess: () => {
                  onActivity?.({
                    type: "co-owner",
                    action: "added",
                    label: `${user.full_name} (${user.muid}) added as co-owner`,
                  });
                },
              },
            );
          }}
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading co-owners...</p>
      ) : null}

      {!isLoading && isFetching ? (
        <p className="text-xs text-muted-foreground">Refreshing co-owners...</p>
      ) : null}

      {isError ? (
        <p className="text-sm text-destructive">
          {isPermissionDenied
            ? "Unable to read co-owners for this event due to permissions. You can still try adding a co-owner below."
            : errorMessage}
        </p>
      ) : null}

      <div
        className={`max-h-[320px] space-y-3 overflow-y-auto pr-1 sm:max-h-[380px] ${isFetching ? "opacity-75" : ""}`}
      >
        {coOwnersList.map((coOwner) => (
          <div
            key={coOwner.id}
            className="flex flex-col gap-3 rounded-xl border border-border bg-background p-3 shadow-sm sm:flex-row sm:items-center sm:gap-4"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarImage src={coOwner.user.profile_pic ?? undefined} />
                <AvatarFallback>
                  {coOwner.user.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {coOwner.user.full_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {coOwner.user.muid}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <Badge variant="outline" className="capitalize">
                {coOwner.role ?? "co_owner"}
              </Badge>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setSelectedCoOwner(coOwner)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
        {coOwnersList.length === 0 && !isLoading ? (
          <p className="text-sm text-muted-foreground">
            No co-owners added yet.
          </p>
        ) : null}
      </div>

      <ConfirmDialog
        open={!!selectedCoOwner}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCoOwner(null);
          }
        }}
        title="Remove co-owner"
        description="This user will lose co-owner permissions for this event."
        onConfirm={() => {
          if (selectedCoOwner) {
            const removedLabel = `${selectedCoOwner.user.full_name} (${selectedCoOwner.user.muid}) removed from co-owners`;
            removeCoOwner.mutate(selectedCoOwner.id, {
              onSuccess: () => {
                setSelectedCoOwner(null);
                onActivity?.({
                  type: "co-owner",
                  action: "removed",
                  label: removedLabel,
                });
              },
            });
          }
        }}
        isPending={removeCoOwner.isPending}
        confirmLabel="Remove"
      />
    </section>
  );
}
