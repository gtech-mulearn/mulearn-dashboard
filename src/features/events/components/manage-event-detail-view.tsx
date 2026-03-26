"use client";

// TODO: add RBAC guard — verify user has is_staff or appropriate role
// from /api/v1/dashboard/user/info/ before rendering management UI

import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteEvent, useManageEventDetail } from "../hooks";
import { CoOwnersPanel } from "./co-owners-panel";
import { CollaboratorsPanel } from "./collaborators-panel";
import { EventDetailView } from "./event-detail-view";
import EventModal from "./event-modal";
import { PublishFlowPanel } from "./publish-flow-panel";

interface ManageEventDetailViewProps {
  eventId: string;
  onBack?: () => void;
}

export function ManageEventDetailView({
  eventId,
  onBack,
}: ManageEventDetailViewProps) {
  const [editing, setEditing] = useState(false);
  const {
    data: event,
    isLoading,
    isError,
    error,
  } = useManageEventDetail(eventId);
  const deleteEvent = useDeleteEvent(eventId);

  const sortedHistory = useMemo(() => {
    if (!event) return [];
    return [...event.edit_history].sort(
      (a, b) =>
        new Date(b.edited_at).getTime() - new Date(a.edited_at).getTime(),
    );
  }, [event]);

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (isError || !event) {
    return (
      <p className="text-sm text-red-600">
        {error instanceof Error ? error.message : "Failed to load event"}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => onBack?.()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditing(true)}>
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (window.confirm("Cancel this event?")) {
                deleteEvent.mutate();
              }
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Cancel Event
          </Button>
        </div>
      </div>

      <PublishFlowPanel event={event} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <EventDetailView eventId={eventId} />
          <CollaboratorsPanel eventId={eventId} />
        </div>
        <div className="space-y-4 lg:col-span-1">
          <CoOwnersPanel eventId={eventId} />
          <CollaboratorsPanel eventId={eventId} isManageView />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2">edited_by</th>
                  <th className="p-2">changed_fields</th>
                  <th className="p-2">when</th>
                </tr>
              </thead>
              <tbody>
                {sortedHistory.map((entry) => (
                  <tr
                    key={entry.edited_at + entry.edited_by.id}
                    className="border-b"
                  >
                    <td className="p-2">{entry.edited_by.full_name}</td>
                    <td className="p-2">{entry.changed_fields.join(", ")}</td>
                    <td className="p-2">
                      {new Date(entry.edited_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <EventModal
        open={editing}
        onClose={() => setEditing(false)}
        initialData={event}
        isEdit
      />
    </div>
  );
}
