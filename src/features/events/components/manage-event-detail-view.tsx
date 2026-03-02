/**
 * Manage Event Detail View
 *
 * 📍 src/features/events/components/manage-event-detail-view.tsx
 *
 * Organiser's detailed view for a single managed event.
 * Shows full detail + edit history + co-owner/collaborator management.
 */

"use client";

import { format } from "date-fns";
import {
  ArrowLeft,
  Clock,
  Edit,
  History,
  Loader2,
  SendHorizonal,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCancelEvent,
  useManageEvent,
  usePublishEvent,
} from "../hooks/events.hooks";
import { EventStatusBadge } from "./event-status-badge";
import { EventTypeBadge } from "./event-type-badge";

interface ManageEventDetailViewProps {
  eventId: string;
}

export function ManageEventDetailView({ eventId }: ManageEventDetailViewProps) {
  const router = useRouter();
  const { data: event, isLoading, error } = useManageEvent(eventId);
  const cancelEvent = useCancelEvent();
  const publishEvent = usePublishEvent();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">Failed to load event details.</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go back
        </Button>
      </div>
    );
  }

  const isDraft = event.status === "draft";
  const isCancelled = event.status === "cancelled";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/events/manage">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{event.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <EventStatusBadge status={event.status} />
              <EventTypeBadge eventType={event.event_type} />
              {event.is_featured && (
                <Badge className="bg-yellow-400/90 text-yellow-900">
                  Featured
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isDraft && (
            <Button
              size="sm"
              onClick={() => publishEvent.mutate(eventId)}
              disabled={publishEvent.isPending}
            >
              {publishEvent.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <SendHorizonal className="mr-2 h-4 w-4" />
              )}
              Publish
            </Button>
          )}
          {!isCancelled && (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/events/manage/${eventId}/edit`}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Link>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowCancelDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold">{event.interest_count}</p>
                <p className="text-xs text-muted-foreground">Interested</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold">{event.co_owners.length}</p>
                <p className="text-xs text-muted-foreground">Co-Owners</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold">
                  {event.collaborators.length}
                </p>
                <p className="text-xs text-muted-foreground">Collaborators</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold">
                  {event.linked_tasks.length}
                </p>
                <p className="text-xs text-muted-foreground">Tasks</p>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {event.description}
              </p>
            </CardContent>
          </Card>

          {/* Co-owners */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" /> Co-Owners
              </CardTitle>
            </CardHeader>
            <CardContent>
              {event.co_owners.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No co-owners assigned.
                </p>
              ) : (
                <div className="space-y-2">
                  {event.co_owners.map((co) => (
                    <div
                      key={co.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={co.user.profile_pic ?? undefined} />
                        <AvatarFallback>
                          {co.user.full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {co.user.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          @{co.user.muid}
                        </p>
                      </div>
                      <Badge variant="outline" className="capitalize text-xs">
                        {co.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Collaborators */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" /> Collaborators
              </CardTitle>
            </CardHeader>
            <CardContent>
              {event.collaborators.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No collaborators invited.
                </p>
              ) : (
                <div className="space-y-2">
                  {event.collaborators.map((collab) => (
                    <div
                      key={collab.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {(
                            collab.ig?.name ??
                            collab.campus?.name ??
                            collab.company?.name ??
                            "C"
                          ).charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {collab.ig?.name ??
                            collab.campus?.name ??
                            collab.campus_ig?.ig.name ??
                            collab.company?.name}
                        </p>
                        {collab.role_label && (
                          <p className="text-xs text-muted-foreground">
                            {collab.role_label}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="capitalize text-xs">
                        {collab.invite_status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" /> Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div>
                <p className="text-muted-foreground">Starts</p>
                <p className="font-medium">
                  {safeFormat(event.start_datetime, "PPP · p")}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Ends</p>
                <p className="font-medium">
                  {safeFormat(event.end_datetime, "PPP · p")}
                </p>
              </div>
              {event.registration_deadline && (
                <div>
                  <p className="text-muted-foreground">Reg. Deadline</p>
                  <p className="font-medium">
                    {safeFormat(event.registration_deadline, "PPP · p")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Venue */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Venue</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <Badge variant="outline" className="capitalize">
                {event.venue.type}
              </Badge>
              {event.venue.address && (
                <p className="text-muted-foreground">{event.venue.address}</p>
              )}
              {event.venue.city && (
                <p className="text-muted-foreground">{event.venue.city}</p>
              )}
              {event.venue.platform && (
                <p className="text-muted-foreground">
                  Platform: {event.venue.platform}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Edit History */}
          {event.edit_history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <History className="h-4 w-4" /> Edit History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {event.edit_history.slice(0, 5).map((entry, idx) => (
                  <div key={`${entry.edited_at}-${idx}`} className="text-xs">
                    <p className="font-medium">{entry.edited_by.full_name}</p>
                    <p className="text-muted-foreground">
                      {safeFormat(entry.edited_at, "PPP · p")}
                    </p>
                    <p className="text-muted-foreground">
                      Changed: {entry.changed_fields.join(", ")}
                    </p>
                    {idx < event.edit_history.length - 1 && (
                      <Separator className="mt-2" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardContent className="pt-6 text-xs text-muted-foreground space-y-1">
              <p>Created by {event.created_by.full_name}</p>
              <p>Created {safeFormat(event.created_at, "PPP")}</p>
              <p>Updated {safeFormat(event.updated_at, "PPP")}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cancel dialog */}
      <ConfirmDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title="Cancel Event"
        description={`Are you sure you want to cancel "${event.title}"? This will notify all interested users.`}
        onConfirm={() => {
          cancelEvent.mutate(eventId, {
            onSuccess: () => {
              setShowCancelDialog(false);
              router.push("/dashboard/events/manage");
            },
          });
        }}
        isPending={cancelEvent.isPending}
        variant="destructive"
      />
    </div>
  );
}

function safeFormat(iso: string, fmt: string): string {
  try {
    return format(new Date(iso), fmt);
  } catch {
    return iso;
  }
}
