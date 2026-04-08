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
    <section className="space-y-5 rounded-xl border border-border/70 bg-background p-4 sm:p-5">
      <div className="space-y-1">
        <h3 className="text-base font-semibold tracking-tight text-foreground">
          Collaborators
        </h3>
        <p className="text-sm text-muted-foreground">
          Invite or review collaborators from the section below.
        </p>
      </div>

      {isManageView ? (
        <div className="space-y-3 rounded-xl border border-dashed border-border/70 bg-muted/30 p-3">
          <EventSearch mode="invite" eventId={eventId} />
        </div>
      ) : null}

      <div className="max-h-[340px] space-y-2.5 overflow-y-auto pr-1 sm:max-h-[400px]">
        {visible.map((collab) => (
          <div
            key={collab.id}
            className="space-y-2 rounded-xl border border-border bg-card p-3 text-sm"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {getCollabName(collab)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {collab.role_label ?? "Collaborator"}
                </p>
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
