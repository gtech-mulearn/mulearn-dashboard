"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
import { useNavigationGuard } from "@/hooks/use-navigation-guard";
import type { ManagePanelSectionValue } from "../constants";
import { MANAGE_PANEL_SECTIONS } from "../constants";
import {
  historyAction,
  historyTarget,
  historyTimestamp,
  useAdminFeature,
  useDeleteEvent,
  useManageEventDetail,
} from "../hooks";
import type {
  HistoryLogEntryProps,
  ManageEventDetailViewProps,
} from "../types";
import { CoOwnersPanel } from "./co-owners-panel";
import { CollaboratorsPanel } from "./collaborators-panel";
import { EventAnalyticsPanel } from "./event-analytics-panel";
import { EventDetailView } from "./event-detail-view";
import { EventInlineEditForm } from "./event-inline-edit-form";
import { PublishFlowPanel } from "./publish-flow-panel";

function HistoryLogEntry({ entry }: HistoryLogEntryProps) {
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
            {entry.summary ?? historyAction(entry)}
            {historyTarget(entry) && !entry.summary
              ? ` · ${historyTarget(entry)}`
              : ""}
          </p>
        </div>
        <p className="shrink-0 text-right text-xs text-muted-foreground">
          {new Date(historyTimestamp(entry)).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
          <br />
          <span className="text-[10px]">
            {new Date(historyTimestamp(entry)).toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })}
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

