"use client";

import { Trash2 } from "lucide-react";
import { useFormContext } from "react-hook-form";
import {
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
import {
  MILESTONE_TYPE_OPTIONS,
  STREAK_TYPE_OPTIONS,
} from "../constants/constants";

// ==========================================
// 1. IG Karma Fields
// ==========================================

interface IGKarmaFieldsProps {
  igs: Array<{ id: string; name: string }>;
  isLoadingIgs: boolean;
}

export function IGKarmaFields({ igs, isLoadingIgs }: IGKarmaFieldsProps) {
  const { control } = useFormContext();

  return (
    <div className="space-y-4">
      <FormField
        control={control}
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
        control={control}
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
  );
}

// ==========================================
// 2. Skill Fields
// ==========================================

export function SkillFields() {
  const { control } = useFormContext();

  return (
    <div className="space-y-4">
      <FormField
        control={control}
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
        control={control}
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
              User must have completed ≥ this many tasks tagged with the skill.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

// ==========================================
// 3. Streak Fields
// ==========================================

export function StreakFields() {
  const { control } = useFormContext();

  return (
    <div className="space-y-4">
      <FormField
        control={control}
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
        control={control}
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
              User's current streak must be ≥ this number of consecutive days.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

// ==========================================
// 4. Milestone Fields
// ==========================================

export function MilestoneFields() {
  const { control } = useFormContext();

  return (
    <div className="space-y-4">
      <FormField
        control={control}
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
        control={control}
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
  );
}

// ==========================================
// 5. Event Fields
// ==========================================

export function EventFields() {
  const { control } = useFormContext();

  return (
    <div className="space-y-4">
      <FormField
        control={control}
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
        control={control}
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
              User must have ≥ this many approved karma logs for the event.
              Usually 1.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

// ==========================================
// 6. Task Completion Fields
// ==========================================

export function TaskCompletionFields() {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
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
            User must have at least one approved karma log for a task with this
            hashtag.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// ==========================================
// 7. Custom Fields
// ==========================================

interface CustomFieldsProps {
  customTypeValue: string;
  setCustomTypeValue: (val: string) => void;
  customPairs: Array<{ id: string; key: string; value: string }>;
  addPair: () => void;
  removePair: (id: string) => void;
  updatePair: (id: string, field: "key" | "value", val: string) => void;
}

export function CustomFields({
  customTypeValue,
  setCustomTypeValue,
  customPairs,
  addPair,
  removePair,
  updatePair,
}: CustomFieldsProps) {
  return (
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
                  onChange={(e) => updatePair(pair.id, "key", e.target.value)}
                  className="flex-1 font-mono text-xs h-8"
                />
                <span className="text-muted-foreground text-xs shrink-0">
                  :
                </span>
                <Input
                  placeholder="value"
                  value={pair.value}
                  onChange={(e) => updatePair(pair.id, "value", e.target.value)}
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
  );
}
