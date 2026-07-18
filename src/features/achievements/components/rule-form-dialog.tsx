"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import * as React from "react";
import { type Resolver, useForm } from "react-hook-form";
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
  FormDescription,
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
import { useInterestGroupsList } from "@/features/interest-groups";
import {
  MILESTONE_TYPE_OPTIONS,
  RULE_TYPES,
  STREAK_TYPE_OPTIONS,
} from "../constants/constants";
import {
  useCreateRule,
  useUpdateRule,
} from "../hooks/use-achievement-mutations";
import { useAchievements } from "../hooks/use-achievements";
import type { AchievementRule } from "../schemas";

// ==========================================
// Form Schema — flat fields for all 6 rule types
// ==========================================

const RuleFormSchema = z.object({
  achievement_id: z.string().uuid("Please select a valid achievement"),
  rule_type: z.string().min(1, "Rule type is required"),

  // ig_karma
  ig_id: z.string().optional(),
  ig_required_karma: z.coerce
    .number()
    .min(0, "Karma must be non-negative")
    .optional(),

  // skill
  skill_id: z.string().optional(),
  skill_required_tasks: z.coerce
    .number()
    .min(1, "Must require at least 1 task")
    .optional(),

  // streak
  streak_type: z.string().optional(),
  streak_required: z.coerce
    .number()
    .min(1, "Must require at least 1 day")
    .optional(),

  // milestone
  milestone_type: z.string().optional(),
  milestone_required_value: z.coerce
    .number()
    .min(0, "Value must be non-negative")
    .optional(),

  // event
  event_name: z.string().optional(),
  event_required_attendance: z.coerce
    .number()
    .min(1, "Must require at least 1 attendance")
    .optional(),

  // task_completion
  task_hashtag: z.string().optional(),

  // custom fallback
  custom_conditions: z.string().optional(),
});

type RuleFormValues = z.infer<typeof RuleFormSchema>;

// ==========================================
// Known rule types
// ==========================================

const KNOWN_RULE_TYPES = RULE_TYPES.map((r) => r.value);

// ==========================================
// Defaults
// ==========================================

const FORM_DEFAULTS: RuleFormValues = {
  achievement_id: "",
  rule_type: "",
  ig_id: "",
  ig_required_karma: undefined,
  skill_id: "",
  skill_required_tasks: undefined,
  streak_type: "",
  streak_required: undefined,
  milestone_type: "",
  milestone_required_value: undefined,
  event_name: "",
  event_required_attendance: 1,
  task_hashtag: "",
  custom_conditions: "{}",
};

// ==========================================
// Props
// ==========================================

interface RuleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialRule?: AchievementRule | null;
}

// ==========================================
// Component
// ==========================================

