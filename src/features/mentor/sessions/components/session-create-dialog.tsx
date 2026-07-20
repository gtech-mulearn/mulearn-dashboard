"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

import { type Resolver, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { CustomDateTimePicker } from "@/components/ui/custom-datetime-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTaskIgDropdown } from "@/features/mentor/tasks/hooks/use-mentor-tasks";
import { useCreateSession } from "../hooks/use-sessions";
import { SessionFormSchema, type SessionFormValues } from "../schemas";
import { z } from "zod";

const CreateSessionFormSchema = SessionFormSchema.superRefine((v, ctx) => {
  if (new Date(v.starts_at) < new Date()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Start time cannot be in the past",
      path: ["starts_at"],
    });
  }
});

interface SessionCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SessionCreateDialog({
  open,
  onOpenChange,
}: SessionCreateDialogProps) {
  // Every session is scoped to one of the mentor's Interest Groups.
  const { data: myIgs = [] } = useTaskIgDropdown();

  const { mutate: create, isPending } = useCreateSession();

  const form = useForm<SessionFormValues>({
    resolver: zodResolver(
      CreateSessionFormSchema,
    ) as Resolver<SessionFormValues>,
    defaultValues: {
      title: "",
      description: "",
      ig_id: "",
      mode: "ONLINE",
      starts_at: "",
      ends_at: "",
      meeting_link: "",
      venue: "",
      is_recurring: false,
      recurrence_type: "WEEKLY",
      recurrence_interval: 1,
      recurrence_end_date: "",
    },
  });

  const mode = form.watch("mode");
  const startsAt = form.watch("starts_at");

  useEffect(() => {
    if (open) {
      const now = new Date();
      const startsAt = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      const endsAt = new Date(
        oneHourLater.getTime() - oneHourLater.getTimezoneOffset() * 60000,
      )
        .toISOString()
        .slice(0, 16);

      form.setValue("starts_at", startsAt);
      form.setValue("ends_at", endsAt);
    }
  }, [open, form]);

  function onSubmit(values: SessionFormValues) {
    create(values, {
      onSuccess: () => {
        onOpenChange(false);
        form.reset();
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-0 p-0 max-w-lg">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-4">
          <DialogTitle>New Session</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col min-h-0"
          >
            <div className="overflow-y-auto px-6 py-4 space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Session title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What will you cover?"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {myIgs.length > 0 ? (
                <FormField
                  control={form.control}
                  name="ig_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interest Group</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Interest Group" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {myIgs.map((ig) => (
                            <SelectItem key={ig.id} value={ig.id}>
                              {ig.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                  You need to mentor an Interest Group to create a session. Add
                  one in your profile first.
                </div>
              )}

              <FormField
                control={form.control}
                name="starts_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Starts At</FormLabel>
                    <FormControl>
                      <CustomDateTimePicker
                        value={field.value}
                        onChange={(val) => {
                          field.onChange(val);
                          form.trigger("starts_at");
                          form.trigger("ends_at");
                        }}
                        minDate={new Date()}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ends_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ends At</FormLabel>
                    <FormControl>
                      <CustomDateTimePicker
                        value={field.value}
                        onChange={(val) => {
                          field.onChange(val);
                          form.trigger("ends_at");
                        }}
                        minDate={startsAt ? new Date(startsAt) : new Date()}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mode</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ONLINE">Online</SelectItem>
                        <SelectItem value="OFFLINE">Offline</SelectItem>
                        <SelectItem value="HYBRID">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(mode === "ONLINE" || mode === "HYBRID") && (
                <FormField
                  control={form.control}
                  name="meeting_link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meeting Link</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://meet.google.com/..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {(mode === "OFFLINE" || mode === "HYBRID") && (
                <FormField
                  control={form.control}
                  name="venue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location (Google Maps link)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://maps.google.com/... or an address"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Recurring sessions are temporarily disabled — the recurrence
                  flow has open bugs. Sessions are created as one-off; the
                  is_recurring default (false) is still sent in the payload. */}
            </div>

            <div className="shrink-0 flex justify-end gap-2 px-6 py-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Session"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
