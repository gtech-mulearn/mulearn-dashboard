"use client";

import { Button } from "@/components/ui/button";
import { usePublishEvent } from "../hooks";
import type { EventDetail, EventDetailManage } from "../types";
import { EventStatusBadge } from "./event-status-badge";

interface PublishFlowPanelProps {
  event: EventDetail | EventDetailManage;
}

function statusDescription(status: EventDetail["status"]): string {
  if (status === "draft")
    return "This event is currently a draft and is not visible to others.";
  if (status.startsWith("pending_"))
    return "This event is under review and awaiting approval.";
  if (status === "published")
    return "This event is published and visible to users.";
  if (status === "ongoing") return "This event is currently ongoing.";
  if (status === "completed") return "This event has been completed.";
  return "This event is cancelled.";
}

export function PublishFlowPanel({ event }: PublishFlowPanelProps) {
  const publish = usePublishEvent(event.id);

  return (
    <section className="space-y-3 rounded-lg border p-4">
      <h3 className="font-semibold">Publishing</h3>
      <EventStatusBadge status={event.status} />
      <p className="text-sm text-gray-600">{statusDescription(event.status)}</p>

      {event.status === "draft" ? (
        <Button onClick={() => publish.mutate()} disabled={publish.isPending}>
          Submit for review
        </Button>
      ) : null}

      {event.status === "pending_campus_approval" ||
      event.status === "pending_approval" ||
      event.status === "pending_mentor_approval" ? (
        <Button disabled>Awaiting approval...</Button>
      ) : null}
    </section>
  );
}
