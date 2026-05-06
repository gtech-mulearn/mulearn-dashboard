"use client";

import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  type PendingCollaboratorInvite,
  useAcceptCollaboratorInvite,
  useRejectCollaboratorInvite,
} from "../hooks";
import type { EventCollaborator } from "../types";

interface CollaboratorInvitesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invites: PendingCollaboratorInvite[];
  isLoading: boolean;
  isError: boolean;
  onOpenEvent: (eventId: string) => void;
}

function getCollaboratorName(collab: EventCollaborator): string {
  const entityName =
    collab.entity_detail && typeof collab.entity_detail === "object"
      ? "name" in collab.entity_detail &&
        typeof collab.entity_detail.name === "string"
        ? collab.entity_detail.name
        : "title" in collab.entity_detail &&
            typeof collab.entity_detail.title === "string"
          ? collab.entity_detail.title
          : null
      : null;

  return (
    entityName ??
    collab.ig?.name ??
    collab.campus?.title ??
    collab.campus?.name ??
    collab.campus_ig?.name ??
    collab.company?.title ??
    collab.company?.name ??
    "Collaborator"
  );
}

function formatEntityType(entityType: string | undefined): string {
  if (!entityType) return "Collaborator";
  return entityType.replace("collab_", "").replace(/_/g, " ");
}

function formatEventStart(value: string | null): string {
  if (!value) return "Date not available";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Date not available";
  return parsed.toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function CollaboratorInvitesSheet({
  open,
  onOpenChange,
  invites,
  isLoading,
  isError,
  onOpenEvent,
}: CollaboratorInvitesSheetProps) {
  const acceptInvite = useAcceptCollaboratorInvite();
  const rejectInvite = useRejectCollaboratorInvite();
  const [activeInviteId, setActiveInviteId] = useState<string | null>(null);

  const pendingLabel = useMemo(() => {
    if (invites.length === 1) return "1 pending request";
    return `${invites.length} pending requests`;
  }, [invites.length]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-xl">
        <SheetHeader className="border-b">
          <SheetTitle>Collaboration Invites</SheetTitle>
          <SheetDescription>{pendingLabel}</SheetDescription>
        </SheetHeader>

        <div className="space-y-3 p-4">
          {isLoading ? (
            <div className="flex items-center gap-2 rounded-md border p-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading invites...
            </div>
          ) : isError ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              Failed to load collaborator invites.
            </div>
          ) : invites.length === 0 ? (
            <div className="rounded-md border p-4 text-sm text-muted-foreground">
              No pending collaborator invites right now.
            </div>
          ) : (
            invites.map((invite) => {
              const collaborator = invite.collaborator;
              const itemBusy =
                activeInviteId === collaborator.id &&
                (acceptInvite.isPending || rejectInvite.isPending);

              return (
                <div
                  key={collaborator.id}
                  className="space-y-3 rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-semibold">
                      {getCollaboratorName(collaborator)}
                    </p>
                    <p className="text-xs capitalize text-muted-foreground">
                      {formatEntityType(collaborator.entity_type)}
                    </p>
                    {collaborator.role_label ? (
                      <p className="text-xs text-muted-foreground">
                        Role: {collaborator.role_label}
                      </p>
                    ) : null}
                  </div>

                  <div className="rounded-md bg-muted/40 p-2 text-xs">
                    <p className="font-medium">{invite.eventTitle}</p>
                    <p className="text-muted-foreground">
                      Starts: {formatEventStart(invite.eventStartDatetime)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setActiveInviteId(collaborator.id);
                        acceptInvite.mutate({
                          eventId: invite.eventId,
                          collabId: collaborator.id,
                        });
                      }}
                      disabled={itemBusy}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setActiveInviteId(collaborator.id);
                        rejectInvite.mutate({
                          eventId: invite.eventId,
                          collabId: collaborator.id,
                        });
                      }}
                      disabled={itemBusy}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onOpenEvent(invite.eventId)}
                      disabled={itemBusy}
                    >
                      Open Event
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
