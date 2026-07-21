"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { useUpdateParticipant } from "../hooks/use-mentees";
import {
  UpdateParticipantSchema,
  type UpdateParticipantValues,
} from "../schemas";

interface UpdateParticipantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  linkId: string;
  defaultValues: UpdateParticipantValues;
  participantName: string;
}

export function UpdateParticipantDialog({
  open,
  onOpenChange,
  sessionId,
  linkId,
  defaultValues,
  participantName,
}: UpdateParticipantDialogProps) {
  const { mutate, isPending } = useUpdateParticipant(sessionId);

  const form = useForm<UpdateParticipantValues>({
    resolver: zodResolver(UpdateParticipantSchema),
    defaultValues: {
      attendance_status: defaultValues.attendance_status ?? "INVITED",
      progress_note: defaultValues.progress_note ?? "",
      contributed_minutes: defaultValues.contributed_minutes ?? null,
    },
  });

  function onSubmit(values: UpdateParticipantValues) {
    // Convert empty string back to null for progress_note if needed
    const dataToSubmit = {
      ...values,
      progress_note: values.progress_note?.trim() || null,
      contributed_minutes: values.contributed_minutes || null,
    };

    mutate(
      { linkId, data: dataToSubmit },
      {
        onSuccess: () => {
          toast.success("Participant updated successfully!");
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update {participantName}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="attendance_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Attendance Status</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="INVITED">Invited</SelectItem>
                      <SelectItem value="ATTENDED">Attended</SelectItem>
                      <SelectItem value="ABSENT">Absent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contributed_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contributed Minutes</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g. 60"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseInt(e.target.value, 10) : null,
                        )
                      }
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="progress_note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Progress Note</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter progress note..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      value={field.value ?? ""}
                      disabled={isPending}
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
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Updating..." : "Update"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
