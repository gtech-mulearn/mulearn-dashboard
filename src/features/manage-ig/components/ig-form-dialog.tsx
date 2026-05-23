"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, Lock, Plus, Trash2 } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { type Control, Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useInterestGroupsAdmin } from "../hooks/use-manage-ig";
import {
  type InterestGroup,
  type InterestGroupCreate,
  InterestGroupCreateSchema,
} from "../schemas";

const IG_WIZARD_STEPS = [
  "Basic Info",
  "About & Learning",
  "Team & Schedule",
  "Review",
] as const;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  initialData?: InterestGroup | null;
  /** When true, restricts core fields to read-only and uses PATCH */
  isIGLead?: boolean;
};

type InterestGroupArrayField =
  | string
  | string[]
  | { title: string; url: string }[]
  | { name: string; twitter?: string | null; designation?: string | null }[]
  | { name: string; email?: string | null; muid?: string | null }[]
  | {
      name: string;
      expertise?: string | null;
      linkedin?: string | null;
      muid?: string | null;
    }[]
  | null
  | undefined;

function normalizeArrayField(value: InterestGroupArrayField): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) =>
      typeof item === "string"
        ? item
        : "name" in item
          ? item.name
          : "title" in item
            ? item.title
            : String(item),
    );
  }
  try {
    if (
      typeof value === "string" &&
      (value.startsWith("[") || value.startsWith("{"))
    ) {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [String(parsed)];
    }
    return value.trim() ? value.split(",").map((s) => s.trim()) : [];
  } catch {
    return value.trim() ? [value] : [];
  }
}

type BlogEntry = { _key: string; title: string; url: string };
type PersonEntry = {
  _key: string;
  name: string;
  twitter: string;
  designation: string;
};

function newKey() {
  return Math.random().toString(36).slice(2);
}

function toTopBlogsArray(raw: unknown): BlogEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, i) => {
    if (item && typeof item === "object" && "title" in item) {
      const b = item as { title?: string; url?: string };
      return { _key: String(i), title: b.title ?? "", url: b.url ?? "" };
    }
    return {
      _key: String(i),
      title: typeof item === "string" ? item : "",
      url: "",
    };
  });
}

function toPeopleArray(raw: unknown): PersonEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item, i) => {
      if (item && typeof item === "object" && "name" in item) {
        const p = item as {
          name?: string;
          twitter?: string | null;
          designation?: string | null;
        };
        return {
          _key: String(i),
          name: p.name ?? "",
          twitter: p.twitter ?? "",
          designation: p.designation ?? "",
        };
      }
      return {
        _key: String(i),
        name: typeof item === "string" ? item : "",
        twitter: "",
        designation: "",
      };
    })
    .filter((p) => p.name);
}

function ArrayInputField({
  control,
  name,
  label,
  placeholder,
}: {
  control: Control<InterestGroupCreate>;
  name: keyof InterestGroupCreate;
  label: string;
  placeholder: string;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <Input
            className="rounded-xl border-border bg-background"
            placeholder={placeholder}
            value={
              Array.isArray(field.value)
                ? (field.value as string[]).join(", ")
                : String(field.value ?? "")
            }
            onChange={(e) =>
              field.onChange(
                e.target.value
                  ? e.target.value.split(",").map((s) => s.trim())
                  : [],
              )
            }
          />
        </div>
      )}
    />
  );
}

const DEFAULT_VALUES: InterestGroupCreate = {
  name: "",
  code: "",
  category: "coder",
  icon: "",
  about: "",
  prerequisites: [],
  career_opportunities: [],
  resource: "",
  top_blogs: [],
  people_to_follow: [],
  leads: [],
  mentors: [],
  thinktank: "",
  office_hours: "",
};

