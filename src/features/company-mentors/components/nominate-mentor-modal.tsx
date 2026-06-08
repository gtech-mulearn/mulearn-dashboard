"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useNominateCompanyMentor } from "@/features/company-jobs/hooks/use-mentor-nominate";

const nominateSchema = z.object({
  muid: z.string().min(1, "MUID is required"),
  reason: z
    .string()
    .min(10, "Please provide a detailed reason (min 10 characters)"),
});

type NominateFormValues = z.infer<typeof nominateSchema>;

interface NominateMentorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NominateMentorModal({
  open,
  onOpenChange,
}: NominateMentorModalProps) {
  const { mutate: nominateMentor, isPending } = useNominateCompanyMentor();

  const form = useForm<NominateFormValues>({
    resolver: zodResolver(nominateSchema),
    defaultValues: {
      muid: "",
      reason: "",
    },
  });

  const onSubmit = (values: NominateFormValues) => {
    nominateMentor(values, {
      onSuccess: () => {
        form.reset();
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nominate Company Mentor</DialogTitle>
          <DialogDescription>
            Nominate a platform user to be a mentor for your company. They must
            already be a member of your company's organization.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="muid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User MUID</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. arjun-menon@mulearn" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Nomination</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Why are they a good fit as a mentor? (e.g. active contributor, strong technical skills)"
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Nominating..." : "Submit Nomination"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
