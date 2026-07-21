"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  FileText,
  ImagePlus,
  Link2,
  Loader2,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { Fragment, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  type Project,
  ProjectFormSchema,
  type ProjectFormValues,
  ProjectLinkFormSchema,
  type ProjectMember,
  type ProjectStatus,
} from "../schemas";
import { MemberList } from "./member-list";
import { ProjectLinksEditor } from "./project-links-editor";
import { ProjectMemberPicker } from "./project-member-picker";
import { ProjectSkillPicker } from "./project-skill-picker";

// ─── Constants ──────────────────────────────────────────────────────────────

const STEPS = ["Details", "Media & Links", "Team", "Review"] as const;
const STEP_ICONS = [FileText, Link2, Users, Check] as const;

// ─── Types ──────────────────────────────────────────────────────────────────

interface ProjectWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project;
  ownerMuid: string;
  members?: ProjectMember[];
  onSubmit: (
    values: ProjectFormValues,
    files: { logo?: File; images?: File[] },
  ) => Promise<Project | undefined>;
  onAddLinkedMember?: (muid: string) => Promise<void>;
  onAddExternalMember?: (name: string) => Promise<void>;
  onRemoveMember?: (memberId: string) => Promise<void>;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ProjectWizard({
  open,
  onOpenChange,
  project,
  ownerMuid,
  members = [],
  onSubmit,
  onAddLinkedMember,
  onAddExternalMember,
  onRemoveMember,
}: ProjectWizardProps) {
  const isEditing = !!project;

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(ProjectFormSchema),
    defaultValues: {
      title: project?.title ?? "",
      description: project?.description ?? "",
      links: project?.links.map((l) => ({ label: l.label, url: l.url })) ?? [],
      skill_ids: project?.skills.map((s) => s.id) ?? [],
    },
  });

  // status is kept in React state (not RHF) so it survives step navigation
  // when the Controller would otherwise unmount and lose its value.
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus>(
    (project?.status ?? "published") as ProjectStatus,
  );

  const [currentStep, setCurrentStep] = useState(1);
  const [logo, setLogo] = useState<File>();
  const [images, setImages] = useState<File[]>([]);
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [_createdProject, setCreatedProject] = useState<Project | null>(null);

  const totalSteps = STEPS.length;

  const linkedMemberMuids = members
    .filter((m) => m.is_linked && m.muid)
    .map((m) => m.muid as string);

  // ─── Per-step validation (bypasses zodResolver's full-schema parse) ─

  /**
   * Validates ONLY the fields belonging to a specific step.
   * Returns { ok, errors[] }.
   *
   * We do NOT use form.trigger(fieldNames) here because zodResolver
   * runs the full Zod schema on every trigger() call. If an unrelated
   * field (e.g. a link on step 2) is invalid, trigger(["title"]) can
   * still return false — which is the root cause of the "Next button
   * stuck" bug.
   */
  const validateStepFields = (
    step: number,
  ): { ok: boolean; errors: string[] } => {
    const values = form.getValues();
    const errors: string[] = [];

    if (step === 1) {
      if (!values.title || values.title.trim().length === 0) {
        errors.push("Title is required");
      } else if (values.title.length > 50) {
        errors.push("Title must be 50 characters or less");
      }
      if (!values.description || values.description.trim().length === 0) {
        errors.push("Description is required");
      } else if (values.description.trim().length < 50) {
        errors.push("Description must be at least 50 characters");
      }
      // status always has a valid default ("published") via the Select —
      // no manual check needed; the Zod enum catches invalid values.
    }

    if (step === 2) {
      // Strip completely empty link rows before validating
      const links = values.links.filter(
        (l) => l.label.trim() !== "" || l.url.trim() !== "",
      );
      // Write the cleaned list back so submit doesn't send empty rows
      if (links.length !== values.links.length) {
        form.setValue("links", links, { shouldDirty: true });
      }
      if (links.length < 2) {
        errors.push("At least 2 links are required");
      }
      // Validate remaining links
      for (let i = 0; i < links.length; i++) {
        const parsed = ProjectLinkFormSchema.safeParse(links[i]);
        if (!parsed.success) {
          const issues = parsed.error.issues.map((iss) => iss.message);
          errors.push(`Link ${i + 1}: ${issues.join(", ")}`);
        }
      }
    }

    return { ok: errors.length === 0, errors };
  };

  // ─── Navigation ─────────────────────────────────────────────────────

  const goNext = async () => {
    const { ok, errors } = validateStepFields(currentStep);
    if (!ok) {
      // Set react-hook-form errors so inline messages appear
      if (currentStep === 1) {
        void form.trigger(["title", "description"]);
      }
      toast.error(errors.join("; "));
      return;
    }
    // Clear any stale form errors for this step's fields
    if (currentStep === 1) {
      form.clearErrors(["title", "description"]);
    }
    if (currentStep === 2) {
      form.clearErrors("links");
    }
    setCurrentStep((s) => Math.min(totalSteps, s + 1));
  };

  const goBack = () => {
    setCurrentStep((s) => Math.max(1, s - 1));
  };

  // ─── Submit ─────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    // Validate every step and find the first one with errors
    for (let step = 1; step <= totalSteps; step++) {
      const { ok, errors } = validateStepFields(step);
      if (!ok) {
        setCurrentStep(step);
        // Also trigger react-hook-form so inline error messages appear
        if (step === 1) void form.trigger(["title", "description"]);
        if (step === 2) void form.trigger("links");
        toast.error(`Step ${step} (${STEPS[step - 1]}): ${errors.join("; ")}`);
        return;
      }
    }

    try {
      const values = { ...form.getValues(), status: selectedStatus };
      const result = await onSubmit(values, { logo, images });
      if (result && typeof result === "object" && "id" in result) {
        setCreatedProject(result as Project);
      }
      setShowSuccess(true);
    } catch {
      // Handled by the mutation hook's onError toast.
    }
  };

  // ─── Reset & close ──────────────────────────────────────────────────

  const resetWizard = () => {
    setCurrentStep(1);
    setLogo(undefined);
    setImages([]);
    setShowSuccess(false);
    setCreatedProject(null);
    setSelectedStatus("published");
    form.reset();
  };

  const requestClose = () => {
    if (showSuccess) {
      resetWizard();
      onOpenChange(false);
      return;
    }
    if (form.formState.isDirty) {
      setConfirmCloseOpen(true);
      return;
    }
    resetWizard();
    onOpenChange(false);
  };

  // ─── Watched values for review ──────────────────────────────────────

  const watchedValues = form.watch();

  // ─── Render ─────────────────────────────────────────────────────────

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => (!next ? requestClose() : null)}
      >
        <DialogContent className="flex h-[100dvh] w-screen max-w-none flex-col overflow-hidden rounded-none border-0 sm:h-[92dvh] sm:w-[94vw] sm:max-w-[900px] sm:rounded-2xl sm:border">
          <DialogHeader className="pb-2">
            <DialogTitle>
              {showSuccess
                ? "Project Saved!"
                : isEditing
                  ? "Edit Project"
                  : "New Project"}
            </DialogTitle>
          </DialogHeader>

          {/* ── Stepper (hidden on success) ──────────────────────────── */}
          {!showSuccess && (
            <>
              {/* Desktop stepper */}
              <div className="mx-auto hidden w-full max-w-3xl items-center gap-4 px-4 pb-2 sm:flex">
                {STEPS.map((label, index) => {
                  const stepIndex = index + 1;
                  const isActive = stepIndex === currentStep;
                  const isCompleted = stepIndex < currentStep;
                  const Icon = STEP_ICONS[index];

                  return (
                    <Fragment key={label}>
                      <button
                        type="button"
                        aria-label={`Go to step ${stepIndex}: ${label}`}
                        aria-current={isActive ? "step" : undefined}
                        onClick={() => setCurrentStep(stepIndex)}
                        className="group flex cursor-pointer items-center gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <Button
                          type="button"
                          size="icon-sm"
                          variant={
                            isActive || isCompleted ? "default" : "secondary"
                          }
                          className={cn(
                            "pointer-events-none",
                            isActive
                              ? "ring-2 ring-brand-blue ring-offset-2"
                              : undefined,
                          )}
                        >
                          {isCompleted ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Icon className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <div className="min-w-0 pt-1">
                          <p
                            className={cn(
                              "text-xs whitespace-nowrap leading-none transition-colors",
                              isActive
                                ? "font-medium text-primary"
                                : "text-muted-foreground group-hover:text-foreground",
                            )}
                          >
                            {label}
                          </p>
                        </div>
                      </button>
                      {index < STEPS.length - 1 ? (
                        <div
                          className={`h-0.5 flex-1 self-center ${
                            isCompleted ? "bg-primary" : "bg-border"
                          }`}
                        />
                      ) : null}
                    </Fragment>
                  );
                })}
              </div>

              {/* Mobile progress bar */}
              <div className="mx-auto w-full max-w-3xl px-1 pb-2 sm:hidden">
                <p className="text-sm font-medium text-foreground">
                  Step {currentStep} of {totalSteps} — {STEPS[currentStep - 1]}
                </p>
                <div className="mt-2 h-1 w-full rounded-full bg-border">
                  <div
                    className="h-1 rounded-full bg-primary transition-all"
                    style={{
                      width: `${(currentStep / totalSteps) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {/* ── Content area ─────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto w-full max-w-3xl">
              {showSuccess ? (
                /* ─── Success Screen ───────────────────────────────── */
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <Sparkles className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">
                    {isEditing
                      ? "Project Updated Successfully!"
                      : "Project Created Successfully!"}
                  </h2>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Your project{" "}
                    <span className="font-medium text-foreground">
                      &ldquo;{watchedValues.title}&rdquo;
                    </span>{" "}
                    has been {isEditing ? "updated" : "created"}.
                  </p>

                  {!isEditing && (
                    <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4 mb-6 max-w-md">
                      <div className="flex items-start gap-3">
                        <Users className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                            Don&apos;t forget to add your team!
                          </p>
                          <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                            Edit your project to add team members — search
                            µLearn users by name or MUID, or add external
                            contributors.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => {
                      resetWizard();
                      onOpenChange(false);
                    }}
                  >
                    Done
                  </Button>
                </div>
              ) : currentStep === 1 ? (
                /* ─── Step 1: Details ──────────────────────────────── */
                <section className="space-y-6">
                  <div>
                    <h2 className="text-base font-semibold">Project Details</h2>
                    <p className="text-[13px] text-muted-foreground mt-0.5">
                      Give your project a name and describe what it does.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[13px] font-medium">
                      Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      className="rounded-xl border-border bg-background"
                      placeholder="e.g. My Awesome Project"
                      {...form.register("title")}
                    />
                    {form.formState.errors.title?.message && (
                      <p className="text-[12px] text-destructive">
                        {form.formState.errors.title.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[13px] font-medium">
                      Description <span className="text-destructive">*</span>
                    </Label>
                    <Controller
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <>
                          <MarkdownEditor
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Describe your project using Markdown…"
                            rows={10}
                            error={form.formState.errors.description?.message}
                          />
                          <p
                            className={`text-[12px] ${
                              field.value.trim().length < 50
                                ? "text-muted-foreground"
                                : "text-success"
                            }`}
                          >
                            {field.value.trim().length}/50 characters minimum
                          </p>
                        </>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[13px] font-medium">
                      Visibility
                    </Label>
                    <Select
                      value={selectedStatus}
                      onValueChange={(val) =>
                        setSelectedStatus(val as ProjectStatus)
                      }
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">
                          Draft — only you can see
                        </SelectItem>
                        <SelectItem value="published">
                          Published — visible on profile
                        </SelectItem>
                        <SelectItem value="archived">
                          Archived — hidden, kept for reference
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </section>
              ) : currentStep === 2 ? (
                /* ─── Step 2: Media & Links ────────────────────────── */
                <section className="space-y-6">
                  <div>
                    <h2 className="text-base font-semibold">Media & Links</h2>
                    <p className="text-[13px] text-muted-foreground mt-0.5">
                      Add a logo, screenshots, project links, and relevant
                      skills.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[13px] font-medium">Logo</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      className="rounded-xl"
                      onChange={(e) => setLogo(e.target.files?.[0])}
                    />
                    <p className="text-[12px] text-muted-foreground">
                      {logo
                        ? `Selected: ${logo.name}`
                        : "Square image recommended (PNG, JPG)"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[13px] font-medium">
                      Screenshots
                    </Label>

                    {/* Existing screenshots when editing */}
                    {project?.images &&
                      project.images.length > 0 &&
                      images.length === 0 && (
                        <div className="grid grid-cols-3 gap-2">
                          {project.images.map((img) => (
                            <div
                              key={img.image}
                              className="relative aspect-video rounded-lg overflow-hidden border bg-muted"
                            >
                              {/* biome-ignore lint/performance/noImgElement: remote screenshot URL, not eligible for next/image domains config */}
                              <img
                                src={`${process.env.NEXT_PUBLIC_DJANGO_API_URL ?? ""}${img.image.startsWith("http") ? img.image.replace(/^https?:\/\/[^/]+/, "") : img.image}`}
                                alt="Screenshot"
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                    {/* New image previews */}
                    {images.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {images.map((file) => (
                          <div
                            key={`${file.name}-${file.lastModified}`}
                            className="relative aspect-video rounded-lg overflow-hidden border bg-muted group"
                          >
                            {/* biome-ignore lint/performance/noImgElement: local blob preview URL, not eligible for next/image */}
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="h-full w-full object-cover"
                            />
                            <Button
                              type="button"
                              size="icon-sm"
                              variant="destructive"
                              onClick={() =>
                                setImages((prev) =>
                                  prev.filter((f) => f !== file),
                                )
                              }
                              className="absolute top-1 right-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload trigger */}
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-3 text-[13px] text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary">
                      <ImagePlus className="h-4 w-4 shrink-0" />
                      <span>
                        {images.length > 0
                          ? `${images.length} selected — click to replace`
                          : project?.images?.length
                            ? `${project.images.length} existing — upload new to replace all`
                            : "Add screenshots (PNG, JPG · multiple allowed)"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="sr-only"
                        onChange={(e) =>
                          setImages(Array.from(e.target.files ?? []))
                        }
                      />
                    </label>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[13px] font-medium">
                      Links <span className="text-destructive">*</span>
                    </Label>
                    <Controller
                      control={form.control}
                      name="links"
                      render={({ field }) => (
                        <>
                          <ProjectLinksEditor
                            value={field.value}
                            onChange={field.onChange}
                          />
                          <p
                            className={`text-[12px] ${
                              field.value.length < 2
                                ? "text-muted-foreground"
                                : "text-success"
                            }`}
                          >
                            {field.value.length}/2 links minimum
                          </p>
                        </>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[13px] font-medium">Skills</Label>
                    <Controller
                      control={form.control}
                      name="skill_ids"
                      render={({ field }) => (
                        <ProjectSkillPicker
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                </section>
              ) : currentStep === 3 ? (
                /* ─── Step 3: Team ─────────────────────────────────── */
                <section className="space-y-6">
                  <div>
                    <h2 className="text-base font-semibold">Team Members</h2>
                    <p className="text-[13px] text-muted-foreground mt-0.5">
                      Manage the people collaborating on this project.
                    </p>
                  </div>
                  {isEditing && (onAddLinkedMember || onAddExternalMember) ? (
                    <>
                      <div className="space-y-2">
                        <Label className="text-[13px] font-medium block">
                          Current Members
                        </Label>
                        <MemberList
                          members={members}
                          onRemove={
                            onRemoveMember
                              ? (id) => {
                                  void onRemoveMember(id);
                                }
                              : undefined
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[13px] font-medium block">
                          Add Members
                        </Label>
                        <ProjectMemberPicker
                          excludeMuids={[ownerMuid, ...linkedMemberMuids]}
                          onPickLinked={
                            onAddLinkedMember
                              ? (muid) => {
                                  void onAddLinkedMember(muid);
                                }
                              : () => {}
                          }
                          onPickExternal={
                            onAddExternalMember
                              ? (name) => {
                                  void onAddExternalMember(name);
                                }
                              : () => {}
                          }
                        />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                        <Users className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-base font-medium mb-1">
                        Team members can be added after saving
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        Save your project first, then edit it to search and add
                        µLearn users or external contributors as team members.
                      </p>
                    </div>
                  )}
                </section>
              ) : currentStep === 4 ? (
                /* ─── Step 4: Review ───────────────────────────────── */
                <section className="space-y-6">
                  <div>
                    <h2 className="text-base font-semibold">Review & Submit</h2>
                    <p className="text-[13px] text-muted-foreground mt-0.5">
                      Double-check your project details before saving.
                    </p>
                  </div>
                  <div className="rounded-xl border divide-y">
                    {(() => {
                      const STATUS_LABELS: Record<string, string> = {
                        draft: "Draft — only you can see",
                        published: "Published — visible on profile",
                        archived: "Archived — hidden, kept for reference",
                      };
                      const rows: [string, string, boolean][] = [
                        ["Title", watchedValues.title || "Not set", true],
                        [
                          "Status",
                          STATUS_LABELS[selectedStatus] ?? "Not set",
                          true,
                        ],
                        [
                          "Links",
                          watchedValues.links.length > 0
                            ? `${watchedValues.links.length} link(s)`
                            : "None",
                          false,
                        ],
                        [
                          "Skills",
                          watchedValues.skill_ids.length > 0
                            ? `${watchedValues.skill_ids.length} skill(s)`
                            : "None",
                          false,
                        ],
                        [
                          "Logo",
                          logo
                            ? logo.name
                            : project?.logo
                              ? "Existing"
                              : "None",
                          false,
                        ],
                        [
                          "Images",
                          images.length > 0
                            ? `${images.length} new`
                            : project?.images?.length
                              ? `${project.images.length} existing`
                              : "None",
                          false,
                        ],
                        [
                          "Team",
                          members.length > 0
                            ? `${members.length} member(s)`
                            : "None yet",
                          false,
                        ],
                      ];
                      return rows.map(([label, value, required]) => (
                        <div
                          key={label}
                          className="flex items-start justify-between gap-4 px-4 py-3"
                        >
                          <p className="w-20 shrink-0 text-xs font-medium text-muted-foreground">
                            {label}
                          </p>
                          <p
                            className={`text-right text-sm ${
                              value === "Not set"
                                ? required
                                  ? "text-destructive"
                                  : "text-muted-foreground"
                                : "text-foreground"
                            }`}
                          >
                            {value}
                          </p>
                        </div>
                      ));
                    })()}
                  </div>

                  {watchedValues.description && (
                    <div className="space-y-2">
                      <Label className="text-[13px] font-medium block">
                        Description Preview
                      </Label>
                      <div className="rounded-xl border p-4 max-h-60 overflow-y-auto">
                        <MarkdownRenderer
                          content={watchedValues.description}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  )}
                </section>
              ) : null}
            </div>
          </div>

          {/* ── Footer ───────────────────────────────────────────────── */}
          {!showSuccess && (
            <div className="flex items-center justify-between border-t border-border bg-card/80 p-4 backdrop-blur-sm">
              <div className="mx-auto flex w-full max-w-3xl items-center justify-between">
                <Button variant="ghost" onClick={requestClose}>
                  Cancel
                </Button>

                <div className="flex items-center gap-2">
                  {currentStep > 1 && (
                    <Button variant="outline" onClick={goBack}>
                      Back
                    </Button>
                  )}

                  {currentStep < totalSteps ? (
                    <Button onClick={goNext}>Next</Button>
                  ) : (
                    <Button
                      disabled={form.formState.isSubmitting}
                      onClick={handleSubmit}
                    >
                      {form.formState.isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {isEditing ? "Save Changes" : "Create Project"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmCloseOpen}
        onOpenChange={setConfirmCloseOpen}
        title={`Discard ${isEditing ? "changes" : "new project"}?`}
        description="All entered information will be lost."
        confirmLabel="Discard"
        onConfirm={() => {
          setConfirmCloseOpen(false);
          resetWizard();
          onOpenChange(false);
        }}
      />
    </>
  );
}