export function InterestGroupFormDialog({
  isOpen,
  onClose,
  initialData,
  isIGLead = false,
}: Props) {
  const {
    createInterestGroup,
    updateInterestGroup,
    partialUpdateInterestGroup,
  } = useInterestGroupsAdmin();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const [leadMuids, setLeadMuids] = useState<string[]>([]);
  const [mentorMuids, setMentorMuids] = useState<string[]>([]);
  const [topBlogs, setTopBlogs] = useState<BlogEntry[]>([]);
  const [peopleToFollow, setPeopleToFollow] = useState<PersonEntry[]>([]);

  const {
    control,
    register,
    trigger,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<InterestGroupCreate>({
    resolver: zodResolver(InterestGroupCreateSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (!isOpen) return;
    setCurrentStep(1);
    if (initialData) {
      reset({
        name: initialData.name,
        code: initialData.code,
        category: initialData.category as InterestGroupCreate["category"],
        icon: initialData.icon ?? "",
        about: initialData.about ?? "",
        prerequisites: normalizeArrayField(initialData.prerequisites),
        career_opportunities: normalizeArrayField(
          initialData.career_opportunities,
        ),
        resource: initialData.resource ?? "",
        top_blogs: [],
        people_to_follow: [],
        leads: [],
        mentors: [],
        thinktank: initialData.thinktank ?? "",
        office_hours: initialData.office_hours ?? "",
      });
      setTopBlogs(toTopBlogsArray(initialData.top_blogs));
      setPeopleToFollow(toPeopleArray(initialData.people_to_follow));
    } else {
      reset(DEFAULT_VALUES);
      setTopBlogs([]);
      setPeopleToFollow([]);
    }
  }, [isOpen, initialData, reset]);

  useEffect(() => {
    const extract = (raw: unknown): string[] => {
      if (!raw || !Array.isArray(raw)) return [];
      return raw
        .map((item) => {
          if (typeof item === "string") return item;
          if (item && typeof item === "object") {
            const r = item as Record<string, unknown>;
            if (r.muid) return String(r.muid);
            if (r.name) return String(r.name);
          }
          return null;
        })
        .filter(Boolean) as string[];
    };
    setLeadMuids(extract(initialData?.leads));
    setMentorMuids(extract(initialData?.mentors));
  }, [initialData]);

  const requestClose = () => {
    if (isDirty || leadMuids.length > 0 || mentorMuids.length > 0) {
      setConfirmCloseOpen(true);
      return;
    }
    onClose();
  };

  const validateStep = async (): Promise<boolean> => {
    if (currentStep === 1) {
      return trigger(["name", "code", "category", "icon"]);
    }
    return true;
  };

  const handleNext = async () => {
    const ok = await validateStep();
    if (!ok) return;
    setCurrentStep((s) => Math.min(IG_WIZARD_STEPS.length, s + 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const values = watch();
      const payload = {
        ...values,
        top_blogs: topBlogs.map(({ _key: _, ...b }) => b),
        people_to_follow: peopleToFollow.map(({ _key: _, ...p }) => p),
        leads: leadMuids.map((m) => ({ muid: m })),
        mentors: mentorMuids.map((m) => ({ muid: m })),
      };

      if (initialData) {
        if (isIGLead) {
          const { name: _n, code: _c, category: _cat, ...leadFields } = payload;
          await partialUpdateInterestGroup(initialData.id, leadFields);
        } else {
          await updateInterestGroup(initialData.id, payload);
        }
      } else {
        await createInterestGroup(payload);
      }

      setCurrentStep(1);
      onClose();
    } catch {
      // Error handled by mutation onError toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const values = watch();
  const TOTAL = IG_WIZARD_STEPS.length;
  const coreFieldsLocked = isIGLead && !!initialData;

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(next) => (!next ? requestClose() : null)}
      >
        <DialogContent className="flex h-[100dvh] w-screen max-w-none flex-col overflow-hidden rounded-none border-0 sm:h-[92dvh] sm:w-[94vw] sm:max-w-[860px] sm:rounded-2xl sm:border">
          <DialogHeader className="pb-2">
            <DialogTitle>
              {initialData ? "Edit Interest Group" : "Create Interest Group"}
            </DialogTitle>
          </DialogHeader>

          {/* Desktop stepper */}
          <div className="mx-auto hidden w-full max-w-3xl items-center gap-4 px-4 pb-2 sm:flex">
            {IG_WIZARD_STEPS.map((label, index) => {
              const stepIndex = index + 1;
              const isActive = stepIndex === currentStep;
              const isCompleted = stepIndex < currentStep;
              return (
                <Fragment key={label}>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={!isCompleted}
                      onClick={() => isCompleted && setCurrentStep(stepIndex)}
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${
                        isActive
                          ? "border-primary bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                          : isCompleted
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? <Check className="h-4 w-4" /> : stepIndex}
                    </button>
                    <div className="min-w-0 pt-1">
                      <p
                        className={`whitespace-nowrap text-xs leading-none ${isActive ? "font-medium text-primary" : "text-muted-foreground"}`}
                      >
                        {label}
                      </p>
                    </div>
                  </div>
                  {index < IG_WIZARD_STEPS.length - 1 ? (
                    <div
                      className={`h-0.5 flex-1 self-center ${isCompleted ? "bg-primary" : "bg-border"}`}
                    />
                  ) : null}
                </Fragment>
              );
            })}
          </div>

          {/* Mobile progress */}
          <div className="mx-auto w-full max-w-3xl px-1 pb-2 sm:hidden">
            <p className="text-sm font-medium text-foreground">
              Step {currentStep} of {TOTAL} — {IG_WIZARD_STEPS[currentStep - 1]}
            </p>
            <div className="mt-2 h-1 w-full rounded-full bg-border">
              <div
                className="h-1 rounded-full bg-primary transition-all"
                style={{ width: `${(currentStep / TOTAL) * 100}%` }}
              />
            </div>
          </div>

          {/* Step content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto w-full max-w-3xl">
              {/* Step 1: Basic Info */}
              {currentStep === 1 ? (
                <section className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                        Name <span className="text-destructive">*</span>
                        {coreFieldsLocked && (
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        )}
                      </p>
                      <Input
                        className="rounded-xl border-border bg-background"
                        placeholder="e.g. Web Development"
                        disabled={coreFieldsLocked}
                        {...register("name")}
                      />
                      {errors.name?.message ? (
                        <p className="text-xs text-destructive">
                          {errors.name.message}
                        </p>
                      ) : coreFieldsLocked ? (
                        <p className="text-xs text-muted-foreground">
                          Managed by admins
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-1">
                      <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                        Code <span className="text-destructive">*</span>
                        {coreFieldsLocked && (
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        )}
                      </p>
                      <Input
                        className="rounded-xl border-border bg-background"
                        placeholder="e.g. WD"
                        disabled={coreFieldsLocked}
                        {...register("code")}
                      />
                      {errors.code?.message ? (
                        <p className="text-xs text-destructive">
                          {errors.code.message}
                        </p>
                      ) : coreFieldsLocked ? (
                        <p className="text-xs text-muted-foreground">
                          Managed by admins
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                        Category <span className="text-destructive">*</span>
                        {coreFieldsLocked && (
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        )}
                      </p>
                      <Controller
                        control={control}
                        name="category"
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={coreFieldsLocked}
                          >
                            <SelectTrigger className="rounded-xl border-border bg-background">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="maker">Maker</SelectItem>
                              <SelectItem value="coder">Coder</SelectItem>
                              <SelectItem value="creative">Creative</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="others">Others</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.category?.message ? (
                        <p className="text-xs text-destructive">
                          {errors.category.message}
                        </p>
                      ) : coreFieldsLocked ? (
                        <p className="text-xs text-muted-foreground">
                          Managed by admins
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        Icon URL <span className="text-destructive">*</span>
                      </p>
                      <Input
                        className="rounded-xl border-border bg-background"
                        placeholder="https://example.com/icon.png"
                        {...register("icon")}
                      />
                      {errors.icon?.message ? (
                        <p className="text-xs text-destructive">
                          {errors.icon.message}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </section>
              ) : null}

              {/* Step 2: About & Learning */}
              {currentStep === 2 ? (
                <section className="space-y-6">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">About</p>
                    <Controller
                      control={control}
                      name="about"
                      render={({ field }) => (
                        <MarkdownEditor
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          placeholder="Describe the interest group and its goals... (Markdown supported)"
                          rows={6}
                        />
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <ArrayInputField
                      control={control}
                      name="prerequisites"
                      label="Prerequisites"
                      placeholder="e.g. HTML, CSS, JS"
                    />
                    <ArrayInputField
                      control={control}
                      name="career_opportunities"
                      label="Career Opportunities"
                      placeholder="e.g. Frontend Dev, UI Designer"
                    />
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      Resource URL
                    </p>
                    <Input
                      className="rounded-xl border-border bg-background"
                      placeholder="Link to learning resources"
                      {...register("resource")}
                    />
                  </div>

                  {/* Top Blogs */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">
                        Top Blogs
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setTopBlogs((prev) => [
                            ...prev,
                            { _key: newKey(), title: "", url: "" },
                          ])
                        }
                        className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
                      >
                        <Plus className="h-3 w-3" /> Add
                      </button>
                    </div>
                    <div className="space-y-2">
                      {topBlogs.map((blog) => (
                        <div
                          key={blog._key}
                          className="flex gap-2 items-start rounded-xl border border-border/50 bg-muted/20 p-3"
                        >
                          <div className="flex-1 space-y-2">
                            <Input
                              value={blog.title}
                              onChange={(e) =>
                                setTopBlogs((prev) =>
                                  prev.map((b) =>
                                    b._key === blog._key
                                      ? { ...b, title: e.target.value }
                                      : b,
                                  ),
                                )
                              }
                              placeholder="Blog title"
                              className="rounded-xl border-border bg-background"
                            />
                            <Input
                              value={blog.url}
                              onChange={(e) =>
                                setTopBlogs((prev) =>
                                  prev.map((b) =>
                                    b._key === blog._key
                                      ? { ...b, url: e.target.value }
                                      : b,
                                  ),
                                )
                              }
                              placeholder="https://..."
                              className="rounded-xl border-border bg-background"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setTopBlogs((prev) =>
                                prev.filter((b) => b._key !== blog._key),
                              )
                            }
                            className="mt-1 rounded-lg p-1.5 text-destructive/60 hover:bg-destructive/10 hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      {topBlogs.length === 0 && (
                        <p className="text-xs text-muted-foreground italic">
                          No blogs added yet.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* People to Follow */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">
                        People to Follow
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setPeopleToFollow((prev) => [
                            ...prev,
                            {
                              _key: newKey(),
                              name: "",
                              twitter: "",
                              designation: "",
                            },
                          ])
                        }
                        className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
                      >
                        <Plus className="h-3 w-3" /> Add
                      </button>
                    </div>
                    <div className="space-y-2">
                      {peopleToFollow.map((person) => (
                        <div
                          key={person._key}
                          className="flex gap-2 items-start rounded-xl border border-border/50 bg-muted/20 p-3"
                        >
                          <div className="flex-1 space-y-2">
                            <Input
                              value={person.name}
                              onChange={(e) =>
                                setPeopleToFollow((prev) =>
                                  prev.map((p) =>
                                    p._key === person._key
                                      ? { ...p, name: e.target.value }
                                      : p,
                                  ),
                                )
                              }
                              placeholder="Name"
                              className="rounded-xl border-border bg-background"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                value={person.designation}
                                onChange={(e) =>
                                  setPeopleToFollow((prev) =>
                                    prev.map((p) =>
                                      p._key === person._key
                                        ? { ...p, designation: e.target.value }
                                        : p,
                                    ),
                                  )
                                }
                                placeholder="Designation"
                                className="rounded-xl border-border bg-background"
                              />
                              <Input
                                value={person.twitter}
                                onChange={(e) =>
                                  setPeopleToFollow((prev) =>
                                    prev.map((p) =>
                                      p._key === person._key
                                        ? { ...p, twitter: e.target.value }
                                        : p,
                                    ),
                                  )
                                }
                                placeholder="@twitter_handle"
                                className="rounded-xl border-border bg-background"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setPeopleToFollow((prev) =>
                                prev.filter((p) => p._key !== person._key),
                              )
                            }
                            className="mt-1 rounded-lg p-1.5 text-destructive/60 hover:bg-destructive/10 hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      {peopleToFollow.length === 0 && (
                        <p className="text-xs text-muted-foreground italic">
                          No people added yet.
                        </p>
                      )}
                    </div>
                  </div>
                </section>
              ) : null}

              {/* Step 3: Team & Schedule */}
              {currentStep === 3 ? (
                <section className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">
                        Leads
                      </p>
                      <MuidSearchInput
                        value={leadMuids}
                        onChange={setLeadMuids}
                        placeholder="Search users by muid…"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">
                        Mentors
                      </p>
                      <MuidSearchInput
                        value={mentorMuids}
                        onChange={setMentorMuids}
                        placeholder="Search users by muid…"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        Office Hours
                      </p>
                      <Input
                        className="rounded-xl border-border bg-background"
                        placeholder="e.g. Mon–Fri 6PM–8PM"
                        {...register("office_hours")}
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        Thinktank URL
                      </p>
                      <Input
                        className="rounded-xl border-border bg-background"
                        placeholder="Link to thinktank"
                        {...register("thinktank")}
                      />
                    </div>
                  </div>
                </section>
              ) : null}

              {/* Step 4: Review */}
              {currentStep === 4 ? (
                <section className="space-y-6">
                  <h3 className="text-base font-semibold text-foreground">
                    Review your interest group
                  </h3>
                  <div className="divide-y divide-border rounded-2xl border border-border bg-card lc-card-shadow">
                    {[
                      ["Name", values.name || "Not set", true],
                      ["Code", values.code || "Not set", true],
                      [
                        "Category",
                        values.category
                          ? values.category.charAt(0).toUpperCase() +
                            values.category.slice(1)
                          : "Not set",
                        true,
                      ],
                      ["Icon URL", values.icon || "Not set", true],
                      [
                        "About",
                        values.about
                          ? values.about.length > 120
                            ? `${values.about.slice(0, 120)}…`
                            : values.about
                          : "Not set",
                        false,
                      ],
                      [
                        "Prerequisites",
                        Array.isArray(values.prerequisites) &&
                        values.prerequisites.length > 0
                          ? values.prerequisites.join(", ")
                          : "Not set",
                        false,
                      ],
                      [
                        "Career Opportunities",
                        Array.isArray(values.career_opportunities) &&
                        values.career_opportunities.length > 0
                          ? values.career_opportunities.join(", ")
                          : "Not set",
                        false,
                      ],
                      ["Resource URL", values.resource || "Not set", false],
                      [
                        "Top Blogs",
                        topBlogs.length > 0
                          ? topBlogs
                              .map((b) => b.title)
                              .filter(Boolean)
                              .join(", ") || `${topBlogs.length} blog(s)`
                          : "Not set",
                        false,
                      ],
                      [
                        "People to Follow",
                        peopleToFollow.length > 0
                          ? peopleToFollow
                              .map((p) => p.name)
                              .filter(Boolean)
                              .join(", ")
                          : "Not set",
                        false,
                      ],
                      [
                        "Leads",
                        leadMuids.length > 0 ? leadMuids.join(", ") : "Not set",
                        false,
                      ],
                      [
                        "Mentors",
                        mentorMuids.length > 0
                          ? mentorMuids.join(", ")
                          : "Not set",
                        false,
                      ],
                      ["Office Hours", values.office_hours || "Not set", false],
                      ["Thinktank URL", values.thinktank || "Not set", false],
                    ].map(([label, value, required]) => (
                      <div
                        key={label as string}
                        className="flex items-start justify-between gap-4 px-4 py-3"
                      >
                        <p className="w-40 shrink-0 text-xs font-medium text-muted-foreground">
                          {label}
                          {required ? (
                            <span className="ml-0.5 text-destructive">*</span>
                          ) : null}
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
              ) : null}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              onClick={requestClose}
            >
              Cancel
            </Button>

            <div className="flex items-center gap-2">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  className="border-border"
                  onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                >
                  Back
                </Button>
              ) : null}

              {currentStep < TOTAL ? (
                <Button
                  type="button"
                  className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleNext}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="button"
                  className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {initialData ? "Save Changes" : "Create IG"}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmCloseOpen}
        onOpenChange={setConfirmCloseOpen}
        title={initialData ? "Discard changes?" : "Discard new interest group?"}
        description="All entered information will be lost."
        confirmLabel="Discard"
        onConfirm={() => {
          setConfirmCloseOpen(false);
          setCurrentStep(1);
          onClose();
        }}
      />
    </>
  );
}
