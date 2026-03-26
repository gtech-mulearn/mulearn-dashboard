"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useAcceptCollaborator,
  useEventCollaborators,
  useInviteCollaborator,
  useRejectCollaborator,
  useRemoveCollaborator,
} from "../hooks";
import type { CollaboratorInviteBody, EventCollaborator } from "../types";

interface CollaboratorsPanelProps {
  eventId: string;
  isManageView?: boolean;
}

function getCollabName(collab: EventCollaborator): string {
  return (
    collab.ig?.name ??
    collab.campus?.name ??
    collab.campus_ig?.ig.name ??
    collab.company?.name ??
    "Collaborator"
  );
}

export function CollaboratorsPanel({
  eventId,
  isManageView,
}: CollaboratorsPanelProps) {
  const [invite, setInvite] = useState<CollaboratorInviteBody>({
    entity_type: "collab_ig",
    entity_id: "",
    role_label: "",
  });
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});

  const { data: collaborators } = useEventCollaborators(eventId);
  const inviteMutation = useInviteCollaborator(eventId);
  const acceptMutation = useAcceptCollaborator(eventId);
  const rejectMutation = useRejectCollaborator(eventId);
  const removeMutation = useRemoveCollaborator(eventId);

  const visible = (collaborators ?? []).filter((collab) =>
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
                onClick={() => removeMutation.mutate(collab.id)}
              >
                Remove
              </Button>
            ) : null}
          </div>
        ))}
      </div>

      {isManageView ? (
        <div className="space-y-2 rounded border p-3">
          <p className="text-sm font-medium">Invite collaborator</p>
          <select
            className="h-9 w-full rounded-md border px-3 text-sm"
            value={invite.entity_type}
            onChange={(e) =>
              setInvite((prev) => ({
                ...prev,
                entity_type: e.target
                  .value as CollaboratorInviteBody["entity_type"],
              }))
            }
          >
            <option value="collab_ig">IG</option>
            <option value="collab_campus">Campus</option>
            <option value="collab_campus_ig">Campus IG</option>
            <option value="collab_company">Company</option>
          </select>
          <Input
            placeholder="Entity UUID"
            value={invite.entity_id}
            onChange={(e) =>
              setInvite((prev) => ({ ...prev, entity_id: e.target.value }))
            }
          />
          <Input
            placeholder="Role label"
            value={invite.role_label ?? ""}
            onChange={(e) =>
              setInvite((prev) => ({ ...prev, role_label: e.target.value }))
            }
          />
          <Button
            type="button"
            onClick={() => {
              if (!invite.entity_id.trim()) return;
              inviteMutation.mutate(invite);
              setInvite((prev) => ({ ...prev, entity_id: "", role_label: "" }));
            }}
          >
            Invite
          </Button>
        </div>
      ) : null}
    </section>
  );
}
