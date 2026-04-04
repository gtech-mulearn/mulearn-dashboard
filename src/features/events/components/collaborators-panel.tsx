"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import {
  useAcceptCollaborator,
  useEventCollaborators,
  useRejectCollaborator,
  useRemoveCollaborator,
} from "../hooks";
import type { EventCollaborator } from "../types";
import { EventSearch } from "./event-search";

interface CollaboratorsPanelProps {
  eventId: string;
  isManageView?: boolean;
  onActivity?: (activity: {
    type: "collaborator";
    action: string;
    label: string;
  }) => void;
}

function getCollabName(collab: EventCollaborator): string {
  return (
    collab.ig?.name ??
    collab.campus?.name ??
    collab.company?.name ??
    "Collaborator"
  );
}

export function CollaboratorsPanel({
  eventId,
  isManageView,
  onActivity,
}: CollaboratorsPanelProps) {
  const [selectedCollaborator, setSelectedCollaborator] =
    useState<EventCollaborator | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});

  const { data: collaborators } = useEventCollaborators(eventId);
  const acceptMutation = useAcceptCollaborator(eventId);
  const rejectMutation = useRejectCollaborator(eventId);
  const removeMutation = useRemoveCollaborator(eventId);

  const collaboratorsList = Array.isArray(collaborators)
    ? collaborators
    : collaborators &&
        typeof collaborators === "object" &&
        "data" in collaborators
      ? Array.isArray((collaborators as { data?: unknown }).data)
        ? ((collaborators as { data?: EventCollaborator[] }).data ?? [])
        : []
      : [];

  const visible = collaboratorsList.filter((collab) =>
    isManageView ? true : collab.invite_status === "accepted",
  );

  return (
    <section className="space-y-3 rounded-lg border p-4">
      <h3 className="font-semibold">Collaborators</h3>

      <div className="space-y-2">
        {visible.map((collab) => (
          <div key={collab.id} className="space-y-2 rounded border p-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-medium">{getCollabName(collab)}</p>
                {collab.role_label ? (
                  <p className="text-xs text-gray-500">{collab.role_label}</p>
                ) : null}
              </div>
              {isManageView ? (
                <Badge variant="outline" className="capitalize">
                  {collab.invite_status}
                </Badge>
              ) : null}
            </div>

            {isManageView && collab.rejection_reason ? (
              <p className="text-xs text-red-600">{collab.rejection_reason}</p>
            ) : null}

            {isManageView && collab.invite_status === "pending" ? (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => acceptMutation.mutate(collab.id)}
                >
                  Accept
                </Button>
                <Input
                  placeholder="Reject reason"
                  value={rejectReason[collab.id] ?? ""}
                  onChange={(e) =>
                    setRejectReason((prev) => ({
                      ...prev,
                      [collab.id]: e.target.value,
                    }))
                  }
                  className="h-8 max-w-xs"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    rejectMutation.mutate({
                      collabId: collab.id,
                      reason: rejectReason[collab.id] ?? "Not a fit",
                    })
                  }
                >
                  Reject
                </Button>
              </div>
            ) : null}

            {isManageView ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedCollaborator(collab)}
              >
                Remove
              </Button>
            ) : null}
          </div>
        ))}
      </div>

      {isManageView ? <EventSearch mode="invite" eventId={eventId} /> : null}

      <ConfirmDialog
        open={!!selectedCollaborator}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCollaborator(null);
          }
        }}
        title="Remove collaborator"
        description="This collaborator will be removed from the event."
        onConfirm={() => {
          if (selectedCollaborator) {
            const removedLabel = `${getCollabName(selectedCollaborator)} removed from collaborators`;
            removeMutation.mutate(selectedCollaborator.id, {
              onSuccess: () => {
                setSelectedCollaborator(null);
                window.dispatchEvent(
                  new CustomEvent("events:activity", {
                    detail: {
                      type: "collaborator",
                      action: "removed",
                      label: removedLabel,
                    },
                  }),
                );
                onActivity?.({
                  type: "collaborator",
                  action: "removed",
                  label: removedLabel,
                });
              },
            });
          }
        }}
        isPending={removeMutation.isPending}
        confirmLabel="Remove"
      />
    </section>
  );
}
