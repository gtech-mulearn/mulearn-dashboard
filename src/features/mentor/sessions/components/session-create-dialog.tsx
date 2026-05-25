"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getMentorMyIgs } from "@/features/home/api/home.api";
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
  const { data: myIgs = [] } = useQuery({
    queryKey: ["mentor-my-igs"],
    queryFn: getMentorMyIgs,
  });

  const { mutate: create, isPending } = useCreateSession();

  const form = useForm<SessionFormValues>({
    resolver: zodResolver(SessionFormSchema),
    defaultValues: {
      title: "",
      description: "",
      ig_id: "GLOBAL",
      starts_at: "",
      ends_at: "",
      meet_link: "",
    },
  });

  const watchedIgId = form.watch("ig_id");
  const selectedIgId =
    watchedIgId && watchedIgId !== "GLOBAL" ? watchedIgId : "";

  function onSubmit(values: SessionFormValues) {
    const igId =
      values.ig_id && values.ig_id !== "GLOBAL" ? values.ig_id : undefined;
    create(
      {
        ...values,
        ig_id: igId,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Session</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <FormField
              control={form.control}
              name="ig_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interest Group (optional)</FormLabel>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Global session (no IG)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="GLOBAL">
                              Global session
                            </SelectItem>
                            {myIgs.map((ig) => (
                              <SelectItem key={ig.ig_id} value={ig.ig_id}>
                                {ig.ig_name}
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
                  {!selectedIgId && (
                    <p className="text-xs text-muted-foreground mt-1">
                      This will be submitted as a global session pending admin
                      approval.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="starts_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Starts At</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
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
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="meet_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meet Link</FormLabel>
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

            <div className="flex justify-end gap-2 pt-2">
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
