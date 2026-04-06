"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useEventCollaborators, useRemoveCollaborator } from "../hooks";
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

  const campusIgName =
    collab.campus_ig?.name && collab.ig?.name
      ? `${collab.ig.name} @ ${collab.campus_ig.name}`
      : (collab.campus_ig?.name ?? null);

  return (
    entityName ??
    collab.ig?.name ??
    collab.campus?.title ??
    collab.campus?.name ??
    campusIgName ??
    collab.company?.title ??
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

  const { data: collaborators } = useEventCollaborators(eventId);
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
    <section className="space-y-3 rounded-lg border border-border bg-card/60 p-4">
      <h3 className="text-base font-semibold tracking-tight text-foreground">
        Collaborators
      </h3>

      <div className="max-h-[300px] space-y-2 overflow-y-auto pr-1 sm:max-h-[380px]">
        {visible.map((collab) => (
          <div key={collab.id} className="space-y-2 rounded border p-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-medium">{getCollabName(collab)}</p>
                {collab.role_label ? (
                  <p className="text-xs text-muted-foreground">
                    {collab.role_label}
                  </p>
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
        {visible.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No collaborators found.
          </p>
        ) : null}
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
