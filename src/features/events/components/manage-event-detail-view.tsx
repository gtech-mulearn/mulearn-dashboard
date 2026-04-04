"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { apiClient, endpoints } from "@/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAdminFeature,
  useDeleteEvent,
  useManageEventDetail,
} from "../hooks";
import type { EventLog } from "../types";
import { CoOwnersPanel } from "./co-owners-panel";
import { CollaboratorsPanel } from "./collaborators-panel";
import { EventDetailView } from "./event-detail-view";
import { PublishFlowPanel } from "./publish-flow-panel";

function getHistoryActor(entry: EventLog): string {
  const actor = entry.performed_by ?? entry.actor ?? entry.edited_by;
  if (!actor) return "System";
  return `${actor.full_name} (${actor.muid})`;
}

function getHistoryTimestamp(entry: EventLog): string {
  return entry.timestamp ?? entry.edited_at ?? new Date().toISOString();
}

function getHistoryAction(entry: EventLog): string {
  if (entry.action) {
    return entry.action.replace(/_/g, " ");
  }
  if (entry.changed_fields) {
    return "edited";
  }
  return "updated";
}

function getHistoryTarget(entry: EventLog): string | null {
  if (entry.target_name && entry.target_type) {
    return `${entry.target_type.replace(/_/g, " ")} · ${entry.target_name}`;
  }
  if (entry.target_name) {
    return entry.target_name;
  }
  if (entry.target_type) {
    return entry.target_type.replace(/_/g, " ");
  }
  return null;
}

