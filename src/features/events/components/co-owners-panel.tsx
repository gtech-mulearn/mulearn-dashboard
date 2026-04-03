"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAddCoOwner, useEventCoOwners, useRemoveCoOwner } from "../hooks";
import type { EventCoOwner } from "../types";
import { UserSearchInput } from "./user-search-input";

interface CoOwnersPanelProps {
  eventId: string;
}

export function CoOwnersPanel({ eventId }: CoOwnersPanelProps) {
  const [selectedCoOwner, setSelectedCoOwner] = useState<EventCoOwner | null>(
    null,
  );
  const {
    data: coOwners,
    isLoading,
    isError,
    error,
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
    <section className="space-y-3 rounded-lg border p-4">
      <h3 className="font-semibold">Co-Owners</h3>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading co-owners...</p>
      ) : null}

      {isError ? (
        <p className="text-sm text-destructive">
          {isPermissionDenied
            ? "Unable to read co-owners for this event due to permissions. You can still try adding a co-owner below."
            : errorMessage}
        </p>
      ) : null}

      <div className="space-y-2">
        {coOwnersList.map((coOwner) => (
          <div
            key={coOwner.id}
            className="flex items-center gap-3 rounded border p-2"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={coOwner.user.profile_pic ?? undefined} />
              <AvatarFallback>
                {coOwner.user.full_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {coOwner.user.full_name}
              </p>
              <p className="text-xs text-gray-500">{coOwner.user.muid}</p>
            </div>
            <Badge variant="outline">{coOwner.role}</Badge>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setSelectedCoOwner(coOwner)}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      <UserSearchInput
        placeholder="Search by name or muid..."
        onSelect={(user) => {
          if (!user.id) return;
          addCoOwner.mutate({ user_id: user.id });
        }}
      />

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
            removeCoOwner.mutate(selectedCoOwner.id, {
              onSuccess: () => setSelectedCoOwner(null),
            });
          }
        }}
        isPending={removeCoOwner.isPending}
        confirmLabel="Remove"
      />
    </section>
  );
}
