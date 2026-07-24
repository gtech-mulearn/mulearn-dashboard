"use client";

import { Check, ImagePlus, Loader2, X } from "lucide-react";
import { Fragment, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useImpactProjectMutations } from "../../hooks/use-impact-project-mutations";
import type { ImpactProject, ImpactProjectLink } from "../../schemas";
import { ImpactProjectLinksEditor } from "./impact-project-links-editor";
import {
  type TeamMemberEntry,
  ImpactProjectTeamPicker,
} from "./impact-project-team-picker";

const STEPS = ["Basic Info", "Team", "Links & Image", "Review"] as const;

const MAX_IMAGE_MB = 5;
const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

interface ImpactProjectFormDialogProps {
  igId: string;
  isOpen: boolean;
  onClose: () => void;
  project?: ImpactProject | null;
}

export function ImpactProjectFormDialog({
  igId,
  isOpen,
  onClose,
  project,
}: ImpactProjectFormDialogProps) {
  const {
    createImpactProject,
    updateImpactProject,
    uploadImpactProjectImage,
    isCreating,
    isUpdating,
    isUploadingImage,
  } = useImpactProjectMutations(igId);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [team, setTeam] = useState<TeamMemberEntry[]>([]);
  const [links, setLinks] = useState<ImpactProjectLink[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setCurrentStep(1);
    setIsDirty(false);
    setImageFile(null);
    setImageError(null);
    if (project) {
      setTitle(project.title);
      setDescription(project.description);
      setTeam(project.team);
      setLinks(project.links);
      setImagePreview(project.image ?? null);
    } else {
      setTitle("");
      setDescription("");
      setTeam([]);
      setLinks([]);
      setImagePreview(null);
    }
  }, [isOpen, project]);

  useEffect(() => {
    if (!imageFile) return;
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const isSubmitting = isCreating || isUpdating || isUploadingImage;
  const TOTAL = STEPS.length;

  const markDirty =
    <T,>(setter: (v: T) => void) =>
    (v: T) => {
      setIsDirty(true);
      setter(v);
    };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError("Expected an image file (png, jpg, webp).");
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setImageError(`Image must be under ${MAX_IMAGE_MB} MB.`);
      return;
    }
    setImageError(null);
    setIsDirty(true);
    setImageFile(file);
  };

  const requestClose = () => {
    if (isDirty) {
      setConfirmCloseOpen(true);
      return;
    }
    onClose();
  };

  const MIN_DESCRIPTION_LENGTH = 50;

  const validateStep = (): boolean => {
    if (currentStep === 1) {
      return (
        title.trim().length > 0 &&
        description.trim().length >= MIN_DESCRIPTION_LENGTH
      );
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setCurrentStep((s) => Math.min(TOTAL, s + 1));
  };

  const handleSubmit = async () => {
    const payload = {
      title,
      description,
      team: team.map(({ muid, is_lead }) => ({ muid, is_lead })),
      links,
    };

    let projectId = project?.id;
    try {
      if (project) {
        await updateImpactProject(project.id, payload);
      } else {
        const created = await createImpactProject(payload);
        projectId = created.id;
      }
    } catch {
      // Error surfaced via mutation onError toast
      return;
    }

    if (imageFile && projectId) {
      try {
        await uploadImpactProjectImage(projectId, imageFile);
      } catch {
        // Error surfaced via mutation onError toast; project already saved
      }
    }
    onClose();
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(next) => (!next ? requestClose() : null)}
      >
        <DialogContent className="flex h-[100dvh] w-screen max-w-none flex-col overflow-hidden rounded-none border-0 sm:h-[88dvh] sm:w-[94vw] sm:max-w-[720px] sm:rounded-2xl sm:border">
          <DialogHeader className="pb-2">
            <DialogTitle>
              {project ? "Edit Impact Project" : "Add Impact Project"}
            </DialogTitle>
          </DialogHeader>

          {/* Desktop stepper */}
          <div className="mx-auto hidden w-full max-w-2xl items-center gap-4 px-4 pb-2 sm:flex">
            {STEPS.map((label, index) => {
              const stepIndex = index + 1;
              const isActive = stepIndex === currentStep;
              const isCompleted = stepIndex < currentStep;
              return (
                <Fragment key={label}>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      size="icon-sm"
                      variant={isActive || isCompleted ? "default" : "outline"}
                      onClick={() => {
                        if (stepIndex > currentStep && !validateStep()) return;
                        setCurrentStep(stepIndex);
                      }}
                      aria-label={label}
                      className={
                        isActive
                          ? "ring-2 ring-brand-blue ring-offset-2"
                          : undefined
                      }
                    >
                      {isCompleted ? <Check className="h-4 w-4" /> : stepIndex}
                    </Button>
                    <div className="min-w-0 pt-1">
                      <p
                        className={`whitespace-nowrap text-xs leading-none ${isActive ? "font-medium text-primary" : "text-muted-foreground"}`}
                      >
                        {label}
                      </p>
                    </div>
                  </div>
                  {index < STEPS.length - 1 ? (
                    <div
                      className={`h-0.5 flex-1 self-center ${isCompleted ? "bg-primary" : "bg-border"}`}
                    />
                  ) : null}
                </Fragment>
              );
            })}
          </div>

          {/* Mobile progress */}
          <div className="mx-auto w-full max-w-2xl px-1 pb-2 sm:hidden">
            <p className="text-sm font-medium text-foreground">
              Step {currentStep} of {TOTAL} — {STEPS[currentStep - 1]}
            </p>
            <div className="mt-2 h-1 w-full rounded-full bg-border">
              <div
                className="h-1 rounded-full bg-primary transition-all"
                style={{ width: `${(currentStep / TOTAL) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto w-full max-w-2xl">
              {currentStep === 1 && (
                <section className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      Title <span className="text-destructive">*</span>
                    </p>
                    <Input
                      value={title}
                      onChange={(e) => markDirty(setTitle)(e.target.value)}
                      placeholder="e.g. Community LMS"
                      className="rounded-xl border-border bg-background"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      Description <span className="text-destructive">*</span>
                    </p>
                    <Textarea
                      value={description}
                      onChange={(e) =>
                        markDirty(setDescription)(e.target.value)
                      }
                      placeholder="What does this project do?"
                      rows={5}
                      className="rounded-xl border-border bg-background"
                    />
                    <p
                      className={`text-xs ${
                        description.trim().length < MIN_DESCRIPTION_LENGTH
                          ? "text-destructive"
                          : "text-success"
                      }`}
                    >
                      {description.trim().length}/{MIN_DESCRIPTION_LENGTH}{" "}
                      characters minimum
                    </p>
                  </div>
                </section>
              )}

              {currentStep === 2 && (
                <section className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Team members
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Search and add members. Toggle lead for anyone leading this
                    project.
                  </p>
                  <ImpactProjectTeamPicker
                    value={team}
                    onChange={markDirty(setTeam)}
                  />
                </section>
              )}

              {currentStep === 3 && (
                <section className="space-y-6">
                  <ImpactProjectLinksEditor
                    value={links}
                    onChange={markDirty(setLinks)}
                  />

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      Project image
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/30">
                        {imagePreview ? (
                          // biome-ignore lint/performance/noImgElement: local blob preview / backend media host
                          <img
                            src={imagePreview}
                            alt="Project preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImagePlus className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {imagePreview ? "Replace image" : "Upload image"}
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, or WebP under {MAX_IMAGE_MB} MB.
                        </p>
                        {imageError && (
                          <p className="text-xs text-destructive">
                            {imageError}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {currentStep === 4 && (
                <section className="space-y-6">
                  <h3 className="text-base font-semibold text-foreground">
                    Review impact project
                  </h3>
                  <div className="divide-y divide-border rounded-2xl border border-border bg-card">
                    {[
                      ["Title", title || "Not set"],
                      ["Description", description || "Not set"],
                      [
                        "Team",
                        team.length > 0
                          ? team
                              .map(
                                (m) => `${m.name}${m.is_lead ? " (lead)" : ""}`,
                              )
                              .join(", ")
                          : "Not set",
                      ],
                      [
                        "Links",
                        links.length > 0
                          ? links.map((l) => l.label).join(", ")
                          : "Not set",
                      ],
                      ["Image", imagePreview ? "Attached" : "Not set"],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-start justify-between gap-4 px-4 py-3"
                      >
                        <p className="w-32 shrink-0 text-xs font-medium text-muted-foreground">
                          {label}
                        </p>
                        <p
                          className={`flex-1 text-right text-sm ${
                            value === "Not set"
                              ? "italic text-muted-foreground/60"
                              : "text-foreground"
                          }`}
                        >
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              onClick={requestClose}
              aria-label="Cancel"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>

            <div className="flex items-center gap-2">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                  aria-label="Back"
                >
                  Back
                </Button>
              )}

              {currentStep < TOTAL ? (
                <Button
                  type="button"
                  variant="default"
                  onClick={handleNext}
                  disabled={currentStep === 1 && !validateStep()}
                  aria-label="Next"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="default"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  aria-label={project ? "Save changes" : "Create project"}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {project ? "Save Changes" : "Create Project"}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmCloseOpen}
        onOpenChange={setConfirmCloseOpen}
        title={project ? "Discard changes?" : "Discard new project?"}
        description="All entered information will be lost."
        confirmLabel="Discard"
        onConfirm={() => {
          setConfirmCloseOpen(false);
          onClose();
        }}
      />
    </>
  );
}
