"use client";

/**
 * Problem Statement Form Dialog
 *
 * 📍 src/features/problem-statements/components/problem-statement-form-dialog.tsx
 *
 * Create / edit a problem statement using the shared form primitives
 * (Form*, Input, SkillSearchInput, CustomDateTimePicker, MarkdownEditor).
 *
 * The backend rejects unknown fields with 400, so only the whitelisted
 * fields (title, description, category, skills, deadline) are sent. Edits
 * send only the fields that changed — re-sending an untouched past deadline
 * would otherwise block editing a closed statement.
 *
 * Admins pick who posts the statement: µLearn (default), a verified company
 * (`company_id`) or a community (`community_id`) — never both. Company
 * payloads never send either. Admins can also mention a user (`muid`) the statement is drafted on behalf
 * of; the backend notifies that user. Company payloads never send `muid`.
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserRound, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
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
import { MuidSearchInput } from "@/components/ui/muid-search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SkillSearchInput } from "@/components/ui/skill-search-input";
import { useCompanyVerificationList } from "@/features/manage-companies";
import { useCommunities } from "@/features/onboarding";
import { useDebounce } from "@/hooks/use-debounce";
import { CATEGORY_SUGGESTIONS } from "../constants/problem-statement.constants";
import {
  useAdminCreateStatement,
  useAdminUpdateStatement,
  useCreateCompanyStatement,
  useUpdateCompanyStatement,
} from "../hooks";
import { StatementFormSchema } from "../schemas/problem-statement.schema";
import type {
  AdminUpdateStatementPayload,
  EmbeddedUser,
  ProblemStatement,
  StatementSource,
} from "../types/problem-statement.types";

type MentionedUser = Pick<EmbeddedUser, "muid" | "full_name">;
type Owner = { source: StatementSource; id: string | null; name?: string };

const OWNER_HINTS: Record<StatementSource, string> = {
  mulearn: "Authored by µLearn, not linked to any company or community.",
  company: "The company can edit and publish it, and gets a notification.",
  community: "Shown under the community's name. Only admins can edit it.",
};

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

/** Current owner. For community statements `company` carries the community. */
function toOwner(statement?: ProblemStatement): Owner {
  const c = statement?.company;
  if (!c?.id) return { source: "mulearn", id: null };
  const source = statement?.source === "community" ? "community" : "company";
  return { source, id: c.id, name: c.name };
}

type PickerProps = {
  value: Owner;
  onChange: (id: string, name: string) => void;
  disabled?: boolean;
};

/** Server-searched verified companies (admin only). */
function CompanyPicker({ value, onChange, disabled }: PickerProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading } = useCompanyVerificationList({
    pageIndex: 1,
    perPage: 20,
    search: debouncedSearch,
    sortBy: "",
    status: "verified",
  });
  const options = (data?.data ?? []).map((c) => ({ id: c.id, title: c.name }));
  return (
    <Combobox
      options={options}
      value={value.id ?? undefined}
      selectedLabel={value.name}
      onValueChange={(id) => {
        const picked = options.find((o) => o.id === id);
        if (picked) onChange(id, picked.title);
      }}
      onSearchChange={setSearch}
      loading={isLoading}
      placeholder="Search a verified company…"
      disabled={disabled}
    />
  );
}

