"use client";

/**
 * RuleAddDialog — Dialog to add an eligibility rule
 *
 * 📍 src/features/company-jobs/components/rules/rule-add-dialog.tsx
 *
 * Lets the user select a rule_type and then a specific value via a text input.
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { RULE_TYPE_OPTIONS } from "../../constants";
import { RuleFormSchema, type RuleFormValues } from "../../schemas";

interface RuleAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: RuleFormValues) => void;
  isPending: boolean;
}

export function RuleAddDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: RuleAddDialogProps) {
  const form = useForm<RuleFormValues>({
    resolver: zodResolver(RuleFormSchema),
    defaultValues: {
      rule_type: "",
      rule_type_id: "",
    },
  });

  function handleSubmit(values: RuleFormValues) {
    onSubmit(values);
    form.reset();
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) form.reset();
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Eligibility Rule</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="rule_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rule Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select rule type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {RULE_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
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
              name="rule_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {form.watch("rule_type") === "skill"
                      ? "Skill ID"
                      : form.watch("rule_type") === "interest_group"
                        ? "Interest Group ID"
                        : form.watch("rule_type") === "achievement"
                          ? "Achievement ID"
                          : "Value ID"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter the UUID of the skill, IG, or achievement"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {isPending ? "Adding…" : "Add Rule"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
