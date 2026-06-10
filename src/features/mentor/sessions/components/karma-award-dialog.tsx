"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
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
import { useAwardKarma, useParticipants } from "../hooks/use-sessions";
import {
  KarmaAwardFormSchema,
  type KarmaAwardFormValues,
  type Session,
} from "../schemas";

interface KarmaAwardDialogProps {
  session: Session | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KarmaAwardDialog({
  session,
  open,
  onOpenChange,
}: KarmaAwardDialogProps) {
  const { mutate: award, isPending } = useAwardKarma(session?.id ?? "");
  const { data: participants = [] } = useParticipants(session?.id ?? "");

  const mentorParticipants = participants.filter(
    (p) => p.participant_role === "MENTOR",
  );

  const form = useForm<KarmaAwardFormValues>({
    resolver: zodResolver(KarmaAwardFormSchema),
    defaultValues: {
      mentor_id: mentorParticipants[0]?.user_id ?? "",
      karma: 10,
      note: "",
    },
  });

  const firstMentorId = mentorParticipants[0]?.user_id;
  const setValue = form.setValue;
  useEffect(() => {
    if (open && firstMentorId) {
      setValue("mentor_id", firstMentorId);
    }
  }, [open, firstMentorId, setValue]);

  function onSubmit(values: KarmaAwardFormValues) {
    award(values, { onSuccess: () => onOpenChange(false) });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Award Karma</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="mentor_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mentor</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select mentor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mentorParticipants.map((p) => (
                        <SelectItem key={p.user_id} value={p.user_id}>
                          {p.user_full_name ?? p.full_name ?? p.user_id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="karma"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Karma Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? 0 : e.target.valueAsNumber,
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder="Why is this karma being awarded?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Awarding..." : "Award Karma"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