/** Communities from the public register list (filtered client-side). */
function CommunityPicker({ value, onChange, disabled }: PickerProps) {
  const { data, isLoading } = useCommunities();
  const options = data ?? [];
  return (
    <Combobox
      options={options}
      value={value.id ?? undefined}
      selectedLabel={value.name}
      onValueChange={(id) => {
        const picked = options.find((o) => o.id === id);
        if (picked) onChange(id, picked.title);
      }}
      loading={isLoading}
      placeholder="Search a community…"
      disabled={disabled}
    />
  );
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

  // Admin-only "on behalf of" mention. Kept outside the zod form: company
  // payloads must never carry `muid` (backend rejects unknown fields).
  const [mentioned, setMentioned] = useState<MentionedUser | null>(() =>
    isEditing && statement?.on_behalf_of ? statement.on_behalf_of : null,
  );

  // Admin-only owner, sent as company_id / community_id.
  const initialOwner = useMemo(
    () => toOwner(isEditing ? statement : undefined),
    [isEditing, statement],
  );
  const [owner, setOwner] = useState<Owner>(initialOwner);

  useEffect(() => {
    if (!open) return;
    reset(toFormValues(isEditing ? statement : undefined));
    setMentioned(
      isEditing && statement?.on_behalf_of ? statement.on_behalf_of : null,
    );
    setOwner(initialOwner);
  }, [open, isEditing, statement, reset, initialOwner]);

  const changeSource = (source: StatementSource) =>
    setOwner(
      source === initialOwner.source ? initialOwner : { source, id: null },
    );

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
    if (isAdmin && owner.source !== "mulearn" && !owner.id) {
      toast.error(`Pick a ${owner.source}, or switch to µLearn.`);
      return;
    }
    const ownerField =
      owner.source === "company"
        ? { company_id: owner.id }
        : owner.source === "community"
          ? { community_id: owner.id }
          : {};
    try {
      let result: ProblemStatement;
      if (isEditing && statement) {
        const dirty = formState.dirtyFields;
        const payload: AdminUpdateStatementPayload = {};
        if (dirty.title) payload.title = values.title;
        if (dirty.description) payload.description = values.description;
        if (dirty.category) payload.category = values.category;
        if (dirty.skills) payload.skills = values.skills;
        if (dirty.deadline) payload.deadline = values.deadline ?? null;
        if (
          isAdmin &&
          (mentioned?.muid ?? null) !== (statement.on_behalf_of?.muid ?? null)
        ) {
          // "" clears the mention on the backend
          payload.muid = mentioned?.muid ?? "";
        }
        if (
          isAdmin &&
          (owner.source !== initialOwner.source || owner.id !== initialOwner.id)
        ) {
          // Back to µLearn: null on the field that currently links it.
          if (owner.source === "mulearn") {
            payload[
              initialOwner.source === "community"
                ? "community_id"
                : "company_id"
            ] = null;
          } else {
            Object.assign(payload, ownerField);
          }
        }
        if (Object.keys(payload).length === 0) {
          onClose();
          return;
        }
        result = isAdmin
          ? await adminUpdate.mutateAsync({ id: statement.id, payload })
          : await companyUpdate.mutateAsync({ id: statement.id, payload });
        toast.success("Problem statement updated.");
      } else {
        result = isAdmin
          ? await adminCreate.mutateAsync({
              ...values,
              ...ownerField,
              ...(mentioned && { muid: mentioned.muid }),
            })
          : await companyCreate.mutateAsync(values);
        toast.success("Draft created. Publish it when you're ready.");
      }
      onSuccess?.(result);
      onClose();
    } catch {
      // error toasts (incl. unknown-muid 400) are owned by the mutation hooks
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl lg:max-w-4xl">
        <DialogHeader className="shrink-0 border-b border-border px-6 pt-6 pb-4 text-left">
          <DialogTitle>
            {isEditing ? "Edit Problem Statement" : "New Problem Statement"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Changes to a published statement are visible to learners right away."
              : "Saved as a draft. Publish it from its page when it's ready."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
              {isAdmin && (
                <div className="space-y-2">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <label
                      htmlFor="problem-statement-owner"
                      className="shrink-0 text-sm font-medium text-foreground"
                    >
                      Posted by
                    </label>
                    <Select
                      value={owner.source}
                      onValueChange={(v) => changeSource(v as StatementSource)}
                      disabled={isPending}
                    >
                      <SelectTrigger
                        id="problem-statement-owner"
                        className="w-full sm:w-40 sm:shrink-0"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mulearn">µLearn</SelectItem>
                        <SelectItem value="company">Company</SelectItem>
                        <SelectItem value="community">Community</SelectItem>
                      </SelectContent>
                    </Select>
                    {owner.source !== "mulearn" && (
                      <div className="min-w-0 flex-1">
                        {owner.source === "company" ? (
                          <CompanyPicker
                            value={owner}
                            onChange={(id, name) =>
                              setOwner({ source: "company", id, name })
                            }
                            disabled={isPending}
                          />
                        ) : (
                          <CommunityPicker
                            value={owner}
                            onChange={(id, name) =>
                              setOwner({ source: "community", id, name })
                            }
                            disabled={isPending}
                          />
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {OWNER_HINTS[owner.source]}
                  </p>
                </div>
              )}

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
                      <SkillSearchInput
                        value={(field.value ?? []).map((name) => ({
                          id: name,
                          name,
                          code: "",
                        }))}
                        onChange={(skills) =>
                          field.onChange(
                            normalizeSkills(skills.map((s) => s.name)),
                          )
                        }
                        placeholder={"Search a skill…"}
                        disabled={isPending}
                        maxSelected={MAX_SKILLS}
                        creatable={isAdmin}
                      />
                    </FormControl>
                    <FormDescription>
                      {(field.value ?? []).length}/{MAX_SKILLS}
                      {" — press Enter or comma to add."}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isAdmin && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Curated and supported by
                  </p>
                  {mentioned ? (
                    <div className="flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm">
                      <UserRound className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate font-medium text-foreground">
                        {mentioned.full_name}
                      </span>
                      <span className="shrink-0 font-mono text-xs text-muted-foreground">
                        ({mentioned.muid})
                      </span>
                      <button
                        type="button"
                        className="ml-auto rounded-sm opacity-60 transition-opacity hover:opacity-100 disabled:pointer-events-none"
                        onClick={() => setMentioned(null)}
                        disabled={isPending}
                        aria-label="Remove mentioned user"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <MuidSearchInput
                      onSelectUser={(user) =>
                        setMentioned({
                          muid: user.muid,
                          full_name: user.full_name,
                        })
                      }
                      placeholder="Search a user by name or muid…"
                      disabled={isPending}
                    />
                  )}
                  <p className="text-sm text-muted-foreground">
                    Optional. Mention the user this statement is drafted for —
                    they'll get a notification.
                  </p>
                </div>
              )}

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
