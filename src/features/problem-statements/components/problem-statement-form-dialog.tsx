"use client";

/**
 * Problem Statement Form Dialog
 *
 * 📍 src/features/problem-statements/components/problem-statement-form-dialog.tsx
 *
 * A clean, focused dialog for creating and editing problem statements.
 * Replaces the old multi-step wizard.
 *
 * Strictly sends only whitelisted fields (title, description, category,
 * skills, deadline) to avoid the backend's 400 "Unknown field." rejection.
 *
 * In admin mode, statements are authored directly under μLearn without requiring
 * or accepting a company ID.
 */

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CalendarIcon,
  Check,
  Info,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import { Fragment, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CATEGORY_SUGGESTIONS,
  STATEMENT_FORM_DEFAULTS,
} from "../constants/problem-statement.constants";
import {
  useAdminCreateStatement,
  useAdminUpdateStatement,
  useCreateCompanyStatement,
  useUpdateCompanyStatement,
} from "../hooks";
import {
  AdminCreateStatementSchema,
  CompanyCreateStatementSchema,
  UpdateStatementSchema,
} from "../schemas/problem-statement.schema";
import type { ProblemStatement } from "../types/problem-statement.types";

// ─── Types ────────────────────────────────────────────────────────────────────

type Mode = "company-create" | "company-edit" | "admin-create" | "admin-edit";

interface ProblemStatementFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: Mode;
  /** Populated when editing an existing statement */
  statement?: ProblemStatement;
  onSuccess?: (statement: ProblemStatement) => void;
}

// ─── Helper: field error ──────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1.5 text-xs text-destructive mt-1.5">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {message}
    </p>
  );
}

function FieldLabel({
  children,
  htmlFor,
  required,
  hint,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex items-baseline justify-between mb-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-foreground"
      >
        {children}
        {required && (
          <span className="text-destructive ml-1" aria-hidden>
            *
          </span>
        )}
      </label>
      {hint && (
        <span className="text-[11px] text-muted-foreground">{hint}</span>
      )}
    </div>
  );
}

// ─── Skills tag input ─────────────────────────────────────────────────────────

