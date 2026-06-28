"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

import { useForm } from "react-hook-form";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMentorOverview } from "@/features/mentor/hooks";
import { useTaskIgDropdown } from "@/features/mentor/tasks/hooks/use-mentor-tasks";
import { useCreateSession } from "../hooks/use-sessions";
import { SessionFormSchema, type SessionFormValues } from "../schemas";

interface SessionCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SessionCreateDialog({
  open,
  onOpenChange,
}: SessionCreateDialogProps) {
  const { data: myIgs = [] } = useTaskIgDropdown();

  // Company mentors are scoped to their org by the backend and do not pick an
  // IG. Detect the tier from the mentor overview scopes.
  const { data: overview } = useMentorOverview();
  const companyScope = overview?.scopes?.find(
    (s) => s.scope_type === "COMPANY_MENTOR",
  );
  const isCompanyMentor = !!companyScope;

  const { mutate: create, isPending } = useCreateSession();

  const form = useForm<SessionFormValues>({
    resolver: zodResolver(SessionFormSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      ig_id: "",
      is_company_session: false,
      mode: "ONLINE",
      starts_at: "",
      ends_at: "",
      meeting_link: "",
      venue: "",
      is_recurring: false,
      recurrence_type: "WEEKLY",
      recurrence_interval: 1,
      recurrence_end_date: "",
    } as any,
  });

  const isRecurring = form.watch("is_recurring");
  const mode = form.watch("mode");

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

  // Keep the company-session discriminator in sync with the detected tier so
  // the schema skips the IG requirement and the payload omits the IG.
  useEffect(() => {
    form.setValue("is_company_session", isCompanyMentor);
  }, [isCompanyMentor, form]);

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
            onSubmit={form.handleSubmit(onSubmit as any)}
            className="flex flex-col min-h-0"
          >
            <div className="overflow-y-auto px-6 py-4 space-y-4">
              <FormField
                control={form.control as any}
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
                control={form.control as any}
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

              {isCompanyMentor ? (
                <div className="space-y-2">
                  {/* Plain label — FormLabel requires a FormField context. */}
                  <span className="text-sm font-medium leading-none">
                    Company
                  </span>
                  <Input value={companyScope?.scope_name ?? ""} disabled />
                  <p className="text-xs text-muted-foreground">
                    This session will be scoped to your company.
                  </p>
                </div>
              ) : (
                <FormField
                  control={form.control as any}
                  name="ig_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interest Group</FormLabel>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
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
                          </div>
                        </TooltipTrigger>
                        {myIgs.length === 0 && (
                          <TooltipContent>
                            Link to an IG first via your profile
                          </TooltipContent>
                        )}
                      </Tooltip>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control as any}
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
                control={form.control as any}
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

              <FormField
                control={form.control as any}
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
                  control={form.control as any}
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
                  control={form.control as any}
                  name="venue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue</FormLabel>
                      <FormControl>
                        <Input placeholder="Location, e.g., Lab 3" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control as any}
                name="is_recurring"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Recurring Session
                      </FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Repeat this session on a schedule.
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {isRecurring && (
                <div className="grid grid-cols-2 gap-4 rounded-lg border p-4 bg-muted/20">
                  <FormField
                    control={form.control as any}
                    name="recurrence_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequency</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="DAILY">Daily</SelectItem>
                            <SelectItem value="WEEKLY">Weekly</SelectItem>
                            <SelectItem value="MONTHLY">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name="recurrence_interval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Every X{" "}
                          {form.watch("recurrence_type")?.toLowerCase() ||
                            "weeks"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value, 10) || 1)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name="recurrence_end_date"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>End Series On</FormLabel>
                        <FormControl>
                          <CustomDateTimePicker
                            value={field.value}
                            onChange={field.onChange}
                            hideTime
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
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
