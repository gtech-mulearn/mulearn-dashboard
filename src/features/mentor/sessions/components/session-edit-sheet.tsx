"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { CustomDateTimePicker } from "@/components/ui/custom-datetime-picker";
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
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { utcIsoToLocalInput } from "@/lib/datetime";
import { useSessionDetail, useUpdateSession } from "../hooks/use-sessions";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle } from "lucide-react";
import type { Session } from "../schemas";

const EditSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    starts_at: z.string().min(1, "Start time is required"),
    ends_at: z.string().min(1, "End time is required"),
    mode: z.enum(["ONLINE", "OFFLINE", "HYBRID"]),
    meeting_link: z
      .string()
      .url("Must be a valid URL")
      .optional()
      .or(z.literal("")),
    venue: z.string().optional(),
    apply_to_series: z.boolean().optional().default(false),
  })
  .refine((v) => new Date(v.ends_at) > new Date(v.starts_at), {
    message: "End time must be after start time",
    path: ["ends_at"],
  });
type EditFormValues = z.infer<typeof EditSchema>;

interface SessionEditSheetProps {
  session: Session | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SessionEditSheet({
  session,
  open,
  onOpenChange,
}: SessionEditSheetProps) {
  const { data: detail } = useSessionDetail(session?.id ?? "", open);
  const currentSession = detail ?? session;

  const status = currentSession?.status ?? "SCHEDULED";
  const isReadOnly = ["COMPLETED", "CANCELLED", "REJECTED"].includes(status);

  const { mutate: update, isPending } = useUpdateSession(
    currentSession?.id ?? "",
  );

  const form = useForm<EditFormValues>({
    resolver: zodResolver(EditSchema),
    defaultValues: {
      title: "",
      description: "",
      starts_at: "",
      ends_at: "",
      mode: "ONLINE",
      meeting_link: "",
      venue: "",
      apply_to_series: false,
    },
  });

  const mode = form.watch("mode");

  useEffect(() => {
    if (currentSession && open) {
      form.reset({
        title: currentSession.title,
        description: currentSession.description ?? "",
        starts_at: utcIsoToLocalInput(currentSession.starts_at),
        ends_at: utcIsoToLocalInput(currentSession.ends_at),
        mode:
          (currentSession.mode as "ONLINE" | "OFFLINE" | "HYBRID" | null) ||
          "ONLINE",
        meeting_link: currentSession.meeting_link ?? "",
        venue: currentSession.venue ?? "",
        apply_to_series: false,
      });
    }
  }, [currentSession, open, form]);

  function onSubmit(values: EditFormValues) {
    update(values, {
      onSuccess: () => onOpenChange(false),
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg flex flex-col overflow-y-auto p-0"
      >
        <SheetHeader className="px-6 py-5 border-b">
          <SheetTitle className="text-xl">Edit Session</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {isReadOnly && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                Cannot edit a session that is <strong>{status}</strong>.
              </span>
            </div>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <fieldset disabled={isReadOnly} className="space-y-5">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        <Textarea rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="starts_at"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Starts At</FormLabel>
                        <FormControl>
                          <CustomDateTimePicker
                            value={field.value}
                            onChange={field.onChange}
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
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="mode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mode</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
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
                            placeholder="https://..."
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
                            placeholder="https://maps.google.com/..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {currentSession?.is_recurring && (
                  <FormField
                    control={form.control}
                    name="apply_to_series"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/20">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="cursor-pointer">
                            Apply changes to all upcoming sessions in this
                            series
                          </FormLabel>
                          <p className="text-xs text-muted-foreground">
                            Logistical fields (title, description, mode, venue,
                            meeting link) will propagate to scheduled sibling
                            sessions. Individual start/end times remain
                            unchanged.
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                )}
              </fieldset>

              <Separator />
              <div className="flex justify-end gap-3 pt-2 pb-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full px-6"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || isReadOnly}
                  className="rounded-full px-6"
                >
                  {isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