export function ManageEventDetailView({
  eventId,
  onBack,
}: ManageEventDetailViewProps) {
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeTab, setActiveTab] =
    useState<ManagePanelSectionValue>("publishing");
  const [isEditing, setIsEditing] = useState(false);
  const [isEditSaveArmed, setIsEditSaveArmed] = useState(false);
  const [formIsDirty, setFormIsDirty] = useState(false);
  const [pendingBackAfterConfirm, setPendingBackAfterConfirm] = useState(false);
  const [inlineFormKey, setInlineFormKey] = useState(0);
  const router = useRouter();

  useNavigationGuard(
    isEditing && formIsDirty,
    "You have unsaved changes. Are you sure you want to leave?",
  );

  const {
    data: event,
    isLoading,
    isError,
    error,
    refetch,
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
        new Date(historyTimestamp(b)).getTime() -
        new Date(historyTimestamp(a)).getTime(),
    );
  }, [event]);

  useEffect(() => {
    if (!isEditing) return;
    const timer = window.setTimeout(() => {
      setIsEditSaveArmed(true);
    }, 450);

    return () => window.clearTimeout(timer);
  }, [isEditing]);

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (isError || !event) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : "Failed to load event"}
      </p>
    );
  }

  const mapQuery = [event.venue.address, event.venue.city]
    .filter(Boolean)
    .join(", ");
  const mapsUrl = event.venue.maps_url;
  const venueName = event.venue.address ?? event.venue.city ?? null;

  const requestBack = () => {
    if (isEditing && formIsDirty) {
      setPendingBackAfterConfirm(true);
      setConfirmDiscardOpen(true);
      return;
    }

    if (onBack) {
      onBack();
      return;
    }
    router.push("/dashboard/manage-events");
  };

  const handleDiscard = () => {
    if (formIsDirty) {
      setPendingBackAfterConfirm(false);
      setConfirmDiscardOpen(true);
      return;
    }
    setIsEditing(false);
    setIsEditSaveArmed(false);
    setFormIsDirty(false);
    setInlineFormKey((value) => value + 1);
  };

  const enterEditMode = () => {
    setIsEditing(true);
    setIsEditSaveArmed(false);
  };

  const renderPanelSection = (panel: ManagePanelSectionValue) => {
    if (panel === "publishing") {
      return (
        <div className="space-y-3 pt-3">
          <PublishFlowPanel
            event={event}
            canApprove={canApprove}
            canSelfPublish={canSelfPublish}
          />
          {canAdmin ? (
            <Card className="rounded-2xl border-border bg-card lc-card-shadow">
              <CardHeader>
                <CardTitle className="text-base">Feature on homepage</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Toggle featured visibility
                </p>
                <Switch
                  checked={event.is_featured}
                  onCheckedChange={(checked) => adminFeature.mutate(checked)}
                  disabled={adminFeature.isPending}
                />
              </CardContent>
            </Card>
          ) : null}
        </div>
      );
    }

    if (panel === "co-owners") {
      return (
        <div className="pt-3">
          <CoOwnersPanel eventId={eventId} />
        </div>
      );
    }

    if (panel === "collaborators") {
      return (
        <div className="pt-3">
          <CollaboratorsPanel eventId={eventId} isManageView />
        </div>
      );
    }

    return (
      <div className="pt-3">
        <Card className="rounded-2xl border-border bg-card lc-card-shadow">
          <CardHeader>
            <CardTitle className="text-base">Edit History</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[280px] space-y-3 overflow-y-auto pr-1 sm:max-h-[360px] lg:max-h-[420px]">
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
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-1 pb-24 sm:pb-0 lc-fade-in">
      <div className="rounded-2xl border border-border bg-card p-3 lc-card-shadow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            onClick={requestBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          <div className="hidden flex-wrap gap-2 sm:flex">
            {!isEditing ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="border-border text-foreground hover:border-primary hover:text-primary"
                  onClick={enterEditMode}
                >
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => setConfirmCancelOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Cancel Event
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="submit"
                  form={`event-inline-edit-form-${event.id}`}
                  disabled={!isEditSaveArmed}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  className="border-border text-foreground"
                  onClick={handleDiscard}
                >
                  Discard
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {isEditing ? (
            <EventInlineEditForm
              key={inlineFormKey}
              event={event}
              onSave={() => {
                setIsEditing(false);
                setIsEditSaveArmed(false);
                setFormIsDirty(false);
                refetch();
              }}
              onDiscard={() => {
                setIsEditing(false);
                setIsEditSaveArmed(false);
                setFormIsDirty(false);
              }}
              onDirtyChange={setFormIsDirty}
            />
          ) : (
            <EventDetailView
              eventId={eventId}
              showInterestButton={false}
              layout="content-only"
              showVenue={false}
            />
          )}
        </div>

        <div
          className="hidden space-y-4 lg:col-span-1 lg:sticky lg:top-6 lg:block lg:self-start lc-slide-up"
          style={{ animationDelay: "100ms" }}
        >
          <EventAnalyticsPanel
            interestCount={event.interest_count}
            venueName={venueName}
            mapsUrl={mapsUrl}
            mapQuery={mapQuery}
          />

          <div className="overflow-hidden rounded-2xl border border-border bg-card lc-card-shadow">
            <Tabs
              value={activeTab}
              onValueChange={(value) =>
                setActiveTab(value as ManagePanelSectionValue)
              }
            >
              <TabsList className="grid h-auto w-full grid-cols-4 rounded-none border-b border-border bg-muted p-0">
                {MANAGE_PANEL_SECTIONS.map((panel) => (
                  <TabsTrigger
                    key={panel.value}
                    value={panel.value}
                    className="rounded-none border-b-2 border-transparent text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary"
                  >
                    {panel.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {MANAGE_PANEL_SECTIONS.map((panel) => (
                <TabsContent
                  key={panel.value}
                  value={panel.value}
                  className="m-0 p-4"
                >
                  {renderPanelSection(panel.value)}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur sm:hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-2">
          {!isEditing ? (
            <Button
              type="button"
              variant="outline"
              className="border-border text-foreground"
              onClick={enterEditMode}
            >
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Button>
          ) : (
            <>
              <Button
                type="submit"
                form={`event-inline-edit-form-${event.id}`}
                disabled={!isEditSaveArmed}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Save Changes
              </Button>
              <Button
                variant="outline"
                className="border-border text-foreground"
                onClick={handleDiscard}
              >
                Discard
              </Button>
            </>
          )}
          <Button variant="outline" onClick={() => setPanelOpen(true)}>
            More Options
          </Button>
          <Button
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
            <SheetTitle>Event Management</SheetTitle>
          </SheetHeader>

          <div className="mt-4 space-y-4">
            <EventAnalyticsPanel
              interestCount={event.interest_count}
              venueName={venueName}
              mapsUrl={mapsUrl}
              mapQuery={mapQuery}
            />

            <div className="overflow-hidden rounded-2xl border border-border bg-card lc-card-shadow">
              <Tabs
                value={activeTab}
                onValueChange={(value) =>
                  setActiveTab(value as ManagePanelSectionValue)
                }
              >
                <TabsList className="grid h-auto w-full grid-cols-2 rounded-none border-b border-border bg-muted p-0">
                  {MANAGE_PANEL_SECTIONS.map((panel) => (
                    <TabsTrigger
                      key={panel.value}
                      value={panel.value}
                      className="rounded-none border-b-2 border-transparent text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary"
                    >
                      {panel.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {MANAGE_PANEL_SECTIONS.map((panel) => (
                  <TabsContent
                    key={panel.value}
                    value={panel.value}
                    className="m-0 p-4"
                  >
                    {renderPanelSection(panel.value)}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
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

      <ConfirmDialog
        open={confirmDiscardOpen}
        onOpenChange={setConfirmDiscardOpen}
        title="Discard unsaved changes?"
        description="All unsaved changes will be lost."
        confirmLabel="Discard"
        onConfirm={() => {
          setConfirmDiscardOpen(false);
          setIsEditing(false);
          setIsEditSaveArmed(false);
          setFormIsDirty(false);
          setInlineFormKey((value) => value + 1);

          if (pendingBackAfterConfirm) {
            setPendingBackAfterConfirm(false);
            if (onBack) {
              onBack();
            } else {
              router.push("/dashboard/manage-events");
            }
          }
        }}
      />
    </div>
  );
}
