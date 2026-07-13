"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEventsList } from "@/features/events/hooks";
import { useInterestGroupsList } from "@/features/interest-groups/hooks";
import { useTasks } from "@/features/tasks/hooks";
import { useCreateRule } from "../hooks/use-achievement-mutations";
import { useRules } from "../hooks/use-achievement-rules";
import { useAchievements } from "../hooks/use-achievements";
import type { AchievementRule } from "../schemas";

const RuleFormSchema = z.object({
  achievement_id: z.string().uuid("Please select a valid achievement"),
  rule_type: z.string().min(1, "Rule type is required"),
  // Dynamic fields
  karma_amount: z.coerce
    .number()
    .min(0, "Karma must be non-negative")
    .optional(),
  event_id: z.string().optional(),
  task_id: z.string().optional(),
  streak_count: z.coerce
    .number()
    .min(0, "Streak must be non-negative")
    .optional(),
  ig_id: z.string().optional(),
  ig_karma_amount: z.coerce
    .number()
    .min(0, "Karma must be non-negative")
    .optional(),
  custom_conditions: z.string().optional(),
});

type RuleFormValues = z.infer<typeof RuleFormSchema>;

interface RuleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialRule?: AchievementRule | null;
}

export function RuleFormDialog({
  open,
  onOpenChange,
  initialRule,
}: RuleFormDialogProps) {
  const { data: achievements = [], isLoading: isLoadingAchievements } =
    useAchievements();
  const { data: rules = [] } = useRules();
  const createMutation = useCreateRule();
  const isPending = createMutation.isPending;

  // Fetch events, tasks, interest groups for dropdowns
  const { data: eventsData, isLoading: isLoadingEvents } = useEventsList({
    perPage: 100,
  });
  const { data: tasksData, isLoading: isLoadingTasks } = useTasks({
    pageIndex: 1,
    perPage: 100,
  });
  const { data: igsData, isLoading: isLoadingIgs } = useInterestGroupsList();

  const events = eventsData?.data ?? [];
  const tasks = tasksData?.data ?? [];
  const igs = igsData?.response?.interestGroup ?? [];

  const [isCustomType, setIsCustomType] = React.useState(false);
  const [customTypeValue, setCustomTypeValue] = React.useState("");
  const [customPairs, setCustomPairs] = React.useState<
    { id: string; key: string; value: string }[]
  >([]);

  const addPair = () =>
    setCustomPairs((prev) => [
      ...prev,
      { id: crypto.randomUUID(), key: "", value: "" },
    ]);
  const removePair = (id: string) =>
    setCustomPairs((prev) => prev.filter((p) => p.id !== id));
  const updatePair = (id: string, field: "key" | "value", val: string) =>
    setCustomPairs((prev) => {
      const next = [...prev];
      const idx = next.findIndex((p) => p.id === id);
      if (idx !== -1) next[idx] = { ...next[idx], [field]: val };
      return next;
    });

  const knownTypes = React.useMemo(() => {
    const list = [...new Set(rules.map((r) => r.rule_type))].filter(Boolean);
    const defaults = ["karma", "event", "task", "streak", "ig_karma"];
    for (const d of defaults) {
      if (!list.includes(d)) list.push(d);
    }
    return list;
  }, [rules]);

  const form = useForm({
    resolver: zodResolver(RuleFormSchema),
    defaultValues: {
      achievement_id: "",
      rule_type: "",
      karma_amount: undefined as number | undefined,
      event_id: "",
      task_id: "",
      streak_count: undefined as number | undefined,
      ig_id: "",
      ig_karma_amount: undefined as number | undefined,
      custom_conditions: "{}",
    },
  });

  React.useEffect(() => {
    if (!open) {
      form.reset({
        achievement_id: "",
        rule_type: "",
        karma_amount: undefined as number | undefined,
        event_id: "",
        task_id: "",
        streak_count: undefined as number | undefined,
        ig_id: "",
        ig_karma_amount: undefined as number | undefined,
        custom_conditions: "{}",
      });
      setIsCustomType(false);
      setCustomTypeValue("");
      setCustomPairs([]);
    } else if (initialRule) {
      const conditions = initialRule.conditions || {};
      const type = initialRule.rule_type;
      const isKnown = ["karma", "event", "task", "streak", "ig_karma"].includes(
        type,
      );

      let karma_amount: number | undefined;
      let event_id = "";
      let task_id = "";
      let streak_count: number | undefined;
      let ig_id = "";
      let ig_karma_amount: number | undefined;
      let custom_conditions = "{}";

      if (type === "karma") {
        karma_amount = conditions.total_karma as number;
      } else if (type === "event") {
        event_id = conditions.event_id as string;
      } else if (type === "task") {
        task_id = conditions.task_id as string;
      } else if (type === "streak") {
        streak_count = conditions.streak_count as number;
      } else if (type === "ig_karma") {
        ig_id = conditions.ig_id as string;
        ig_karma_amount = conditions.karma as number;
      } else {
        custom_conditions = JSON.stringify(conditions, null, 2);
      }

      form.reset({
        achievement_id: initialRule.achievement_id,
        rule_type: isKnown ? type : "custom",
        karma_amount,
        event_id,
        task_id,
        streak_count,
        ig_id,
        ig_karma_amount,
        custom_conditions,
      });

      if (!isKnown) {
        setIsCustomType(true);
        setCustomTypeValue(type);
        setCustomPairs(
          Object.entries(conditions).map(([k, v]) => ({
            id: crypto.randomUUID(),
            key: k,
            value: typeof v === "object" ? JSON.stringify(v) : String(v),
          })),
        );
      } else {
        setIsCustomType(false);
        setCustomTypeValue("");
        setCustomPairs([]);
      }
    }
  }, [open, initialRule, form]);

  const onSubmit = (values: any) => {
    const actualRuleType = isCustomType
      ? customTypeValue.trim()
      : values.rule_type;
    if (isCustomType && !actualRuleType) {
      form.setError("rule_type", {
        type: "manual",
        message: "Custom rule type is required",
      });
      return;
    }

    let conditions: Record<string, unknown> = {};

    switch (values.rule_type) {
      case "karma":
        if (values.karma_amount === undefined || isNaN(values.karma_amount)) {
          form.setError("karma_amount", { message: "Invalid karma amount" });
          return;
        }
        conditions = { total_karma: Number(values.karma_amount) };
        break;
      case "event":
        if (!values.event_id) {
          form.setError("event_id", { message: "Event ID is required" });
          return;
        }
        conditions = { event_id: values.event_id };
        break;
      case "task":
        if (!values.task_id) {
          form.setError("task_id", { message: "Task ID is required" });
          return;
        }
        conditions = { task_id: values.task_id };
        break;
      case "streak":
        if (values.streak_count === undefined || isNaN(values.streak_count)) {
          form.setError("streak_count", { message: "Invalid streak count" });
          return;
        }
        conditions = { streak_count: Number(values.streak_count) };
        break;
      case "ig_karma":
        if (!values.ig_id) {
          form.setError("ig_id", { message: "IG ID is required" });
          return;
        }
        if (
          values.ig_karma_amount === undefined ||
          isNaN(values.ig_karma_amount)
        ) {
          form.setError("ig_karma_amount", { message: "Invalid karma amount" });
          return;
        }
        conditions = {
          ig_id: values.ig_id,
          karma: Number(values.ig_karma_amount),
        };
        break;
      case "custom":
      default: {
        const obj: Record<string, unknown> = {};
        for (const pair of customPairs) {
          const k = pair.key.trim();
          if (!k) continue;
          const raw = pair.value.trim();
          // Coerce type: bool → bool, numeric → number, else string
          let parsed: unknown = raw;
          if (raw.toLowerCase() === "true") parsed = true;
          else if (raw.toLowerCase() === "false") parsed = false;
          else if (raw !== "" && !Number.isNaN(Number(raw)))
            parsed = Number(raw);
          else {
            try {
              parsed = JSON.parse(raw);
            } catch {
              /* keep as string */
            }
          }
          obj[k] = parsed;
        }
        conditions = obj;
        break;
      }
    }

    createMutation.mutate(
      {
        achievement_id: values.achievement_id,
        rule_type: actualRuleType,
        conditions,
      },
      {
        onSuccess: () => onOpenChange(false),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initialRule ? "Edit Rule" : "Create Rule"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Achievement */}
            <FormField
              control={form.control as any}
              name="achievement_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Achievement</FormLabel>
                  <Select
                    value={(field.value ?? "") as string}
                    onValueChange={field.onChange}
                    disabled={Boolean(initialRule)}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an achievement" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingAchievements ? (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          Loading...
                        </div>
                      ) : (
                        achievements.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Rule Type */}
            <FormField
              control={form.control as any}
              name="rule_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rule Type</FormLabel>
                  <Select
                    value={(field.value ?? "") as string}
                    onValueChange={(val) => {
                      field.onChange(val);
                      if (val === "custom") {
                        setIsCustomType(true);
                      } else {
                        setIsCustomType(false);
                      }
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select rule type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {knownTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Custom...</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Custom Rule Type Input */}
            {isCustomType && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Custom Rule Type Name</Label>
                  <Input
                    placeholder="Enter custom rule type (e.g. hackathon)"
                    value={customTypeValue}
                    onChange={(e) => setCustomTypeValue(e.target.value)}
                  />
                </div>

                {/* Dynamic key-value condition editor */}
                <div className="space-y-2">
                  <Label className="flex items-center justify-between">
                    <span>Conditions</span>
                    <button
                      type="button"
                      onClick={addPair}
                      className="text-xs text-brand-blue hover:text-brand-blue/80 font-medium transition-colors"
                    >
                      + Add field
                    </button>
                  </Label>
                  {customPairs.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic border border-dashed rounded-lg p-3 text-center">
                      No conditions yet. Click "+ Add field" to add one.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {customPairs.map((pair) => (
                        <div key={pair.id} className="flex items-center gap-2">
                          <Input
                            placeholder="key"
                            value={pair.key}
                            onChange={(e) =>
                              updatePair(pair.id, "key", e.target.value)
                            }
                            className="flex-1 font-mono text-xs h-8"
                          />
                          <span className="text-muted-foreground text-xs shrink-0">
                            :
                          </span>
                          <Input
                            placeholder="value"
                            value={pair.value}
                            onChange={(e) =>
                              updatePair(pair.id, "value", e.target.value)
                            }
                            className="flex-1 font-mono text-xs h-8"
                          />
                          <button
                            type="button"
                            onClick={() => removePair(pair.id)}
                            className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dynamic Rule Conditions Inputs */}
            {form.watch("rule_type") === "karma" && (
              <FormField
                control={form.control as any}
                name="karma_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Karma Required</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g. 100"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {form.watch("rule_type") === "event" && (
              <FormField
                control={form.control as any}
                name="event_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event</FormLabel>
                    <Select
                      value={(field.value ?? "") as string}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              isLoadingEvents
                                ? "Loading events..."
                                : "Select event"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {events.map((e: any) => (
                          <SelectItem key={e.id} value={e.id}>
                            {e.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {form.watch("rule_type") === "task" && (
              <FormField
                control={form.control as any}
                name="task_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task</FormLabel>
                    <Select
                      value={(field.value ?? "") as string}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              isLoadingTasks
                                ? "Loading tasks..."
                                : "Select task"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tasks.map((t: any) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {form.watch("rule_type") === "streak" && (
              <FormField
                control={form.control as any}
                name="streak_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Streak Count</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g. 5"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {form.watch("rule_type") === "ig_karma" && (
              <div className="space-y-4">
                <FormField
                  control={form.control as any}
                  name="ig_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interest Group</FormLabel>
                      <Select
                        value={(field.value ?? "") as string}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder={
                                isLoadingIgs
                                  ? "Loading interest groups..."
                                  : "Select interest group"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {igs.map((ig: any) => (
                            <SelectItem key={ig.id} value={ig.id}>
                              {ig.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control as any}
                  name="ig_karma_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Karma Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g. 50"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? "Saving..."
                  : initialRule
                    ? "Edit Rule"
                    : "Create Rule"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
