"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useTaskReferences } from "../hooks";
import { TaskFormSchema, type TaskFormValues } from "../schemas/tasks.schema";

interface TaskFormProps {
  initialValues?: Partial<TaskFormValues>;
  onSubmit: (values: TaskFormValues) => void;
  isPending?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
}

export default function TaskForm({
  initialValues,
  onSubmit,
  isPending = false,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  onCancel,
}: TaskFormProps) {
  const { data: refs, isLoading: refsLoading } = useTaskReferences();
  const [showBonus, setShowBonus] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.input<typeof TaskFormSchema>, any, TaskFormValues>({
    resolver: zodResolver(TaskFormSchema),
    defaultValues: {
      hashtag: "#",
      title: "",
      karma: 10,
      usage_count: 1,
      active: true,
      variable_karma: false,
      description: "",
      channel_id: "",
      type_id: "",
      level_id: null,
      ig_id: null,
      organization_id: null,
      discord_link: "",
      event: "",
      bonus_time: null,
      bonus_karma: 0,
      skill_ids: [],
      ...initialValues,
    },
  });

  const hashtagValue = watch("hashtag");
  const bonusKarmaValue = watch("bonus_karma");

  // Ensure hashtag starts with '#'
  useEffect(() => {
    if (hashtagValue && !hashtagValue.startsWith("#")) {
      setValue("hashtag", `#${hashtagValue}`);
    }
  }, [hashtagValue, setValue]);

  // Show bonus fields if bonus_karma is set or bonus_time exists
  useEffect(() => {
    if (initialValues?.bonus_karma || initialValues?.bonus_time) {
      setShowBonus(true);
    }
  }, [initialValues]);

  const skillOptions = (refs?.skills ?? []).map((s: any) => ({
    value: s.id,
    label: s.name || s.title || s.id,
  }));

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hashtag */}
        <div className="space-y-2">
          <Label htmlFor="hashtag">Hashtag *</Label>
          <Input id="hashtag" placeholder="#my-task" {...register("hashtag")} />
          {errors.hashtag && (
            <p className="text-sm text-destructive">{errors.hashtag.message}</p>
          )}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            placeholder="Enter task title"
            {...register("title")}
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        {/* Karma */}
        <div className="space-y-2">
          <Label htmlFor="karma">Karma *</Label>
          <Input
            id="karma"
            type="number"
            placeholder="100"
            {...register("karma")}
          />
          {errors.karma && (
            <p className="text-sm text-destructive">{errors.karma.message}</p>
          )}
        </div>

        {/* Usage Count */}
        <div className="space-y-2">
          <Label htmlFor="usage_count">Usage Count *</Label>
          <Input
            id="usage_count"
            type="number"
            placeholder="1"
            {...register("usage_count")}
          />
          {errors.usage_count && (
            <p className="text-sm text-destructive">
              {errors.usage_count.message}
            </p>
          )}
        </div>

        {/* Channel Select */}
        <div className="space-y-2">
          <Label htmlFor="channel_id">Channel *</Label>
          <Controller
            name="channel_id"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={refsLoading}
              >
                <SelectTrigger id="channel_id">
                  <SelectValue placeholder="Select Channel" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {(refs?.channels ?? []).map((ch: any) => (
                    <SelectItem key={ch.id} value={ch.id}>
                      {ch.name || ch.title || ch.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.channel_id && (
            <p className="text-sm text-destructive">
              {errors.channel_id.message}
            </p>
          )}
        </div>

        {/* Type Select */}
        <div className="space-y-2">
          <Label htmlFor="type_id">Type *</Label>
          <Controller
            name="type_id"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={refsLoading}
              >
                <SelectTrigger id="type_id">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {(refs?.types ?? []).map((t: any) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.title || t.name || t.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.type_id && (
            <p className="text-sm text-destructive">{errors.type_id.message}</p>
          )}
        </div>

        {/* Level Select */}
        <div className="space-y-2">
          <Label htmlFor="level_id">Level</Label>
          <Controller
            name="level_id"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value || "none"}
                onValueChange={(val) =>
                  field.onChange(val === "none" ? null : val)
                }
                disabled={refsLoading}
              >
                <SelectTrigger id="level_id">
                  <SelectValue placeholder="Select Level" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="none">None</SelectItem>
                  {(refs?.levels ?? []).map((l: any) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name || l.title || l.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* IG Select */}
        <div className="space-y-2">
          <Label htmlFor="ig_id">Interest Group (IG)</Label>
          <Controller
            name="ig_id"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value || "none"}
                onValueChange={(val) =>
                  field.onChange(val === "none" ? null : val)
                }
                disabled={refsLoading}
              >
                <SelectTrigger id="ig_id">
                  <SelectValue placeholder="Select Interest Group" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="none">None</SelectItem>
                  {(refs?.igs ?? []).map((ig: any) => (
                    <SelectItem key={ig.id} value={ig.id}>
                      {ig.name || ig.title || ig.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Organization Select */}
        <div className="space-y-2">
          <Label htmlFor="organization_id">Organization</Label>
          <Controller
            name="organization_id"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value || "none"}
                onValueChange={(val) =>
                  field.onChange(val === "none" ? null : val)
                }
                disabled={refsLoading}
              >
                <SelectTrigger id="organization_id">
                  <SelectValue placeholder="Select Organization" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="none">None</SelectItem>
                  {(refs?.organizations ?? []).map((org: any) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.title || org.name || org.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Discord Link */}
        <div className="space-y-2">
          <Label htmlFor="discord_link">Discord Link</Label>
          <Input
            id="discord_link"
            placeholder="https://discord.gg/..."
            {...register("discord_link")}
          />
          {errors.discord_link && (
            <p className="text-sm text-destructive">
              {errors.discord_link.message}
            </p>
          )}
        </div>

        {/* Event */}
        <div className="space-y-2">
          <Label htmlFor="event">Event</Label>
          <Controller
            name="event"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value || "none"}
                onValueChange={(val) =>
                  field.onChange(val === "none" ? null : val)
                }
                disabled={refsLoading}
              >
                <SelectTrigger id="event">
                  <SelectValue placeholder="Select Event" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="none">None</SelectItem>
                  {(refs?.events ?? []).map((event: any) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title || event.name || event.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Skill IDs Multi-Select */}
        <div className="space-y-2">
          <Label>Skills</Label>
          <Controller
            name="skill_ids"
            control={control}
            render={({ field }) => (
              <MultiSelect
                options={skillOptions}
                value={field.value ?? []}
                onChange={field.onChange}
                placeholder={
                  refsLoading ? "Loading skills..." : "Select skills"
                }
              />
            )}
          />
        </div>

        {/* Switches */}
        <div className="flex flex-col gap-4 mt-6">
          <div className="flex items-center space-x-2">
            <Controller
              name="active"
              control={control}
              render={({ field }) => (
                <Switch
                  id="active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="active">Active</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Controller
              name="variable_karma"
              control={control}
              render={({ field }) => (
                <Switch
                  id="variable_karma"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="variable_karma">Variable Karma</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="enable-bonus"
              checked={showBonus}
              onCheckedChange={setShowBonus}
            />
            <Label htmlFor="enable-bonus">Enable Bonus Karma</Label>
          </div>
        </div>
      </div>

      {/* Conditional Bonus Fields */}
      {showBonus && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border border-dashed rounded-lg bg-muted/20">
          <div className="space-y-2">
            <Label htmlFor="bonus_karma">Bonus Karma</Label>
            <Input
              id="bonus_karma"
              type="number"
              placeholder="0"
              {...register("bonus_karma")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bonus_time">Bonus Expiry Date & Time</Label>
            <Input
              id="bonus_time"
              type="datetime-local"
              placeholder="Select date & time"
              {...register("bonus_time")}
            />
          </div>
        </div>
      )}

      {/* Description Markdown Editor */}
      <div className="space-y-2">
        <Label>Description * (max 100 characters)</Label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <MarkdownEditor
              value={field.value || ""}
              onChange={field.onChange}
              placeholder="Write task description here..."
            />
          )}
        />
        {errors.description && (
          <p className="text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-6">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            {cancelLabel}
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Submitting..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
