"use client";

/**
 * Problem Statement Form Dialog
 *
 * 📍 src/features/problem-statements/components/problem-statement-form-dialog.tsx
 *
 * Create / edit a problem statement using the shared form primitives
 * (Form*, Input, TagInput, CustomDateTimePicker, MarkdownEditor).
 *
 * The backend rejects unknown fields with 400, so only the whitelisted
 * fields (title, description, category, skills, deadline) are sent. Edits
 * send only the fields that changed — re-sending an untouched past deadline
 * would otherwise block editing a closed statement.
 *
 * Admin-created statements are authored under µLearn (no company_id).
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { CustomDateTimePicker } from "@/components/ui/custom-datetime-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { TagInput } from "@/components/ui/tag-input";
import { CATEGORY_SUGGESTIONS } from "../constants/problem-statement.constants";
import {
  useAdminCreateStatement,
  useAdminUpdateStatement,
  useCreateCompanyStatement,
  useUpdateCompanyStatement,
} from "../hooks";
import { StatementFormSchema } from "../schemas/problem-statement.schema";
import type {
  ProblemStatement,
  UpdateStatementPayload,
} from "../types/problem-statement.types";

type Mode = "company-create" | "company-edit" | "admin-create" | "admin-edit";

type FormInput = z.input<typeof StatementFormSchema>;
type FormOutput = z.output<typeof StatementFormSchema>;

const MAX_SKILLS = 15;
const CATEGORY_LIST_ID = "problem-statement-categories";

interface ProblemStatementFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: Mode;
  /** Populated when editing an existing statement */
  statement?: ProblemStatement;
  onSuccess?: (statement: ProblemStatement) => void;
}

function toFormValues(statement?: ProblemStatement): FormInput {
  return {
    title: statement?.title ?? "",
    description: statement?.description ?? "",
    category: statement?.category ?? "",
    skills: statement?.skills ?? [],
    deadline: statement?.deadline ?? null,
  };
}

/** Trim, drop blanks, de-duplicate case-insensitively, cap at MAX_SKILLS. */
function normalizeSkills(skills: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of skills) {
    const skill = raw.trim();
    const key = skill.toLowerCase();
    if (!skill || seen.has(key)) continue;
    seen.add(key);
    out.push(skill);
  }
  return out.slice(0, MAX_SKILLS);
}

export function ProblemStatementFormDialog({
  open,
  onClose,
  mode,
  statement,
  onSuccess,
}: ProblemStatementFormDialogProps) {
  const isEditing = mode === "company-edit" || mode === "admin-edit";
  const isAdmin = mode === "admin-create" || mode === "admin-edit";

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(StatementFormSchema),
    defaultValues: toFormValues(isEditing ? statement : undefined),
  });
  const { reset, formState } = form;

  useEffect(() => {
    if (open) reset(toFormValues(isEditing ? statement : undefined));
  }, [open, isEditing, statement, reset]);

  const companyCreate = useCreateCompanyStatement();
  const companyUpdate = useUpdateCompanyStatement();
  const adminCreate = useAdminCreateStatement();
  const adminUpdate = useAdminUpdateStatement();
  const isPending =
    companyCreate.isPending ||
    companyUpdate.isPending ||
    adminCreate.isPending ||
    adminUpdate.isPending;

  const titleLength = form.watch("title")?.length ?? 0;
  const minDeadline = useMemo(() => new Date(), []);

  const onSubmit = async (values: FormOutput) => {
    try {
      let result: ProblemStatement;
      if (isEditing && statement) {
        const dirty = formState.dirtyFields;
        const payload: UpdateStatementPayload = {};
        if (dirty.title) payload.title = values.title;
        if (dirty.description) payload.description = values.description;
        if (dirty.category) payload.category = values.category;
        if (dirty.skills) payload.skills = values.skills;
        if (dirty.deadline) payload.deadline = values.deadline ?? null;
        if (Object.keys(payload).length === 0) {
          onClose();
          return;
        }
        const update = isAdmin ? adminUpdate : companyUpdate;
        result = await update.mutateAsync({ id: statement.id, payload });
        toast.success("Problem statement updated.");
      } else {
        const create = isAdmin ? adminCreate : companyCreate;
        result = await create.mutateAsync(values);
        toast.success("Draft created. Publish it when you're ready.");
      }
      onSuccess?.(result);
      onClose();
    } catch {
      // error toasts are owned by the mutation hooks
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 border-b border-border px-6 pt-6 pb-4 text-left">
          <DialogTitle>
            {isEditing ? "Edit Problem Statement" : "New Problem Statement"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Changes to a published statement are visible to learners right away."
              : isAdmin
                ? "Posted under µLearn and saved as a draft. Publish it from its page when it's ready."
                : "Saved as a draft. Publish it from its page when it's ready."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Title <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="A clear, specific problem title"
                        maxLength={150}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>{titleLength}/150</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Category <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          list={CATEGORY_LIST_ID}
                          placeholder="e.g. AI / ML"
                          maxLength={100}
                          autoComplete="off"
                          {...field}
                        />
                      </FormControl>
                      <datalist id={CATEGORY_LIST_ID}>
                        {CATEGORY_SUGGESTIONS.map((cat) => (
                          <option key={cat} value={cat} />
                        ))}
                      </datalist>
                      <FormDescription>
                        Pick a suggestion or type your own.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deadline</FormLabel>
                      <div className="flex items-center gap-2">
                        <div className="min-w-0 flex-1">
                          <CustomDateTimePicker
                            value={field.value ?? undefined}
                            onChange={field.onChange}
                            minDate={minDeadline}
                          />
                        </div>
                        {field.value && (
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => field.onChange(null)}
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      <FormDescription>
                        Optional. Without one, it stays open until you unpublish
                        it.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills</FormLabel>
                    <FormControl>
                      <TagInput
                        value={field.value ?? []}
                        onChange={(tags) =>
                          field.onChange(normalizeSkills(tags))
                        }
                        placeholder="Type a skill and press Enter"
                      />
                    </FormControl>
                    <FormDescription>
                      {(field.value ?? []).length}/{MAX_SKILLS} — press Enter or
                      comma to add.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Description <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <MarkdownEditor
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Describe the problem, its context, constraints, and what a good solution looks like."
                        rows={10}
                      />
                    </FormControl>
                    <FormDescription>
                      Markdown supported · {(field.value ?? "").length}/20,000
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="shrink-0 gap-2 border-t border-border px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="animate-spin" />}
                {isEditing ? "Save Changes" : "Create Draft"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
