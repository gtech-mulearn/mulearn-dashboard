"use client";

import { Clock, Plus, Radio, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StateDisplay } from "@/components/ui/state-display";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateEventTemplate,
  useDeleteEventTemplate,
  useEventTemplates,
} from "@/features/company-jobs/hooks";

export function CompanyTemplatesPageClient() {
  // Event templates state & hooks
  const { data: eventTemplates = [], isLoading: isLoadingEventTemplates } =
    useEventTemplates();
  const createEventTemplateMutation = useCreateEventTemplate();
  const deleteEventTemplateMutation = useDeleteEventTemplate();

  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventType, setEventType] = useState("tech_talk");
  const [eventMode, setEventMode] = useState("ONLINE");
  const [eventDuration, setEventDuration] = useState("90");
  const [deleting, setDeleting] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const handleCreateEventTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDescription.trim()) {
      toast.error("Please provide an event title and description.");
      return;
    }
    try {
      await createEventTemplateMutation.mutateAsync({
        title: eventTitle.trim(),
        description: eventDescription.trim(),
        event_type: eventType,
        default_duration_minutes: Number(eventDuration) || 90,
        mode: eventMode,
      });
      toast.success("Event template created successfully!");
      setEventTitle("");
      setEventDescription("");
      setEventDuration("90");
      setIsCreateEventOpen(false);
    } catch {
      toast.error("Failed to create event template.");
    }
  };

  const handleDeleteEventTemplate = async () => {
    if (!deleting) return;
    try {
      await deleteEventTemplateMutation.mutateAsync(deleting.id);
      toast.success("Event template deleted.");
      setDeleting(null);
    } catch {
      toast.error("Failed to delete event template.");
    }
  };

  return (
    <div className="space-y-8">
      <div data-tour-id="page:company-templates:header">
        <PageHeader
          title="Event Templates"
          description="Standardize your organization's recurrent technical event workshops."
          action={
            <Button
              className="shrink-0"
              data-tour-id="page:company-templates:create"
              onClick={() => setIsCreateEventOpen(true)}
            >
              <Plus />
              Create Event Template
            </Button>
          }
        />
      </div>

      <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Event Template</DialogTitle>
            <DialogDescription>
              Save a standardized agenda and format for workshops, AMAs, or tech
              talks.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateEventTemplate} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="event-t-title">Event Title</Label>
              <Input
                id="event-t-title"
                placeholder="e.g. Masterclass: Scalable Backend Architecture"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event-t-type">Event Type</Label>
                <Select value={eventType} onValueChange={setEventType}>
                  <SelectTrigger id="event-t-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tech_talk">Tech Talk</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="ama">Mentor AMA</SelectItem>
                    <SelectItem value="hackathon">Hackathon</SelectItem>
                    <SelectItem value="webinar">Webinar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-t-mode">Event Mode</Label>
                <Select value={eventMode} onValueChange={setEventMode}>
                  <SelectTrigger id="event-t-mode">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONLINE">Online</SelectItem>
                    <SelectItem value="OFFLINE">Offline</SelectItem>
                    <SelectItem value="HYBRID">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-t-duration">Duration (mins)</Label>
                <Input
                  id="event-t-duration"
                  type="number"
                  min="1"
                  placeholder="90"
                  value={eventDuration}
                  onChange={(e) => setEventDuration(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-t-desc">Overview Description</Label>
              <Textarea
                id="event-t-desc"
                placeholder="Describe target audience, agenda breakdown, and key takeaways..."
                rows={4}
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateEventOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createEventTemplateMutation.isPending}
              >
                {createEventTemplateMutation.isPending
                  ? "Saving..."
                  : "Save Template"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {isLoadingEventTemplates ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      ) : eventTemplates.length === 0 ? (
        <StateDisplay
          variant="no-results"
          className="rounded-2xl border border-dashed"
          title="No Event Templates Yet"
          description="Save repeatable workshops, hackathon schedules, and AMA session formats."
          action={
            <Button
              variant="outline"
              onClick={() => setIsCreateEventOpen(true)}
            >
              <Plus />
              Create Event Template
            </Button>
          }
        />
      ) : (
        <div
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          data-tour-id="page:company-templates:list"
        >
          {eventTemplates.map((template) => (
            <Card key={template.id} className="flex flex-col justify-between">
              <CardHeader className="space-y-2 pb-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <Badge variant="outline" className="capitalize">
                    {template.event_type.replace(/_/g, " ")}
                  </Badge>
                  <div className="flex items-center gap-1.5">
                    {template.default_duration_minutes && (
                      <Badge variant="secondary" className="gap-1">
                        <Clock className="size-3" />
                        {template.default_duration_minutes}m
                      </Badge>
                    )}
                    {template.mode && (
                      <Badge variant="secondary" className="gap-1">
                        <Radio className="size-3" />
                        {template.mode}
                      </Badge>
                    )}
                  </div>
                </div>
                <CardTitle className="line-clamp-1">{template.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {template.description}
                </p>
              </CardContent>
              <CardFooter className="pt-2 border-t flex justify-end">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() =>
                    setDeleting({ id: template.id, title: template.title })
                  }
                >
                  <Trash2 />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        variant="destructive"
        title="Delete this template?"
        description={`"${deleting?.title ?? ""}" will be removed. Events already created from it are not affected.`}
        confirmLabel="Delete"
        isPending={deleteEventTemplateMutation.isPending}
        onConfirm={handleDeleteEventTemplate}
      />
    </div>
  );
}
