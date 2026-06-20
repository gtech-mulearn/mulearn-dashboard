"use client";

/**
 * RuleAddDialog — Dialog to add an eligibility rule
 *
 * 📍 src/features/company-jobs/components/rules/rule-add-dialog.tsx
 *
 * The value field adapts to the selected rule type (issue #23):
 * - Min/Max Karma → numeric input
 * - Min/Max Level → dropdown of levels fetched from the backend (stores the
 *   numeric level_order the apply check compares against)
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
import {
  KARMA_RULE_TYPES,
  LEVEL_RULE_TYPES,
  RULE_TYPE_OPTIONS,
} from "../../constants";
import { useEligibilityLevels } from "../../hooks";
import { RuleFormSchema, type RuleFormValues } from "../../schemas";

interface RuleAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: RuleFormValues) => void;
  isPending: boolean;
}

const isKarma = (t: string) =>
  (KARMA_RULE_TYPES as readonly string[]).includes(t);
const isLevel = (t: string) =>
  (LEVEL_RULE_TYPES as readonly string[]).includes(t);

/**
 * The value control for the currently-selected rule type. The level list is
 * fetched only when a level rule type is selected (`enabled`), so we never
 * over-fetch.
 */
function RuleValueField({
  ruleType,
  value,
  onChange,
}: {
  ruleType: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const levels = useEligibilityLevels(isLevel(ruleType));

  // No type chosen yet.
  if (!ruleType) {
    return (
      <Input
        disabled
        placeholder="Select a rule type first"
        value=""
        readOnly
      />
    );
  }

  // Karma → numeric free text.
  if (isKarma(ruleType)) {
    return (
      <Input
        type="number"
        min={0}
        inputMode="numeric"
        placeholder="e.g. 500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  // Level → dropdown of levels; stores level_order.
  if (levels.isLoading) {
    return <Input disabled placeholder="Loading levels…" value="" readOnly />;
  }
  if (levels.isError) {
    return (
      <p className="text-sm text-destructive">
        Couldn&apos;t load levels. Please try again.
      </p>
    );
  }
  const options = levels.data ?? [];
  if (options.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No levels available.</p>
    );
  }
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select a level" />
      </SelectTrigger>
      <SelectContent>
        {options.map((lvl) => (
          <SelectItem key={lvl.id} value={lvl.id}>
            {lvl.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
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
      rule_value: "",
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
                  <Select
                    value={field.value}
                    onValueChange={(next) => {
                      field.onChange(next);
                      // Value input type changes with the rule type — clear any
                      // carried-over value so an incompatible value can't submit.
                      form.setValue("rule_value", "", {
                        shouldValidate: false,
                      });
                    }}
                  >
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
              name="rule_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rule Value</FormLabel>
                  <FormControl>
                    <RuleValueField
                      ruleType={form.watch("rule_type")}
                      value={field.value}
                      onChange={field.onChange}
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
