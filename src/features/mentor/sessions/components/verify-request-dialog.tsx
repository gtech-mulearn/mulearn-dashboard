"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { CustomDateTimePicker } from "@/components/ui/custom-datetime-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useVerifyStudentRequest } from "../hooks/use-student-requests";
import {
  MentorVerifyRequestSchema,
  type MentorVerifyRequestValues,
  type StudentSessionRequest,
} from "../schemas";

export function VerifyRequestDialog({
  request,
  open,
  onOpenChange,
}: {
  request: StudentSessionRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const verifyMutation = useVerifyStudentRequest();

  const form = useForm<MentorVerifyRequestValues>({
    resolver: zodResolver(MentorVerifyRequestSchema),
    defaultValues: {
      status: "APPROVED",
      starts_at: "",
      ends_at: "",
      mode: "ONLINE",
      meeting_link: "",
      venue: "",
    },
  });

  useEffect(() => {
    if (request) {
      form.reset({
        status: "APPROVED",
        starts_at: request.starts_at.slice(0, 16),
        ends_at: request.ends_at.slice(0, 16),
        mode: request.mode as "ONLINE" | "OFFLINE" | "HYBRID",
        meeting_link: request.meeting_link ?? "",
        venue: request.venue ?? "",
      });
    }
  }, [request, form]);

  const status = form.watch("status");
  const mode = form.watch("mode");

  function onSubmit(values: MentorVerifyRequestValues) {
    if (!request) return;

    // If rejected, strip out overrides
    const payload =
      values.status === "REJECTED" ? { status: "REJECTED" as const } : values;

    verifyMutation.mutate(
      { id: request.id, data: payload },
      {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      },
    );
  }

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Verify Session Request</DialogTitle>
          <DialogDescription>
            Approve or reject the session request from{" "}
            {request.requested_by_name}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Action</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="APPROVED">Approve Request</SelectItem>
                      <SelectItem value="REJECTED" className="text-destructive">
                        Reject Request
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {status === "APPROVED" && (
              <div className="space-y-4 border p-4 rounded-md bg-muted/20">
                <h4 className="text-sm font-medium">Session Overrides</h4>
                <p className="text-xs text-muted-foreground">
                  You can adjust the schedule or logistics to suit your
                  availability.
                </p>

                <div className="grid grid-cols-1 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="starts_at"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
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
                        <FormLabel>End Time</FormLabel>
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

                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="mode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mode</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
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
                </div>

                {mode && ["ONLINE", "HYBRID"].includes(mode) && (
                  <FormField
                    control={form.control}
                    name="meeting_link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meeting Link</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://meet.google.com/..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {mode && ["OFFLINE", "HYBRID"].includes(mode) && (
                  <FormField
                    control={form.control}
                    name="venue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Venue</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Room 1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={verifyMutation.isPending}
                variant={status === "REJECTED" ? "destructive" : "default"}
              >
                {verifyMutation.isPending
                  ? "Processing..."
                  : status === "REJECTED"
                    ? "Reject"
                    : "Approve & Schedule"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
