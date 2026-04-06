"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Controller, type Resolver, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { MuidSearchInput } from "@/components/ui/muid-search-input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { eventsApi } from "../api";
import {
  EVENT_FORM_DEFAULT_VALUES,
  EVENT_SCOPE_OPTIONS,
  EVENT_TYPE_SELECT_OPTIONS,
} from "../constants/events.constants";
import { toISOWithOffset, useCreateEvent, useOrganizerOptions } from "../hooks";
import { type CreateEventSchema, updateEventSchema } from "../schemas";
import type { OrganizerType } from "../types";
import { EventSearch } from "./event-search";
import { VenueSection } from "./venue-section";

interface EventCreateWizardProps {
  open: boolean;
  onClose: () => void;
}

interface CoOwnerDisplay {
  user_id: string;
  role?: "co_owner" | "admin";
  full_name: string;
  muid: string;
}

interface SelectedOrganiser {
  label: string;
  type: OrganizerType;
  id: string;
}

const STEP_LABELS = [
  "Basic Info",
  "Organiser & Scope",
  "Date & Venue",
  "Media",
  "Registration & Settings",
  "Review",
];

function toFormData(
  payload: Record<string, unknown>,
  coverFile: File | null,
  bannerFile: File | null,
): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value === null || value === undefined) continue;
    if (Array.isArray(value)) {
      fd.append(key, JSON.stringify(value));
    } else if (typeof value === "boolean") {
      fd.append(key, value ? "true" : "false");
    } else if (typeof value === "object") {
      fd.append(key, JSON.stringify(value));
    } else {
      fd.append(key, String(value));
    }
  }
  if (coverFile) fd.append("cover_image", coverFile);
  if (bannerFile) fd.append("banner_image", bannerFile);
  return fd;
}

