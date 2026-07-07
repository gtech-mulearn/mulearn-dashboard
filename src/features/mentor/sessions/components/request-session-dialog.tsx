"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { CustomDateTimePicker } from "@/components/ui/custom-datetime-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useUserProfile } from "@/features/profile";
import { useCreateStudentRequest } from "../hooks/use-student-requests";
import {
  StudentSessionRequestFormSchema,
  type StudentSessionRequestFormValues,
} from "../schemas";

export function RequestSessionDialog({
  open,
  onOpenChange,
  trigger,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const handleOpenChange = onOpenChange ?? setInternalOpen;

  const { data: profile } = useUserProfile();
  const createRequest = useCreateStudentRequest();

  const form = useForm<
    z.input<typeof StudentSessionRequestFormSchema>,
    // biome-ignore lint/suspicious/noExplicitAny: react-hook-form context type param
    any,
    StudentSessionRequestFormValues
  >({
    resolver: zodResolver(StudentSessionRequestFormSchema),
    defaultValues: {
      title: "",
      description: "",
      // All sessions are Interest-Group scoped — campus/company requests are
      // no longer supported by the backend.
      session_type: "ig_session",
      entity_id: "",
      mode: "ONLINE",
      starts_at: "",
      ends_at: "",
      meeting_link: "",
      venue: "",
    },
  });

  const mode = form.watch("mode");

  function onSubmit(values: StudentSessionRequestFormValues) {
    if (!values.entity_id) {
      toast.error("Please select a valid entity.");
      return;
    }
    createRequest.mutate(values, {
      onSuccess: () => {
        handleOpenChange(false);
        form.reset();
      },
    });
  }

  // Students request sessions scoped to one of their Interest Groups.
  const entityOptions: { id: string; name: string }[] = (
    profile?.interest_groups || []
  )
    .map((ig) => ({ id: ig.id ?? "", name: ig.name }))
    .filter((ig) => ig.id !== "");

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request a Session</DialogTitle>
          <DialogDescription>
            Request a mentorship session from the mentors of one of your
            Interest Groups.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="entity_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interest Group</FormLabel>
                  {entityOptions.length === 0 ? (
                    <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                      You're not part of any Interest Group yet. Join an
                      Interest Group to request a mentorship session.
                    </div>
                  ) : (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an Interest Group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {entityOptions.map((opt) => (
                          <SelectItem key={opt.id} value={opt.id}>
                            {opt.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="E.g., Need help with React Hooks"
                      {...field}
                    />
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
                      placeholder="Briefly describe what you need help with..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="starts_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proposed Start Time</FormLabel>
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
                    <FormLabel>Proposed End Time</FormLabel>
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

            <div className="grid grid-cols-2 gap-4">
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

              <FormField
                control={form.control}
                name="max_participants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Participants</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="e.g. 5"
                        {...field}
                        value={
                          (field.value as string | number | undefined) ?? ""
                        }
                        onChange={(e) =>
                          field.onChange(e.target.valueAsNumber || undefined)
                        }
                        onWheel={(e) => e.currentTarget.blur()}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {["ONLINE", "HYBRID"].includes(mode) && (
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

            {["OFFLINE", "HYBRID"].includes(mode) && (
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

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={createRequest.isPending}>
                {createRequest.isPending ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
