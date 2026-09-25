"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Megaphone } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useDispatchAdminBroadcast } from "../../hooks";
import {
  type AdminBroadcastDispatchPayload,
  AdminBroadcastDispatchSchema,
} from "../../schemas";

interface AdminBroadcastDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminBroadcastDialog({
  open,
  onOpenChange,
}: AdminBroadcastDialogProps) {
  const { mutate: dispatch, isPending } = useDispatchAdminBroadcast();

  const form = useForm<AdminBroadcastDispatchPayload>({
    resolver: zodResolver(AdminBroadcastDispatchSchema),
    defaultValues: {
      title: "",
      description: "",
      redirect_url: "",
      expires_in_days: 7,
    },
  });

  const titleValue = form.watch("title") ?? "";
  const descValue = form.watch("description") ?? "";

  function onSubmit(values: AdminBroadcastDispatchPayload) {
    dispatch(
      {
        title: values.title.trim(),
        description: values.description.trim(),
        redirect_url: values.redirect_url?.trim() || undefined,
        expires_in_days: values.expires_in_days,
      },
      {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
      },
    );
  }

  function handleOpenChange(next: boolean) {
    if (!next) form.reset();
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            <DialogTitle>Send Platform Announcement</DialogTitle>
          </div>
          <DialogDescription>
            Share an important update or announcement with everyone on the
            platform.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Title</FormLabel>
                    <span className="text-xs text-muted-foreground">
                      {titleValue.length}/100
                    </span>
                  </div>
                  <FormControl>
                    <Input
                      id="admin-broadcast-title"
                      placeholder="e.g. Scheduled Maintenance or Feature Update"
                      maxLength={100}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Description</FormLabel>
                    <span className="text-xs text-muted-foreground">
                      {descValue.length}/300
                    </span>
                  </div>
                  <FormControl>
                    <Textarea
                      id="admin-broadcast-description"
                      placeholder="Share the details of your announcement..."
                      rows={4}
                      maxLength={300}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Redirect URL */}
            <FormField
              control={form.control}
              name="redirect_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Link URL{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="admin-broadcast-redirect-url"
                      placeholder="https://mulearn.org/announcements"
                      maxLength={255}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Link members will open when they click this notification.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Expires in days */}
            <FormField
              control={form.control}
              name="expires_in_days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Active duration (days){" "}
                    <span className="font-normal text-muted-foreground">
                      (optional, default: 7)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="admin-broadcast-expires-in-days"
                      type="number"
                      min={1}
                      max={90}
                      placeholder="7"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === "") {
                          field.onChange(undefined);
                        } else {
                          const parsed = Number(raw);
                          field.onChange(
                            Number.isNaN(parsed) ? undefined : parsed,
                          );
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    How many days this announcement stays visible in members'
                    feeds (1–90).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Audience note */}
            <div className="rounded-md border border-border bg-muted/40 px-3 py-2">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Audience: </span>
                All active members across the platform.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Sending…" : "Send announcement"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