function SkillsInput({
  value,
  onChange,
  error,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  error?: string;
}) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addSkill = (raw: string) => {
    const skill = raw.trim();
    if (!skill || value.length >= 15) return;
    // de-duplicate case-insensitively
    const exists = value.some((s) => s.toLowerCase() === skill.toLowerCase());
    if (!exists) {
      onChange([...value, skill]);
    }
    setInput("");
  };

  const removeSkill = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <div
        className={`flex flex-wrap gap-1.5 min-h-[40px] rounded-xl border bg-background px-3 py-2 cursor-text ${
          error ? "border-destructive" : "border-input"
        }`}
      >
        {value.map((skill) => (
          <Badge
            key={skill}
            variant="secondary"
            className="rounded-full text-[11px] flex items-center gap-1 h-6 px-2"
          >
            {skill}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeSkill(value.indexOf(skill));
              }}
              className="rounded-full hover:text-destructive transition-colors"
              aria-label={`Remove ${skill}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addSkill(input);
            } else if (e.key === "Backspace" && !input && value.length > 0) {
              removeSkill(value.length - 1);
            }
          }}
          placeholder={
            value.length === 0 ? "Type a skill and press Enter…" : ""
          }
          className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">
        {value.length}/15 — press Enter or comma to add
      </p>
      <FieldError message={error} />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ProblemStatementFormDialog({
  open,
  onClose,
  mode,
  statement,
  onSuccess,
}: ProblemStatementFormDialogProps) {
  const isEditing = mode === "company-edit" || mode === "admin-edit";
  const isAdmin = mode === "admin-create" || mode === "admin-edit";

  // Pick the right schema and defaults
  const schema = isAdmin
    ? isEditing
      ? UpdateStatementSchema
      : AdminCreateStatementSchema
    : isEditing
      ? UpdateStatementSchema
      : CompanyCreateStatementSchema;

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...STATEMENT_FORM_DEFAULTS,
      ...(isEditing && statement
        ? {
            title: statement.title,
            description: statement.description,
            category: statement.category,
            skills: statement.skills,
            deadline: statement.deadline ?? null,
          }
        : {}),
    } as FormValues,
  });

  useEffect(() => {
    if (open) {
      reset({
        ...STATEMENT_FORM_DEFAULTS,
        ...(isEditing && statement
          ? {
              title: statement.title,
              description: statement.description,
              category: statement.category,
              skills: statement.skills,
              deadline: statement.deadline ?? null,
            }
          : {}),
      } as FormValues);
    }
  }, [open, isEditing, statement, reset]);

  const skills = (watch("skills" as keyof FormValues) ?? []) as string[];

  // Mutations
  const companyCreate = useCreateCompanyStatement();
  const companyUpdate = useUpdateCompanyStatement();
  const adminCreate = useAdminCreateStatement();
  const adminUpdate = useAdminUpdateStatement();

  const isPending =
    companyCreate.isPending ||
    companyUpdate.isPending ||
    adminCreate.isPending ||
    adminUpdate.isPending;

  const onSubmit = async (data: FormValues) => {
    try {
      let result: ProblemStatement;

      if (mode === "company-create") {
        result = await companyCreate.mutateAsync(
          data as Parameters<typeof companyCreate.mutateAsync>[0],
        );
        toast.success("Problem statement created as Draft.");
      } else if (mode === "company-edit" && statement) {
        result = await companyUpdate.mutateAsync({
          id: statement.id,
          payload: data as Parameters<
            typeof companyUpdate.mutateAsync
          >[0]["payload"],
        });
        toast.success("Problem statement updated.");
      } else if (mode === "admin-create") {
        result = await adminCreate.mutateAsync(
          data as Parameters<typeof adminCreate.mutateAsync>[0],
        );
        toast.success("Problem statement created as Draft.");
      } else if (mode === "admin-edit" && statement) {
        result = await adminUpdate.mutateAsync({
          id: statement.id,
          payload: data as Parameters<
            typeof adminUpdate.mutateAsync
          >[0]["payload"],
        });
        toast.success("Problem statement updated.");
      } else {
        return;
      }

      reset(STATEMENT_FORM_DEFAULTS as FormValues);
      onSuccess?.(result);
      onClose();
    } catch {
      // Error notifications are handled by the mutation hook's onError callback
    }
  };

  const title = isEditing ? "Edit Problem Statement" : "New Problem Statement";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex flex-col gap-0 p-0 sm:max-w-2xl w-[94vw] sm:w-[90vw] md:max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-background shadow-2xl">
        <DialogHeader className="px-6 py-5 sm:px-8 border-b border-border/80 bg-background/95 backdrop-blur-md shrink-0 pr-14 text-left">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            {title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isEditing
              ? "Edit details of this problem statement"
              : "Create a new problem statement"}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 space-y-5 bg-muted/10">
            {/* Admin notice: authored directly for muLearn */}
            {isAdmin && !isEditing && (
              <div className="flex items-start gap-3 rounded-xl border border-brand-blue/20 bg-brand-blue/5 p-3.5 text-xs text-brand-blue dark:border-brand-blue/30 dark:bg-brand-blue/10">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">
                    Creating on behalf of μLearn
                  </p>
                  <p className="mt-0.5 text-muted-foreground text-[11px] leading-relaxed">
                    This problem statement will be published under the μLearn
                    platform directly without requiring company attribution.
                  </p>
                </div>
              </div>
            )}
            {/* Title */}
            <div>
              <FieldLabel
                htmlFor="title"
                required
                hint={`${(watch("title" as keyof FormValues) as string)?.length ?? 0}/150`}
              >
                Title
              </FieldLabel>
              <Input
                id="title"
                placeholder="A clear, compelling problem title"
                {...register("title" as keyof FormValues)}
                className={errors.title ? "border-destructive" : ""}
              />
              <FieldError
                message={errors.title?.message as string | undefined}
              />
            </div>
            {/* Category */}
            <div>
              <FieldLabel htmlFor="category" required>
                Category
              </FieldLabel>
              <Input
                id="category"
                placeholder="e.g. AI / ML, Sustainability, Web Development"
                {...register("category" as keyof FormValues)}
                className={
                  (errors as Record<string, unknown>).category
                    ? "border-destructive"
                    : ""
                }
              />
              {/* Suggestion pills */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {CATEGORY_SUGGESTIONS.slice(0, 8).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() =>
                      setValue(
                        "category" as keyof FormValues,
                        cat as FormValues[keyof FormValues],
                        {
                          shouldValidate: true,
                        },
                      )
                    }
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                      watch("category" as keyof FormValues) === cat
                        ? "bg-brand-blue/10 text-brand-blue border-brand-blue/30"
                        : "bg-muted/60 text-muted-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <FieldError
                message={
                  (errors as Record<string, { message?: string }>).category
                    ?.message
                }
              />
            </div>
            {/* Skills */}
            <div>
              <FieldLabel hint={`${skills.length}/15`}>Skills</FieldLabel>
              <SkillsInput
                value={skills}
                onChange={(v) =>
                  setValue(
                    "skills" as keyof FormValues,
                    v as FormValues[keyof FormValues],
                    {
                      shouldValidate: true,
                    },
                  )
                }
                error={
                  (errors as Record<string, { message?: string }>).skills
                    ?.message
                }
              />
            </div>
            {/* Deadline */}
            <div>
              <FieldLabel htmlFor="deadline">Deadline</FieldLabel>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  id="deadline"
                  type="datetime-local"
                  {...register("deadline" as keyof FormValues)}
                  className="flex h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Leave empty for no deadline (continuous). Must be a future date.
              </p>
              <FieldError
                message={
                  (errors as Record<string, { message?: string }>).deadline
                    ?.message
                }
              />
            </div>
            {/* Description */}
            <div>
              <FieldLabel
                htmlFor="description"
                required
                hint={`${(watch("description" as keyof FormValues) as string)?.length ?? 0}/20,000`}
              >
                Description
              </FieldLabel>
              <Textarea
                id="description"
                placeholder="Detailed description of the problem, context, and what you're looking for. Markdown is supported."
                rows={8}
                {...register("description" as keyof FormValues)}
                className={`font-mono text-xs resize-y ${(errors as Record<string, unknown>).description ? "border-destructive" : ""}`}
              />
              <FieldError
                message={
                  (errors as Record<string, { message?: string }>).description
                    ?.message
                }
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 sm:px-8 border-t border-border/80 shrink-0 bg-background/95 backdrop-blur-md">
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-xl gap-2"
              disabled={isPending || isSubmitting}
            >
              {isPending || isSubmitting ? (
                <Fragment>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isEditing ? "Saving…" : "Creating…"}
                </Fragment>
              ) : (
                <Fragment>
                  {isEditing ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {isEditing ? "Save Changes" : "Create Draft"}
                </Fragment>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
