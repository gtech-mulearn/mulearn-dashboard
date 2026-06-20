"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
      <DialogContent className="flex flex-col gap-0 p-0 sm:max-w-[425px]">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-4">
          <DialogTitle>Nominate Company Mentor</DialogTitle>
          <DialogDescription>
            Nominate a platform user to be a mentor for your company. They must
            already be a member of your company's organization.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col min-h-0"
          >
            <div className="overflow-y-auto px-6 py-4 space-y-4">
              <FormField
                control={form.control}
                name="muid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User MUID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. arjun-menon@mulearn"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Enter the user's unique platform μLearn ID (MUID), not
                      their email address.
                    </p>
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
            </div>

            <div className="shrink-0 flex justify-end gap-3 px-6 py-4 border-t border-border">
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