export function RuleFormDialog({
  open,
  onOpenChange,
  initialRule,
}: RuleFormDialogProps) {
  const { data: achievements = [], isLoading: isLoadingAchievements } =
    useAchievements();
  const createMutation = useCreateRule();
  const updateMutation = useUpdateRule();
  const isPending = createMutation.isPending || updateMutation.isPending;

  // Interest groups for ig_karma rule
  const { data: igsData, isLoading: isLoadingIgs } = useInterestGroupsList();
  const igs = igsData?.response?.interestGroup ?? [];

  // Custom rule type state
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

  const form = useForm<RuleFormValues>({
    resolver: zodResolver(
      RuleFormSchema,
    ) as unknown as Resolver<RuleFormValues>,
    defaultValues: FORM_DEFAULTS,
  });

  const watchedRuleType = form.watch("rule_type");

  // ==========================================
  // Reset / populate on open/close
  // ==========================================

  React.useEffect(() => {
    if (!open) {
      form.reset(FORM_DEFAULTS);
      setIsCustomType(false);
      setCustomTypeValue("");
      setCustomPairs([]);
      return;
    }

    if (!initialRule) return;

    const { conditions, rule_type: type } = initialRule;
    const isKnown = (KNOWN_RULE_TYPES as string[]).includes(type);

    const patch: Partial<RuleFormValues> = {
      achievement_id: initialRule.achievement_id,
      rule_type: isKnown ? type : "custom",
    };

    if (type === "ig_karma") {
      patch.ig_id = (conditions.ig_id as string) ?? "";
      patch.ig_required_karma = conditions.required_karma as number;
    } else if (type === "skill") {
      patch.skill_id = (conditions.skill_id as string) ?? "";
      patch.skill_required_tasks = conditions.required_tasks as number;
    } else if (type === "streak") {
      patch.streak_type = (conditions.streak_type as string) ?? "";
      patch.streak_required = conditions.required_streak as number;
    } else if (type === "milestone") {
      patch.milestone_type = (conditions.milestone_type as string) ?? "";
      patch.milestone_required_value = conditions.required_value as number;
    } else if (type === "event") {
      patch.event_name = (conditions.event_name as string) ?? "";
      patch.event_required_attendance =
        (conditions.required_attendance as number) ?? 1;
    } else if (type === "task_completion") {
      patch.task_hashtag = (conditions.task_hashtag as string) ?? "";
    } else {
      // Custom / unknown type
      patch.custom_conditions = JSON.stringify(conditions, null, 2);
      setIsCustomType(true);
      setCustomTypeValue(type);
      setCustomPairs(
        Object.entries(conditions).map(([k, v]) => ({
          id: crypto.randomUUID(),
          key: k,
          value: typeof v === "object" ? JSON.stringify(v) : String(v),
        })),
      );
    }

    if (isKnown) {
      setIsCustomType(false);
      setCustomTypeValue("");
      setCustomPairs([]);
    }

    form.reset({ ...FORM_DEFAULTS, ...patch });
  }, [open, initialRule, form]);

  // ==========================================
  // Submit
  // ==========================================

  const onSubmit = (values: RuleFormValues) => {
    const actualRuleType = isCustomType
      ? customTypeValue.trim()
      : values.rule_type;

    if (isCustomType && !actualRuleType) {
      form.setError("rule_type", {
        type: "manual",
        message: "Custom rule type name is required",
      });
      return;
    }

    let conditions: Record<string, unknown> = {};

    switch (values.rule_type) {
      case "ig_karma": {
        if (!values.ig_id) {
          form.setError("ig_id", { message: "Interest group is required" });
          return;
        }
        if (
          values.ig_required_karma === undefined ||
          Number.isNaN(values.ig_required_karma)
        ) {
          form.setError("ig_required_karma", {
            message: "Karma threshold is required",
          });
          return;
        }
        conditions = {
          ig_id: values.ig_id,
          required_karma: Number(values.ig_required_karma),
        };
        break;
      }

      case "skill": {
        if (!values.skill_id?.trim()) {
          form.setError("skill_id", { message: "Skill ID is required" });
          return;
        }
        if (
          values.skill_required_tasks === undefined ||
          Number.isNaN(values.skill_required_tasks)
        ) {
          form.setError("skill_required_tasks", {
            message: "Required tasks count is required",
          });
          return;
        }
        conditions = {
          skill_id: values.skill_id.trim(),
          required_tasks: Number(values.skill_required_tasks),
        };
        break;
      }

      case "streak": {
        if (!values.streak_type) {
          form.setError("streak_type", { message: "Streak type is required" });
          return;
        }
        if (
          values.streak_required === undefined ||
          Number.isNaN(values.streak_required)
        ) {
          form.setError("streak_required", {
            message: "Required streak length is required",
          });
          return;
        }
        conditions = {
          streak_type: values.streak_type,
          required_streak: Number(values.streak_required),
        };
        break;
      }

      case "milestone": {
        if (!values.milestone_type) {
          form.setError("milestone_type", {
            message: "Milestone type is required",
          });
          return;
        }
        if (
          values.milestone_required_value === undefined ||
          Number.isNaN(values.milestone_required_value)
        ) {
          form.setError("milestone_required_value", {
            message: "Required value is required",
          });
          return;
        }
        conditions = {
          milestone_type: values.milestone_type,
          required_value: Number(values.milestone_required_value),
        };
        break;
      }

      case "event": {
        if (!values.event_name?.trim()) {
          form.setError("event_name", { message: "Event name is required" });
          return;
        }
        conditions = {
          event_name: values.event_name.trim(),
          required_attendance: Number(values.event_required_attendance ?? 1),
        };
        break;
      }

      case "task_completion": {
        const hashtag = values.task_hashtag?.trim();
        if (!hashtag) {
          form.setError("task_hashtag", {
            message: "Task hashtag is required",
          });
          return;
        }
        conditions = { task_hashtag: hashtag };
        break;
      }

      default: {
        // custom
        const obj: Record<string, unknown> = {};
        for (const pair of customPairs) {
          const k = pair.key.trim();
          if (!k) continue;
          const raw = pair.value.trim();
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

    const payload = {
      achievement_id: values.achievement_id,
      rule_type: actualRuleType,
      conditions,
    };

    if (initialRule) {
      updateMutation.mutate(
        { ruleId: initialRule.id, data: payload },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  // ==========================================
  // Render
  // ==========================================

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialRule ? "Edit Rule" : "Create Rule"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Achievement */}
            <FormField
              control={form.control}
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
              control={form.control}
              name="rule_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rule Type</FormLabel>
                  <Select
                    value={(field.value ?? "") as string}
                    onValueChange={(val) => {
                      field.onChange(val);
                      setIsCustomType(val === "custom");
                      if (val !== "custom") {
                        setCustomTypeValue("");
                        setCustomPairs([]);
                      }
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select rule type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {RULE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Custom…</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── ig_karma ── */}
            {watchedRuleType === "ig_karma" && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
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
                                  ? "Loading interest groups…"
                                  : "Select interest group"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {igs.map((ig) => (
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
                  control={form.control}
                  name="ig_required_karma"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Required Karma</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="e.g. 500"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription>
                        User must have ≥ this much karma in the selected IG.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* ── skill ── */}
            {watchedRuleType === "skill" && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="skill_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skill ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="UUID of the skill"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Paste the UUID of the skill from the skills list.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="skill_required_tasks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Required Tasks</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="e.g. 10"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription>
                        User must have completed ≥ this many tasks tagged with
                        the skill.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* ── streak ── */}
            {watchedRuleType === "streak" && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="streak_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Streak Type</FormLabel>
                      <Select
                        value={(field.value ?? "") as string}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select streak type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STREAK_TYPE_OPTIONS.map((opt) => (
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
                  name="streak_required"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Required Streak (days)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="e.g. 30"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription>
                        User's current streak must be ≥ this number of
                        consecutive days.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* ── milestone ── */}
            {watchedRuleType === "milestone" && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="milestone_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Milestone Type</FormLabel>
                      <Select
                        value={(field.value ?? "") as string}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select milestone type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MILESTONE_TYPE_OPTIONS.map((opt) => (
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
                  name="milestone_required_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Required Value</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="e.g. 1000"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription>
                        User's aggregate value must be ≥ this number.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* ── event ── */}
            {watchedRuleType === "event" && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="event_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g. "MuLearn Summit 2024"'
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Exact name of the event as it appears in karma logs.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="event_required_attendance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Required Attendance</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="e.g. 1"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription>
                        User must have ≥ this many approved karma logs for the
                        event. Usually 1.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* ── task_completion ── */}
            {watchedRuleType === "task_completion" && (
              <FormField
                control={form.control}
                name="task_hashtag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Hashtag</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g. "#onboarding"'
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription>
                      User must have at least one approved karma log for a task
                      with this hashtag.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* ── Custom ── */}
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
                  ? "Saving…"
                  : initialRule
                    ? "Save Changes"
                    : "Create Rule"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
