"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
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
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { LEVEL_OPTIONS } from "../constants/constants";
import {
  useCreateAchievement,
  useUpdateAchievement,
} from "../hooks/use-achievement-mutations";
import {
  type Achievement,
  AchievementFormSchema,
  type AchievementFormValues,
} from "../schemas";

interface AchievementFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  achievement?: Achievement | null;
}

export function AchievementFormDialog({
  open,
  onOpenChange,
  mode,
  achievement,
}: AchievementFormDialogProps) {
  const createMutation = useCreateAchievement();
  const updateMutation = useUpdateAchievement();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const [iconFile, setIconFile] = React.useState<File | null>(null);
  const [levelError, setLevelError] = React.useState<string | null>(null);

  const form = useForm<AchievementFormValues>({
    resolver: zodResolver(AchievementFormSchema),
    defaultValues: {
      name: "",
      description: "",
      level_based: false,
      level_id: null,
      has_vc: false,
      is_active: true,
    },
  });

  // Reset form when dialog opens/closes or achievement changes
  React.useEffect(() => {
    if (open) {
      if (mode === "edit" && achievement) {
        form.reset({
          name: achievement.name,
          description: achievement.description ?? "",
          level_based: achievement.level_based,
          level_id: achievement.level_id ?? null,
          has_vc: achievement.has_vc,
          is_active: achievement.is_active,
        });
      } else {
        form.reset({
          name: "",
          description: "",
          level_based: false,
          level_id: null,
          has_vc: false,
          is_active: true,
        });
        setIconFile(null);
      }
      setLevelError(null);
    }
  }, [open, mode, achievement, form]);

  const levelBased = form.watch("level_based");

  const onSubmit = (values: AchievementFormValues) => {
    // Manual refinement: level_id required when level_based is true
    if (values.level_based && !values.level_id) {
      setLevelError("Level is required when level-based is enabled");
      return;
    }
    setLevelError(null);

    const formData = new FormData();
    formData.append("name", values.name);
    if (values.description) formData.append("description", values.description);
    formData.append("level_based", String(values.level_based));
    if (values.level_id) formData.append("level_id", values.level_id);
    formData.append("has_vc", String(values.has_vc));
    formData.append("is_active", String(values.is_active ?? true));
    if (iconFile) formData.append("image", iconFile);

    if (mode === "create") {
      createMutation.mutate(formData, {
        onSuccess: () => onOpenChange(false),
      });
    } else if (achievement) {
      updateMutation.mutate(
        { id: achievement.id, formData },
        { onSuccess: () => onOpenChange(false) },
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg"
        data-testid="achievement-form-dialog"
      >
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Achievement" : "Edit Achievement"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
            data-testid="achievement-form"
          >
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Achievement name"
                      {...field}
                      data-testid="achievement-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional description"
                      rows={3}
                      {...field}
                      data-testid="achievement-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Icon Upload */}
            <div className="space-y-2">
              <FormLabel>Icon Image</FormLabel>
              <ImageUpload
                value={iconFile}
                onChange={setIconFile}
                currentUrl={achievement?.image_url}
              />
            </div>

            {/* Level Based */}
            <FormField
              control={form.control}
              name="level_based"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <FormLabel className="text-sm font-medium">
                      Level Based
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Tie this achievement to a specific level
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (!checked) {
                          form.setValue("level_id", null);
                          setLevelError(null);
                        }
                      }}
                      data-testid="achievement-level-based"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Level Select — shown only when level_based is true */}
            {levelBased && (
              <FormField
                control={form.control}
                name="level_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level</FormLabel>
                    <Select
                      value={field.value ?? ""}
                      onValueChange={(val) => {
                        field.onChange(val);
                        setLevelError(null);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="achievement-level-id">
                          <SelectValue placeholder="Select a level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LEVEL_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {levelError && (
                      <p className="text-sm font-medium text-destructive">
                        {levelError}
                      </p>
                    )}
                  </FormItem>
                )}
              />
            )}

            {/* Has VC */}
            <FormField
              control={form.control}
              name="has_vc"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <FormLabel className="text-sm font-medium">
                      Verifiable Credential
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Issue a VC when this achievement is earned
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="achievement-has-vc"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Is Active */}
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <FormLabel className="text-sm font-medium">
                      Active
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Make this achievement visible and earnable
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value ?? true}
                      onCheckedChange={field.onChange}
                      data-testid="achievement-is-active"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                data-testid="achievement-form-submit"
              >
                {isPending
                  ? "Saving..."
                  : mode === "create"
                    ? "Create"
                    : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
