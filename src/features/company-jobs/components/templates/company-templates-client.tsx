"use client";

import {
  CheckSquare,
  CalendarCheck,
  Clock,
  Coins,
  Copy,
  Hash,
  Layers,
  Plus,
  Radio,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateEventTemplate,
  useDeleteEventTemplate,
  useEventTemplates,
} from "@/features/company-jobs/hooks";

export function CompanyTemplatesPageClient() {
  const router = useRouter();

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

  const handleDeleteEventTemplate = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete template "${title}"?`))
      return;
    try {
      await deleteEventTemplateMutation.mutateAsync(id);
      toast.success("Event template deleted.");
    } catch {
      toast.error("Failed to delete event template.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Layers className="h-8 w-8 text-primary" />
            Event Templates
          </h1>
          <p className="text-muted-foreground mt-1">
            Standardize your organization&apos;s recurrent technical event
            workshops.
          </p>
        </div>

        <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shrink-0">
              <Plus className="h-4 w-4" />
              Create Event Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Event Template</DialogTitle>
              <DialogDescription>
                Save a standardized agenda and format for workshops, AMAs, or
                tech talks.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={handleCreateEventTemplate}
              className="space-y-4 py-2"
            >
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

        {/* ─── TAB 2: Event Templates ─── */}
        <TabsContent
          value="event-templates"
          className="space-y-6 focus-visible:outline-none"
        >
          {isLoadingEventTemplates ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-56 w-full" />
              <Skeleton className="h-56 w-full" />
              <Skeleton className="h-56 w-full" />
            </div>
          ) : eventTemplates.length === 0 ? (
            <div className="text-center py-12 border rounded-lg border-dashed">
              <CalendarCheck className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <h3 className="font-semibold text-foreground text-base">
                No Event Templates Yet
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                Save repeatable workshops, hackathon schedules, and AMA session
                formats.
              </p>
              <Button
                onClick={() => setIsCreateEventOpen(true)}
                className="mt-4 gap-2"
                variant="outline"
              >
                <Plus className="h-4 w-4" />
                Create Event Template
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {eventTemplates.map((template) => (
                <Card
                  key={template.id}
                  className="flex flex-col justify-between"
                >
                  <CardHeader className="space-y-2 pb-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className="text-xs uppercase font-medium"
                      >
                        {template.event_type.replace(/_/g, " ")}
                      </Badge>
                      <div className="flex items-center gap-1.5">
                        {template.default_duration_minutes && (
                          <Badge
                            variant="secondary"
                            className="text-xs flex items-center gap-1 font-normal"
                          >
                            <Clock className="h-3 w-3" />
                            {template.default_duration_minutes}m
                          </Badge>
                        )}
                        {template.mode && (
                          <Badge
                            variant="secondary"
                            className="text-xs flex items-center gap-1 font-normal"
                          >
                            <Radio className="h-3 w-3" />
                            {template.mode}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-base font-bold line-clamp-1">
                      {template.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {template.description}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-2 border-t flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs"
                      onClick={() =>
                        handleDeleteEventTemplate(template.id, template.title)
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </div>
    </div>
  );
}
