"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, Link, Upload, X } from "lucide-react";
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
import { useTaskLevels } from "@/features/mentor/tasks/hooks/use-mentor-tasks";
import {
  useCreateAchievement,
  useUpdateAchievement,
} from "../hooks/use-achievement-mutations";
import {
  type Achievement,
  AchievementFormSchema,
  type AchievementFormValues,
} from "../schemas";

// Allowed MIME types / extensions per the API spec
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

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
  const { data: levels = [], isLoading: isLoadingLevels } = useTaskLevels();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const [levelError, setLevelError] = React.useState<string | null>(null);

  // Icon mode: "url" (text input) | "file" (file upload)
  const [iconMode, setIconMode] = React.useState<"url" | "file">("url");
  const [iconFile, setIconFile] = React.useState<File | null>(null);
  const [iconFilePreview, setIconFilePreview] = React.useState<string | null>(
    null,
  );
  const [iconFileError, setIconFileError] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<AchievementFormValues>({
    resolver: zodResolver(AchievementFormSchema),
    defaultValues: {
      name: "",
      description: "",
      level_based: false,
      level_id: null,
      has_vc: false,
      is_active: true,
      tags: "",
      type: "",
      icon_url: "",
      template_id: "",
    },
  });

  // Clean up object URL on unmount / file change
  React.useEffect(() => {
    return () => {
      if (iconFilePreview) URL.revokeObjectURL(iconFilePreview);
    };
  }, [iconFilePreview]);

  // Reset form when dialog opens/closes or achievement changes
  React.useEffect(() => {
    if (open) {
      if (mode === "edit" && achievement) {
        form.reset({
          name: achievement.name,
          description: achievement.description ?? "",
          level_based: achievement.level_based ?? !!achievement.level_id,
          level_id: achievement.level_id ?? null,
          has_vc: achievement.has_vc ?? false,
          is_active: achievement.is_active ?? true,
          tags: Array.isArray(achievement.tags)
            ? achievement.tags.join(", ")
            : (achievement.tags ?? ""),
          type: achievement.type ?? "",
          // Prefer icon_url (full URL) over icon (relative path) for the preview
          icon_url: achievement.icon_url ?? achievement.icon ?? "",
          template_id: achievement.template_id ?? "",
        });
      } else {
        form.reset({
          name: "",
          description: "",
          level_based: false,
          level_id: null,
          has_vc: false,
          is_active: true,
          tags: "",
          type: "",
          icon_url: "",
          template_id: "",
        });
      }
      setLevelError(null);
      // Reset file state when dialog opens
      setIconFile(null);
      setIconFilePreview(null);
      setIconFileError(null);
      setIconMode("url");
    }
  }, [open, mode, achievement, form]);

  const levelBased = form.watch("level_based");

  // ── File handling ────────────────────────────────────────────────────────────

  const handleFileSelect = (file: File) => {
    setIconFileError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setIconFileError("Allowed types: jpg, jpeg, png, gif, webp, svg");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setIconFileError(`File exceeds ${MAX_SIZE_MB} MB limit`);
      return;
    }

    setIconFile(file);
    if (iconFilePreview) URL.revokeObjectURL(iconFilePreview);
    setIconFilePreview(URL.createObjectURL(file));
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const clearFile = () => {
    setIconFile(null);
    if (iconFilePreview) URL.revokeObjectURL(iconFilePreview);
    setIconFilePreview(null);
    setIconFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Submit ───────────────────────────────────────────────────────────────────

  const onSubmit = (values: AchievementFormValues) => {
    // Manual refinement: level_id required when level_based is true
    if (values.level_based && !values.level_id) {
      setLevelError("Level is required when level-based is enabled");
      return;
    }
    setLevelError(null);

    // Validate file mode
    if (iconMode === "file" && !iconFile) {
      setIconFileError("Please select an image file or switch to URL mode");
      return;
    }

    const tagArray = values.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    // ── File upload path: build FormData (multipart/form-data) ──
    if (iconMode === "file" && iconFile) {
      const fd = new FormData();
      fd.append("name", values.name);
      fd.append("tags", JSON.stringify(tagArray));
      fd.append("type", values.type);
      fd.append("has_vc", String(values.has_vc));
      fd.append("is_active", String(values.is_active ?? true));
      fd.append("icon", iconFile);
      if (values.description) fd.append("description", values.description);
      if (values.template_id) fd.append("template_id", values.template_id);
      if (values.level_based && values.level_id)
        fd.append("level_id", values.level_id);

      if (mode === "create") {
        createMutation.mutate(fd, { onSuccess: () => onOpenChange(false) });
      } else if (achievement) {
        updateMutation.mutate(
          { id: achievement.id, data: fd },
          { onSuccess: () => onOpenChange(false) },
        );
      }
      return;
    }

    // ── URL path: build plain JSON payload ──
    // Sending explicit `null` for optional CharField/URLField causes Django to
    // return 400 "Invalid Data" or 500 in some serialiser configurations,
    // so we only include optional fields when they have a real value.
    const payload: Record<string, unknown> = {
      name: values.name,
      tags: tagArray,
      type: values.type,
      has_vc: values.has_vc,
      is_active: values.is_active ?? true,
    };

    if (values.description) payload.description = values.description;
    if (values.icon_url) payload.icon = values.icon_url;
    if (values.template_id) payload.template_id = values.template_id;

    // level_id: send the value when level_based is on, omit (don't send null) when off
    if (values.level_based && values.level_id) {
      payload.level_id = values.level_id;
    }

    if (mode === "create") {
      createMutation.mutate(payload, {
        onSuccess: () => onOpenChange(false),
      });
    } else if (achievement) {
      updateMutation.mutate(
        { id: achievement.id, data: payload },
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
            <div className="space-y-5 overflow-y-auto max-h-[60vh] pr-2">
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

              {/* Tags */}
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Hackathon, Coding"
                        {...field}
                        data-testid="achievement-tags"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Badge, Medal"
                        {...field}
                        data-testid="achievement-type"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ── Icon section ──────────────────────────────────────────────── */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-1.5">
                    <ImageIcon className="size-3.5" />
                    Icon
                  </span>
                  {/* Mode toggle */}
                  <div className="flex items-center rounded-md border text-xs overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setIconMode("url")}
                      className={`flex items-center gap-1 px-2.5 py-1 transition-colors ${
                        iconMode === "url"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <Link className="size-3" />
                      URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setIconMode("file")}
                      className={`flex items-center gap-1 px-2.5 py-1 transition-colors ${
                        iconMode === "file"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <Upload className="size-3" />
                      Upload
                    </button>
                  </div>
                </div>

                {/* URL mode */}
                {iconMode === "url" && (
                  <FormField
                    control={form.control}
                    name="icon_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/icon.png"
                            {...field}
                            data-testid="achievement-icon-url"
                          />
                        </FormControl>
                        {field.value && (
                          <div className="mt-1 flex items-center gap-2">
                            {/* biome-ignore lint/performance/noImgElement: preview image URL directly */}
                            <img
                              src={field.value}
                              alt="Icon preview"
                              className="size-10 rounded-md object-contain border border-border bg-muted/40"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                            <span className="text-xs text-muted-foreground">
                              Preview
                            </span>
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* File upload mode */}
                {iconMode === "file" && (
                  <div className="space-y-2">
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={handleFileInputChange}
                      data-testid="achievement-icon-file"
                    />

                    {iconFile ? (
                      /* Selected file preview */
                      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
                        {iconFilePreview && (
                          /* biome-ignore lint/performance/noImgElement: local object URL preview */
                          <img
                            src={iconFilePreview}
                            alt="Icon preview"
                            className="size-12 rounded-md object-contain border border-border bg-muted/40 shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {iconFile.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(iconFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive shrink-0"
                          onClick={clearFile}
                          aria-label="Remove file"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ) : (
                      /* Drop zone */
                      <button
                        type="button"
                        className={`flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                          isDragging
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50 hover:bg-muted/30"
                        }`}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                      >
                        <Upload className="size-6 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            JPG, PNG, GIF, WebP, SVG — max {MAX_SIZE_MB} MB
                          </p>
                        </div>
                      </button>
                    )}

                    {iconFileError && (
                      <p className="text-sm font-medium text-destructive">
                        {iconFileError}
                      </p>
                    )}
                  </div>
                )}
              </div>
              {/* ── End icon section ──────────────────────────────────────────── */}

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
                          <SelectTrigger
                            className="w-full"
                            data-testid="achievement-level-id"
                          >
                            <SelectValue placeholder="Select a level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingLevels ? (
                            <div className="p-2 text-sm text-muted-foreground text-center">
                              Loading...
                            </div>
                          ) : (
                            levels.map((lvl) => (
                              <SelectItem key={lvl.id} value={lvl.id}>
                                {lvl.name}
                              </SelectItem>
                            ))
                          )}
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
            </div>

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
