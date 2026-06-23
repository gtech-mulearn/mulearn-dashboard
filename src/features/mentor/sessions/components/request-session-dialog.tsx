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
import { useUserProfile } from "@/features/profile/hooks/use-profile";
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

  // biome-ignore lint/suspicious/noExplicitAny: API type
  const form = useForm<
    z.input<typeof StudentSessionRequestFormSchema>,
    any,
    StudentSessionRequestFormValues
  >({
    resolver: zodResolver(StudentSessionRequestFormSchema),
    defaultValues: {
      title: "",
      description: "",
      session_type: "campus_session",
      entity_id: profile?.college_id ?? "",
      mode: "ONLINE",
      starts_at: "",
      ends_at: "",
      meeting_link: "",
      venue: "",
    },
  });

  const sessionType = form.watch("session_type");
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

  // Generate entity options based on selected type
  let entityOptions: { id: string; name: string }[] = [];
  if (profile) {
    if (sessionType === "campus_session") {
      if (profile.college_id) {
        entityOptions.push({ id: profile.college_id, name: "My Campus" });
      }
    } else if (sessionType === "company_session") {
      // Assuming college_id stores the org ID if it's a company as well
      if (profile.college_id) {
        entityOptions.push({ id: profile.college_id, name: "My Company" });
      }
    } else if (sessionType === "ig_session") {
      entityOptions = (profile.interest_groups || [])
        .map((ig) => ({
          id: ig.id ?? "",
          name: ig.name,
        }))
        .filter((ig) => ig.id !== "");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request a Session</DialogTitle>
          <DialogDescription>
            Request a mentorship session from your Campus, Company, or Interest
            Group mentors.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="session_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session Type</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        form.setValue("entity_id", "");
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="campus_session">Campus</SelectItem>
                        <SelectItem value="company_session">Company</SelectItem>
                        <SelectItem value="ig_session">
                          Interest Group (IG)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="entity_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entity</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select entity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {entityOptions.length === 0 && (
                          <SelectItem value="none" disabled>
                            No available options
                          </SelectItem>
                        )}
                        {entityOptions.map((opt) => (
                          <SelectItem key={opt.id} value={opt.id}>
                            {opt.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                    <FormLabel>Venue</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Library Room 1" {...field} />
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