export function EventCreateWizard({ open, onClose }: EventCreateWizardProps) {
  const createEvent = useCreateEvent();
  const organizerOptionsQuery = useOrganizerOptions();

  const [currentStep, setCurrentStep] = useState(1);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [selectedOrganiserId, setSelectedOrganiserId] = useState("");
  const [selectedCampusName, setSelectedCampusName] = useState("");
  const [selectedIgName, setSelectedIgName] = useState("");
  const [selectedCampusIgName, setSelectedCampusIgName] = useState("");
  const [selectedCoOwners, setSelectedCoOwners] = useState<CoOwnerDisplay[]>(
    [],
  );
  const [tagInput, setTagInput] = useState("");
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);

  const {
    control,
    register,
    setValue,
    watch,
    trigger,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<CreateEventSchema>({
    resolver: zodResolver(updateEventSchema) as Resolver<CreateEventSchema>,
    defaultValues: EVENT_FORM_DEFAULT_VALUES,
  });

  const organizerOptions = useMemo<SelectedOrganiser[]>(() => {
    const data = organizerOptionsQuery.data;
    if (!data) return [];

    const list: SelectedOrganiser[] = [];

    for (const ig of data.can_create_as_ig ?? []) {
      list.push({ label: ig.name, type: "global_ig", id: ig.id });
    }

    for (const campusIg of data.can_create_as_campus_ig ?? []) {
      list.push({ label: campusIg.name, type: "campus_ig", id: campusIg.id });
    }

    for (const campus of data.can_create_as_campus ?? []) {
      list.push({
        label: campus.name ?? campus.title ?? "Campus",
        type: "campus",
        id: campus.id,
      });
    }

    for (const company of data.can_create_as_company ?? []) {
      list.push({
        label: company.name ?? company.title ?? "Company",
        type: "company",
        id: company.id,
      });
    }

    if (data.can_create_as_admin) {
      list.push({ label: "Admin", type: "admin", id: "" });
    }

    return list;
  }, [organizerOptionsQuery.data]);

  const selectedOrganiser = organizerOptions.find(
    (item) => `${item.type}:${item.id}` === selectedOrganiserId,
  );

  const scope = watch("scope");

  const resetWizard = () => {
    reset(EVENT_FORM_DEFAULT_VALUES);
    setCurrentStep(1);
    setCoverImageFile(null);
    setBannerImageFile(null);
    setSelectedOrganiserId("");
    setSelectedCampusName("");
    setSelectedIgName("");
    setSelectedCampusIgName("");
    setSelectedCoOwners([]);
    setTagInput("");
  };

  const requestClose = () => {
    if (isDirty) {
      setConfirmCloseOpen(true);
      return;
    }
    resetWizard();
    onClose();
  };

  const validateCurrentStep = async (): Promise<boolean> => {
    if (currentStep === 1) {
      return trigger(["title", "description"]);
    }

    if (currentStep === 2) {
      if (!selectedOrganiser) {
        setError("title", {
          type: "manual",
          message: "Select an organiser before proceeding",
        });
        return false;
      }

      if (scope === "campus") {
        return trigger(["scope", "target_campus_id"]);
      }
      if (scope === "ig") {
        return trigger(["scope", "target_ig_id"]);
      }
      if (scope === "campus_ig") {
        return trigger(["scope", "target_campus_ig_id"]);
      }
      return trigger(["scope"]);
    }

    if (currentStep === 3) {
      const fields: Array<keyof CreateEventSchema> = [
        "start_datetime",
        "end_datetime",
        "venue_type",
      ];

      const venueType = watch("venue_type");
      if (venueType === "physical") {
        fields.push("address", "city");
      }
      if (venueType === "online") {
        fields.push("online_link", "platform");
      }
      if (venueType === "hybrid") {
        fields.push("address", "city", "online_link", "platform");
      }

      return trigger(fields);
    }

    return true;
  };

  const submitWizard = async (action: "draft" | "publish") => {
    if (!selectedOrganiser) {
      setError("title", {
        type: "manual",
        message: "Select an organiser before saving",
      });
      return;
    }

    const values = watch();
    const start = toISOWithOffset(values.start_datetime);
    const end = toISOWithOffset(values.end_datetime);
    const deadline = values.registration_deadline
      ? toISOWithOffset(values.registration_deadline as unknown as string)
      : null;

    if (!start || !end) {
      toast.error("Please provide valid start and end date/time");
      return;
    }

    const payload = {
      title: values.title,
      description: values.description,
      event_type: values.event_type,
      start_datetime: start,
      end_datetime: end,
      registration_url: values.registration_url,
      registration_deadline: deadline,
      min_karma: values.min_karma,
      venue_type: values.venue_type,
      venue_address: values.address,
      venue_city: values.city,
      venue_maps_url: values.maps_url,
      venue_online_link: values.online_link,
      venue_platform: values.platform,
      scope: values.scope,
      scope_org: values.scope === "campus" ? values.target_campus_id : null,
      scope_ig: values.scope === "ig" ? values.target_ig_id : null,
      scope_ci_id:
        values.scope === "campus_ig" ? values.target_campus_ig_id : null,
      organiser_type: selectedOrganiser.type,
      organiser_ig:
        selectedOrganiser.type === "global_ig" ? selectedOrganiser.id : null,
      organiser_org:
        selectedOrganiser.type === "campus" ||
        selectedOrganiser.type === "company"
          ? selectedOrganiser.id
          : null,
      organiser_ci_id:
        selectedOrganiser.type === "campus_ig" ? selectedOrganiser.id : null,
      co_owners: selectedCoOwners.map(({ user_id, role }) => ({
        user_id,
        role,
      })),
      is_collaboration: values.is_collaboration,
      is_featured: values.is_featured,
      tags: values.tags && values.tags.length > 0 ? values.tags : null,
    };

    const fd = toFormData(payload, coverImageFile, bannerImageFile);
    const created = await createEvent.mutateAsync(fd as never);

    if (action === "publish") {
      await eventsApi.publish(created.id);
    }

    toast.success(
      action === "publish" ? "Event published" : "Event saved as draft",
    );
    resetWizard();
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => (!next ? requestClose() : null)}
      >
        <DialogContent className="flex h-[100dvh] w-full max-w-4xl flex-col overflow-hidden rounded-none sm:h-[90vh] sm:rounded-2xl">
          <DialogHeader className="pb-2">
            <DialogTitle>Create Event</DialogTitle>
          </DialogHeader>

          <div className="hidden items-start gap-3 px-1 pb-2 sm:flex">
            {STEP_LABELS.map((label, index) => {
              const stepIndex = index + 1;
              const isActive = stepIndex === currentStep;
              const isCompleted = stepIndex < currentStep;

              return (
                <div key={label} className="flex flex-1 items-start gap-2">
                  <button
                    type="button"
                    disabled={!isCompleted}
                    onClick={() => isCompleted && setCurrentStep(stepIndex)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${
                      isActive || isCompleted
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : stepIndex}
                  </button>
                  <div className="min-w-0 pt-1">
                    <p
                      className={`text-xs ${isActive ? "font-medium text-primary" : "text-muted-foreground"}`}
                    >
                      {label}
                    </p>
                    {index < STEP_LABELS.length - 1 ? (
                      <div
                        className={`mt-2 h-0.5 w-full ${isCompleted ? "bg-primary" : "bg-border"}`}
                      />
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-1 pb-2 sm:hidden">
            <p className="text-sm font-medium text-foreground">
              Step {currentStep} of {STEP_LABELS.length} -{" "}
              {STEP_LABELS[currentStep - 1]}
            </p>
            <div className="mt-2 h-1 w-full rounded-full bg-border">
              <div
                className="h-1 rounded-full bg-primary transition-all"
                style={{
                  width: `${(currentStep / STEP_LABELS.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {currentStep === 1 ? (
              <section className="space-y-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    Title <span className="text-destructive">*</span>
                  </p>
                  <Input
                    className="rounded-xl border-border bg-background"
                    {...register("title")}
                  />
                  {errors.title?.message ? (
                    <p className="text-xs text-destructive">
                      {errors.title.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    Description <span className="text-destructive">*</span>
                  </p>
                  <Textarea
                    className="rounded-xl border-border bg-background"
                    {...register("description")}
                  />
                  {errors.description?.message ? (
                    <p className="text-xs text-destructive">
                      {errors.description.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Event type
                  </p>
                  <Controller
                    control={control}
                    name="event_type"
                    render={({ field }) => (
                      <div className="flex flex-wrap gap-2">
                        {EVENT_TYPE_SELECT_OPTIONS.map((item) => {
                          const active = field.value === item.value;
                          return (
                            <button
                              key={item.value}
                              type="button"
                              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                                active
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-background text-muted-foreground hover:border-primary hover:text-primary"
                              }`}
                              onClick={() => field.onChange(item.value)}
                            >
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Tags</p>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const normalized = tagInput
                          .trim()
                          .toLowerCase()
                          .replace(/\s+/g, "-");
                        if (!normalized) return;
                        const current = watch("tags") ?? [];
                        if (current.includes(normalized)) {
                          setTagInput("");
                          return;
                        }
                        setValue("tags", [...current, normalized], {
                          shouldDirty: true,
                        });
                        setTagInput("");
                      }}
                    >
                      <Plus className="mr-1 h-4 w-4" /> Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(watch("tags") ?? []).map((tag) => (
                      <Badge key={tag} variant="outline" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => {
                            const next = (watch("tags") ?? []).filter(
                              (value) => value !== tag,
                            );
                            setValue("tags", next, { shouldDirty: true });
                          }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}

            {currentStep === 2 ? (
              <section className="space-y-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Organiser <span className="text-destructive">*</span>
                  </p>
                  {organizerOptionsQuery.isLoading ? (
                    <div className="h-10 animate-pulse rounded-xl bg-muted" />
                  ) : organizerOptions.length === 1 ? (
                    <div className="rounded-xl border border-border bg-muted px-3 py-2 text-sm">
                      {organizerOptions[0].label}
                    </div>
                  ) : (
                    <select
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
                      value={selectedOrganiserId}
                      onChange={(e) => setSelectedOrganiserId(e.target.value)}
                    >
                      <option value="">Select organiser</option>
                      {organizerOptions.map((item) => (
                        <option
                          key={`${item.type}:${item.id}`}
                          value={`${item.type}:${item.id}`}
                        >
                          {item.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Scope <span className="text-destructive">*</span>
                  </p>
                  <Controller
                    control={control}
                    name="scope"
                    render={({ field }) => (
                      <div className="flex flex-wrap gap-2">
                        {EVENT_SCOPE_OPTIONS.map((item) => {
                          const active = field.value === item.value;
                          return (
                            <button
                              key={item.value}
                              type="button"
                              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                                active
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-background text-muted-foreground hover:border-primary hover:text-primary"
                              }`}
                              onClick={() => field.onChange(item.value)}
                            >
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  />
                </div>

                {scope === "campus" ? (
                  <EventSearch
                    mode="select"
                    type="campus"
                    value={watch("target_campus_id") ?? null}
                    selectedName={selectedCampusName}
                    placeholder="Search campus"
                    onChange={(id, name) => {
                      setValue("target_campus_id", id || null, {
                        shouldValidate: true,
                      });
                      setSelectedCampusName(name);
                    }}
                  />
                ) : null}

                {scope === "ig" ? (
                  <EventSearch
                    mode="select"
                    type="ig"
                    value={watch("target_ig_id") ?? null}
                    selectedName={selectedIgName}
                    placeholder="Search IG"
                    onChange={(id, name) => {
                      setValue("target_ig_id", id || null, {
                        shouldValidate: true,
                      });
                      setSelectedIgName(name);
                    }}
                  />
                ) : null}

                {scope === "campus_ig" ? (
                  <EventSearch
                    mode="select"
                    type="campus_ig"
                    value={watch("target_campus_ig_id") ?? null}
                    selectedName={selectedCampusIgName}
                    placeholder="Search campus IG"
                    onChange={(id, name) => {
                      setValue("target_campus_ig_id", id || null, {
                        shouldValidate: true,
                      });
                      setSelectedCampusIgName(name);
                    }}
                  />
                ) : null}

                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Co-owners
                  </p>
                  <MuidSearchInput
                    placeholder="Search by name or muid"
                    onSelectUser={(user) => {
                      if (!user.id) return;
                      setSelectedCoOwners((previous) => {
                        if (previous.some((item) => item.user_id === user.id))
                          return previous;
                        return [
                          ...previous,
                          {
                            user_id: user.id,
                            role: "co_owner",
                            full_name: user.full_name,
                            muid: user.muid,
                          },
                        ];
                      });
                    }}
                  />
                  <div className="flex flex-wrap gap-2">
                    {selectedCoOwners.map((owner) => (
                      <Badge
                        key={owner.user_id}
                        variant="secondary"
                        className="gap-1"
                      >
                        {owner.full_name} ({owner.muid})
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedCoOwners((previous) =>
                              previous.filter(
                                (item) => item.user_id !== owner.user_id,
                              ),
                            )
                          }
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}

            {currentStep === 3 ? (
              <section className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      Start datetime <span className="text-destructive">*</span>
                    </p>
                    <Input
                      type="datetime-local"
                      {...register("start_datetime")}
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      End datetime <span className="text-destructive">*</span>
                    </p>
                    <Input
                      type="datetime-local"
                      {...register("end_datetime")}
                    />
                  </div>
                </div>

                <VenueSection control={control} watch={watch} errors={errors} />
              </section>
            ) : null}

            {currentStep === 4 ? (
              <section className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      Cover image
                    </p>
                    <ImageUpload
                      value={coverImageFile}
                      onChange={setCoverImageFile}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      Banner image
                    </p>
                    <ImageUpload
                      value={bannerImageFile}
                      onChange={setBannerImageFile}
                    />
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-muted p-4 text-sm text-muted-foreground">
                  You can add or change images at any time after creating the
                  event.
                </div>
              </section>
            ) : null}

            {currentStep === 5 ? (
              <section className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1 md:col-span-2">
                    <p className="text-sm font-medium text-foreground">
                      Registration URL
                    </p>
                    <Input {...register("registration_url")} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      Registration deadline
                    </p>
                    <Input
                      type="datetime-local"
                      {...register("registration_deadline")}
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      Minimum karma
                    </p>
                    <Controller
                      control={control}
                      name="min_karma"
                      render={({ field }) => (
                        <Input
                          type="number"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const raw = e.target.value;
                            field.onChange(raw === "" ? null : Number(raw));
                          }}
                        />
                      )}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-border p-3">
                    <p className="text-sm text-foreground">
                      Enable collaboration
                    </p>
                    <Controller
                      control={control}
                      name="is_collaboration"
                      render={({ field }) => (
                        <Switch
                          checked={Boolean(field.value)}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-border p-3">
                    <p className="text-sm text-foreground">Featured event</p>
                    <Controller
                      control={control}
                      name="is_featured"
                      render={({ field }) => (
                        <Switch
                          checked={Boolean(field.value)}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                </div>

                {watch("is_collaboration") ? (
                  <div className="rounded-xl border border-border bg-muted p-3 text-sm text-muted-foreground">
                    You can invite collaborators after creating the event from
                    the manage screen.
                  </div>
                ) : null}
              </section>
            ) : null}

            {currentStep === 6 ? (
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-foreground">
                  Review your event
                </h3>
                <div className="rounded-2xl border border-border bg-card lc-card-shadow divide-y divide-border">
                  {[
                    ["Title", watch("title") || "Not set"],
                    [
                      "Description",
                      watch("description")
                        ? `${watch("description").slice(0, 100)}${watch("description").length > 100 ? "..." : ""}`
                        : "Not set",
                    ],
                    ["Event Type", watch("event_type") || "Not set"],
                    ["Organizer", selectedOrganiser?.label || "Not set"],
                    ["Scope", watch("scope") || "Not set"],
                    ["Start", watch("start_datetime") || "Not set"],
                    ["End", watch("end_datetime") || "Not set"],
                    ["Venue", watch("venue_type") || "Not set"],
                    ["Tags", (watch("tags") ?? []).join(", ") || "Not set"],
                    ["Collaboration", watch("is_collaboration") ? "Yes" : "No"],
                    ["Featured", watch("is_featured") ? "Yes" : "No"],
                    ["Min karma", watch("min_karma") ?? "Not set"],
                    [
                      "Registration URL",
                      watch("registration_url") || "Not set",
                    ],
                  ].map(([label, value]) => (
                    <div
                      key={String(label)}
                      className="flex items-start justify-between gap-4 px-4 py-3"
                    >
                      <p className="w-28 shrink-0 text-xs uppercase tracking-wide text-muted-foreground">
                        {label}
                      </p>
                      <p
                        className={`text-right text-sm ${value === "Not set" ? "italic text-muted-foreground" : "text-foreground"}`}
                      >
                        {String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <div className="flex items-center justify-between border-t border-border bg-card/80 p-4 backdrop-blur-sm">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              onClick={requestClose}
            >
              Cancel
            </Button>

            <div className="flex items-center gap-2">
              {currentStep > 1 ? (
                <Button
                  variant="outline"
                  className="border-border"
                  onClick={() =>
                    setCurrentStep((value) => Math.max(1, value - 1))
                  }
                >
                  Back
                </Button>
              ) : null}

              {currentStep < 6 ? (
                <Button
                  className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={async () => {
                    const ok = await validateCurrentStep();
                    if (!ok) return;
                    setCurrentStep((value) => Math.min(6, value + 1));
                  }}
                >
                  Next
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="border-border"
                    disabled={createEvent.isPending}
                    onClick={() => submitWizard("draft")}
                  >
                    {createEvent.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Save as Draft
                  </Button>
                  <Button
                    className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={createEvent.isPending}
                    onClick={() => submitWizard("publish")}
                  >
                    {createEvent.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Save and Publish
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmCloseOpen}
        onOpenChange={setConfirmCloseOpen}
        title="Discard new event?"
        description="All entered information will be lost."
        confirmLabel="Discard"
        onConfirm={() => {
          setConfirmCloseOpen(false);
          resetWizard();
          onClose();
        }}
      />
    </>
  );
}
