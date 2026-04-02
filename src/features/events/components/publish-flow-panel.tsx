"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAdminApprove, useAdminReject, usePublishEvent } from "../hooks";
import type { EventDetail, EventDetailManage } from "../types";
import { EventStatusBadge } from "./event-status-badge";

interface PublishFlowPanelProps {
  event: EventDetail | EventDetailManage;
  canApprove?: boolean;
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

export function PublishFlowPanel({
  event,
  canApprove = false,
}: PublishFlowPanelProps) {
  const [approveNote, setApproveNote] = useState("");
  const [showApproveInput, setShowApproveInput] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);

  const publish = usePublishEvent(event.id);
  const approve = useAdminApprove(event.id);
  const reject = useAdminReject(event.id);

  const isPendingStatus =
    event.status === "pending_campus_approval" ||
    event.status === "pending_approval" ||
    event.status === "pending_mentor_approval";

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

      {isPendingStatus && canApprove ? (
        <div className="space-y-2">
          {showApproveInput ? (
            <div className="flex flex-wrap items-center gap-2">
              <Input
                value={approveNote}
                onChange={(e) => setApproveNote(e.target.value)}
                placeholder="Approval note (optional)"
                className="max-w-sm"
              />
              <Button
                onClick={() =>
                  approve.mutate(approveNote || undefined, {
                    onSuccess: () => {
                      setApproveNote("");
                      setShowApproveInput(false);
                    },
                  })
                }
                disabled={approve.isPending}
              >
                Confirm Approve
              </Button>
            </div>
          ) : (
            <Button onClick={() => setShowApproveInput(true)}>Approve</Button>
          )}

          <Button variant="outline" onClick={() => setRejectOpen(true)}>
            Reject
          </Button>
        </div>
      ) : null}

      {isPendingStatus && !canApprove ? (
        <Button disabled>Awaiting approval...</Button>
      ) : null}

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Reject event</DialogTitle>
          </DialogHeader>

          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason for rejection"
            className="min-h-28"
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                reject.mutate(rejectReason.trim(), {
                  onSuccess: () => {
                    setRejectReason("");
                    setRejectOpen(false);
                  },
                })
              }
              disabled={reject.isPending || rejectReason.trim().length === 0}
            >
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
