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
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateSession } from "../hooks/use-sessions";
import type { Session } from "../schemas";

const EditSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    starts_at: z.string().min(1, "Start time is required"),
    ends_at: z.string().min(1, "End time is required"),
    meeting_link: z
      .string()
      .url("Must be a valid URL")
      .optional()
      .or(z.literal("")),
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
  const { mutate: update, isPending } = useUpdateSession(session?.id ?? "");

  const form = useForm<EditFormValues>({
    resolver: zodResolver(EditSchema),
    defaultValues: {
      title: "",
      description: "",
      starts_at: "",
      ends_at: "",
      meeting_link: "",
    },
  });

  useEffect(() => {
    if (session && open) {
      form.reset({
        title: session.title,
        description: session.description ?? "",
        starts_at: session.starts_at?.slice(0, 16) ?? "",
        ends_at: session.ends_at?.slice(0, 16) ?? "",
        meeting_link: session.meeting_link ?? "",
      });
    }
  }, [session, open, form]);

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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                name="meeting_link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting Link</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                  disabled={isPending}
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