function HistoryLogEntry({ entry }: { entry: EventLog }) {
  const actor = entry.performed_by ?? entry.actor ?? entry.edited_by;

  const changesEntries = entry.changes ? Object.entries(entry.changes) : [];

  const changedFieldsLegacy = Array.isArray(entry.changed_fields)
    ? entry.changed_fields
    : entry.changed_fields && typeof entry.changed_fields === "object"
      ? Object.keys(entry.changed_fields)
      : [];

  const hasChanges =
    changesEntries.length > 0 || changedFieldsLegacy.length > 0;

  return (
    <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {actor ? `${actor.full_name} (${actor.muid})` : "System"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {entry.summary ?? getHistoryAction(entry)}
            {getHistoryTarget(entry) && !entry.summary
              ? ` · ${getHistoryTarget(entry)}`
              : ""}
          </p>
        </div>
        <p className="shrink-0 text-right text-xs text-muted-foreground">
          {new Date(getHistoryTimestamp(entry)).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
          <br />
          <span className="text-[10px]">
            {new Date(getHistoryTimestamp(entry)).toLocaleTimeString(
              undefined,
              {
                hour: "2-digit",
                minute: "2-digit",
              },
            )}
          </span>
        </p>
      </div>

      {hasChanges ? (
        <div className="mt-2 space-y-2">
          {changesEntries.length > 0 ? (
            <div className="grid gap-2">
              {changesEntries.map(([field, details]) => (
                <div
                  key={field}
                  className="overflow-hidden rounded-md border text-xs"
                >
                  <div className="bg-muted px-2 py-1 font-medium">
                    {field.replace(/_/g, " ")}
                  </div>
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 bg-background p-2">
                    <span
                      className="truncate text-muted-foreground line-through"
                      title={String(details.from ?? "None")}
                    >
                      {String(details.from ?? "None")}
                    </span>
                    <span className="text-muted-foreground">➔</span>
                    <span
                      className="truncate font-medium text-foreground"
                      title={String(details.to ?? "None")}
                    >
                      {String(details.to ?? "None")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-1">
              {changedFieldsLegacy.map((field) => (
                <span
                  key={field}
                  className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground"
                >
                  {field.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

interface ManageEventDetailViewProps {
  eventId: string;
  onBack?: () => void;
}

export function ManageEventDetailView({
  eventId,
  onBack,
}: ManageEventDetailViewProps) {
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("publishing");
  const router = useRouter();

  const {
    data: event,
    isLoading,
    isError,
    error,
  } = useManageEventDetail(eventId);

  const { data: userInfo } = useQuery({
    queryKey: ["user", "info", "events-manage"],
    queryFn: () => apiClient.get<Record<string, unknown>>(endpoints.user.info),
  });

  const canApprove = Boolean(
    (userInfo?.is_staff as boolean | undefined) ||
      (Array.isArray(userInfo?.roles) &&
        (userInfo.roles as string[]).some((role) =>
          role.toLowerCase().includes("admin"),
        )),
  );
  const canAdmin = canApprove;
  const canSelfPublish = canApprove || event?.organizer.type === "company";

  const deleteEvent = useDeleteEvent(eventId);
  const adminFeature = useAdminFeature(eventId);

  const sortedHistory = useMemo(() => {
    if (!event) return [];
    return [...event.edit_history].sort(
      (a, b) =>
        new Date(getHistoryTimestamp(b)).getTime() -
        new Date(getHistoryTimestamp(a)).getTime(),
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
    <div className="mx-auto w-full max-w-7xl space-y-6 px-1 pb-24 sm:pb-0">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-3 shadow-sm">
        <Button
          variant="ghost"
          onClick={() => {
            if (onBack) {
              onBack();
              return;
            }
            router.push("/dashboard/manage-events");
          }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="hidden flex-wrap gap-2 sm:flex">
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/dashboard/manage-events/${event.id}/edit`)
            }
          >
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => setConfirmCancelOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Cancel Event
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <EventDetailView
            eventId={eventId}
            showInterestButton={false}
            layout="content-only"
          />
        </div>
        <div className="hidden space-y-4 lg:col-span-1 lg:sticky lg:top-6 lg:block lg:self-start">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-xl bg-muted p-1 sm:grid-cols-4">
              <TabsTrigger value="publishing">Publishing</TabsTrigger>
              <TabsTrigger value="co-owners">Co-owners</TabsTrigger>
              <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="publishing" className="space-y-3 pt-3">
              <PublishFlowPanel
                event={event}
                canApprove={canApprove}
                canSelfPublish={canSelfPublish}
              />
              {canAdmin ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Feature on homepage
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Toggle featured visibility
                    </p>
                    <Switch
                      checked={event.is_featured}
                      onCheckedChange={(checked) =>
                        adminFeature.mutate(checked)
                      }
                      disabled={adminFeature.isPending}
                    />
                  </CardContent>
                </Card>
              ) : null}
            </TabsContent>

            <TabsContent value="co-owners" className="pt-3">
              <CoOwnersPanel eventId={eventId} />
            </TabsContent>

            <TabsContent value="collaborators" className="pt-3">
              <CollaboratorsPanel eventId={eventId} isManageView />
            </TabsContent>

            <TabsContent value="history" className="pt-3">
              <Card>
                <CardHeader>
                  <CardTitle>Edit History</CardTitle>
                </CardHeader>
                <CardContent className="max-h-[500px] space-y-3 overflow-y-auto">
                  {sortedHistory.length > 0 ? (
                    sortedHistory.map((entry) => (
                      <HistoryLogEntry key={entry.id} entry={entry} />
                    ))
                  ) : (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      No edit history yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur sm:hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-2">
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/dashboard/manage-events/${event.id}/edit`)
            }
          >
            Edit
          </Button>
          <Button variant="outline" onClick={() => setPanelOpen(true)}>
            Panels
          </Button>
          <Button
            variant="destructive"
            onClick={() => setConfirmCancelOpen(true)}
          >
            Cancel
          </Button>
        </div>
      </div>

      <Sheet open={panelOpen} onOpenChange={setPanelOpen}>
        <SheetContent
          side="bottom"
          className="h-[85vh] overflow-y-auto rounded-t-2xl sm:hidden"
        >
          <SheetHeader>
            <SheetTitle>Manage Panels</SheetTitle>
          </SheetHeader>

          <div className="mt-4">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 auto-rows-fr gap-1 rounded-xl bg-muted p-1 group-data-[orientation=horizontal]/tabs:!h-auto [&>*]:min-h-9 [&>*]:w-full [&>*]:flex-none [&>*]:px-2 [&>*]:text-xs">
                <TabsTrigger value="publishing">Publishing</TabsTrigger>
                <TabsTrigger value="co-owners">Co-owners</TabsTrigger>
                <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="publishing" className="space-y-3 pt-3">
                <PublishFlowPanel
                  event={event}
                  canApprove={canApprove}
                  canSelfPublish={canSelfPublish}
                />
                {canAdmin ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Feature on homepage
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Toggle featured visibility
                      </p>
                      <Switch
                        checked={event.is_featured}
                        onCheckedChange={(checked) =>
                          adminFeature.mutate(checked)
                        }
                        disabled={adminFeature.isPending}
                      />
                    </CardContent>
                  </Card>
                ) : null}
              </TabsContent>

              <TabsContent value="co-owners" className="pt-3">
                <CoOwnersPanel eventId={eventId} />
              </TabsContent>

              <TabsContent value="collaborators" className="pt-3">
                <CollaboratorsPanel eventId={eventId} isManageView />
              </TabsContent>

              <TabsContent value="history" className="pt-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Edit History</CardTitle>
                  </CardHeader>
                  <CardContent className="max-h-[500px] space-y-3 overflow-y-auto">
                    {sortedHistory.length > 0 ? (
                      sortedHistory.map((entry) => (
                        <HistoryLogEntry key={entry.id} entry={entry} />
                      ))
                    ) : (
                      <p className="py-4 text-center text-sm text-muted-foreground">
                        No edit history yet
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={confirmCancelOpen}
        onOpenChange={setConfirmCancelOpen}
        title="Cancel event"
        description="This action will cancel the event."
        onConfirm={() =>
          deleteEvent.mutate(undefined, {
            onSuccess: () => {
              setConfirmCancelOpen(false);
              router.push("/dashboard/manage-events");
            },
          })
        }
        isPending={deleteEvent.isPending}
        confirmLabel="Cancel Event"
      />
    </div>
  );
}
