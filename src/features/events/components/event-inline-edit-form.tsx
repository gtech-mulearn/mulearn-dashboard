"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, type Resolver, useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { MuidSearchInput } from "@/components/ui/muid-search-input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  EVENT_FORM_DEFAULT_VALUES,
  EVENT_SCOPE_OPTIONS,
  EVENT_TYPE_SELECT_OPTIONS,
} from "../constants/events.constants";
import {
  resolveEventTypeValue,
  toDatetimeLocal,
  toISOWithOffset,
  usePatchEvent,
} from "../hooks";
import { type CreateEventSchema, updateEventSchema } from "../schemas";
import type {
  EventDetailManage,
  EventPatchBody,
  EventWriteBody,
} from "../types";
import { EventSearch } from "./event-search";
import { VenueSection } from "./venue-section";

interface EventInlineEditFormProps {
  event: EventDetailManage;
  onSave: () => void;
  onDiscard: () => void;
  onDirtyChange: (isDirty: boolean) => void;
}

type ComparablePatchPayload = Partial<EventPatchBody>;

interface CoOwnerDisplay {
  user_id: string;
  role?: "co_owner" | "admin";
  full_name: string;
  muid: string;
}

function sectionClassName() {
  return "space-y-4 rounded-2xl border border-border bg-card p-6 lc-card-shadow";
}

function normalizeTags(
  tags: string[] | Record<string, unknown> | null | undefined,
): string[] | null {
  if (!tags) return null;
  if (Array.isArray(tags)) {
    return tags.length > 0 ? [...tags].sort() : null;
  }
  const keys = Object.keys(tags);
  return keys.length > 0 ? keys.sort() : null;
}

function normalizeDateValue(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function valuesAreEqual(left: unknown, right: unknown): boolean {
  if (left === right) return true;

  const leftDate = normalizeDateValue(left);
  const rightDate = normalizeDateValue(right);
  if (leftDate !== null && rightDate !== null) {
    return leftDate === rightDate;
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    return JSON.stringify(left) === JSON.stringify(right);
  }

  if (left && right && typeof left === "object" && typeof right === "object") {
    return JSON.stringify(left) === JSON.stringify(right);
  }

  return false;
}

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

export function EventInlineEditForm({
  event,
  onSave,
  onDiscard,
  onDirtyChange,
}: EventInlineEditFormProps) {
  const patchEvent = usePatchEvent(event.id);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [selectedCampusName, setSelectedCampusName] = useState("");
  const [selectedIgName, setSelectedIgName] = useState("");
  const [selectedCampusIgName, setSelectedCampusIgName] = useState("");
  const [selectedCoOwners, setSelectedCoOwners] = useState<CoOwnerDisplay[]>(
    [],
  );
  const [tagInput, setTagInput] = useState("");

  const {
    control,
    register,
    reset,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isDirty },
  } = useForm<CreateEventSchema>({
    resolver: zodResolver(updateEventSchema) as Resolver<CreateEventSchema>,
    defaultValues: EVENT_FORM_DEFAULT_VALUES,
  });

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    const validScopes: Array<"global" | "campus" | "ig" | "campus_ig"> = [
      "global",
      "campus",
      "ig",
      "campus_ig",
    ];
    const scope = (
      event.scope && (validScopes as string[]).includes(event.scope)
        ? event.scope
        : "global"
    ) as "global" | "campus" | "ig" | "campus_ig";

    reset({
      ...EVENT_FORM_DEFAULT_VALUES,
      title: event.title ?? "",
      description: event.description ?? "",
      event_type: resolveEventTypeValue(event.event_type, event.category_name),
      scope,
      start_datetime: toDatetimeLocal(event.start_datetime),
      end_datetime: toDatetimeLocal(event.end_datetime),
      venue_type: event.venue?.type ?? "online",
      address: event.venue?.address ?? "",
      city: event.venue?.city ?? "",
      maps_url: event.venue?.maps_url ?? "",
      online_link: event.venue?.online_link ?? "",
      platform: event.venue?.platform ?? "",
      cover_image: event.cover_image ?? "",
      banner_image: event.banner_image ?? "",
      registration_url: event.registration_url ?? "",
      registration_deadline:
        toDatetimeLocal(event.registration_deadline ?? "") || "",
      min_karma: event.min_karma ?? null,
      target_campus_id: event.scope_org?.id ?? null,
      target_ig_id: event.scope_ig?.id ?? null,
      target_campus_ig_id: event.scope_ci_id ?? null,
      tags: event.tags
        ? Array.isArray(event.tags)
          ? event.tags
          : Object.keys(event.tags)
        : [],
      is_collaboration: event.is_collaboration ?? false,
      is_featured: event.is_featured ?? false,
    });

    setSelectedCoOwners(
      event.co_owners?.map((owner) => ({
        user_id: owner.user.id,
        role: owner.role ?? "co_owner",
        full_name: owner.user.full_name,
        muid: owner.user.muid,
      })) ?? [],
    );

    setCoverImageFile(null);
    setBannerImageFile(null);
    setSelectedCampusName(
      event.scope_org?.title ?? event.target_campus?.name ?? "",
    );
    setSelectedIgName(event.scope_ig?.name ?? event.target_ig?.name ?? "");
    setSelectedCampusIgName(event.target_campus_ig?.name ?? "");
  }, [event, reset]);

  const scope = watch("scope");

  const organizerName = useMemo(() => {
    if (event.organizer.type === "global_ig")
      return event.organizer.ig?.name ?? "Global IG";
    if (event.organizer.type === "campus_ig")
      return event.organizer.campus_ig?.name ?? "Campus IG";
    if (event.organizer.type === "campus")
      return (
        event.organizer.campus?.title ??
        event.organizer.campus?.name ??
        "Campus"
      );
    if (event.organizer.type === "company")
      return (
        event.organizer.company?.title ??
        event.organizer.company?.name ??
        "Company"
      );
    return "MuLearn";
  }, [event.organizer]);

  const buildComparableInitialPayload = (
    currentEvent: EventDetailManage,
  ): ComparablePatchPayload => {
    const organizer = currentEvent.organizer;
    const organizerType = organizer?.type ?? "admin";

    return {
      title: currentEvent.title,
      description: currentEvent.description,
      start_datetime: currentEvent.start_datetime,
      end_datetime: currentEvent.end_datetime,
      registration_url: currentEvent.registration_url,
      registration_deadline: currentEvent.registration_deadline,
      min_karma: currentEvent.min_karma,
      venue_type: currentEvent.venue.type,
      venue_address: currentEvent.venue.address,
      venue_city: currentEvent.venue.city,
      venue_maps_url: currentEvent.venue.maps_url,
      venue_online_link: currentEvent.venue.online_link,
      venue_platform: currentEvent.venue.platform,
      scope: currentEvent.scope,
      scope_org:
        currentEvent.scope === "campus"
          ? (currentEvent.scope_org?.id ?? null)
          : null,
      scope_ig:
        currentEvent.scope === "ig"
          ? (currentEvent.scope_ig?.id ?? null)
          : null,
      scope_ci_id:
        currentEvent.scope === "campus_ig"
          ? (currentEvent.scope_ci_id ?? null)
          : null,
      is_collaboration: currentEvent.is_collaboration,
      is_featured: currentEvent.is_featured,
      tags: normalizeTags(currentEvent.tags),
      organiser_type: organizerType,
      organiser_ig:
        organizerType === "global_ig" ? (organizer?.ig?.id ?? null) : null,
      organiser_org:
        organizerType === "campus"
          ? (organizer?.campus?.id ?? null)
          : organizerType === "company"
            ? (organizer?.company?.id ?? null)
            : null,
      organiser_ci_id:
        organizerType === "campus_ig"
          ? ((organizer?.campus_ig?.id ?? organizer?.campus_ig_id ?? null) as
              | string
              | null)
          : null,
      event_type: resolveEventTypeValue(
        currentEvent.event_type,
        currentEvent.category_name,
      ),
      co_owners: (currentEvent.co_owners ?? [])
        .map((owner) => ({
          user_id: owner.user.id,
          role: owner.role ?? "co_owner",
        }))
        .sort((a, b) => a.user_id.localeCompare(b.user_id)),
    } as ComparablePatchPayload;
  };

  const buildChangedPatchPayload = (
    nextPayload: ComparablePatchPayload,
    currentEvent: EventDetailManage,
  ): EventPatchBody => {
    const previousPayload = buildComparableInitialPayload(currentEvent);
    const changedPayload: Record<string, unknown> = {};

    for (const [key, nextValue] of Object.entries(nextPayload)) {
      const previousValue =
        previousPayload[key as keyof ComparablePatchPayload];
      if (!valuesAreEqual(nextValue, previousValue)) {
        changedPayload[key] = nextValue;
      }
    }

    return changedPayload as EventPatchBody;
  };

  const handleValidSubmit = async (values: CreateEventSchema) => {
    let hasRequiredError = false;

    if (!values.title?.trim()) {
      setError("title", { type: "manual", message: "Title is required" });
      hasRequiredError = true;
    }
    if (!values.description?.trim()) {
      setError("description", {
        type: "manual",
        message: "Description is required",
      });
      hasRequiredError = true;
    }
    if (!values.start_datetime) {
      setError("start_datetime", {
        type: "manual",
        message: "Start datetime is required",
      });
      hasRequiredError = true;
    }
    if (!values.end_datetime) {
      setError("end_datetime", {
        type: "manual",
        message: "End datetime is required",
      });
      hasRequiredError = true;
    }
    if (!values.venue_type) {
      setError("venue_type", {
        type: "manual",
        message: "Venue type is required",
      });
      hasRequiredError = true;
    }

    if (hasRequiredError) return;

    const start = toISOWithOffset(values.start_datetime);
    const end = toISOWithOffset(values.end_datetime);
    const deadline = values.registration_deadline
      ? toISOWithOffset(values.registration_deadline as unknown as string)
      : null;

    if (!start || !end) {
      if (!start) {
        setError("start_datetime", {
          type: "manual",
          message: "Invalid date format",
        });
      }
      if (!end) {
        setError("end_datetime", {
          type: "manual",
          message: "Invalid date format",
        });
      }
      return;
    }

    const patchPayload: ComparablePatchPayload = {
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
      is_collaboration: values.is_collaboration,
      is_featured: values.is_featured,
      tags: values.tags && values.tags.length > 0 ? values.tags : null,
      co_owners: selectedCoOwners.map(({ user_id, role }) => ({
        user_id,
        role,
      })),
    };

    const changedPayload = buildChangedPatchPayload(patchPayload, event);
    const hasImageChange = Boolean(coverImageFile || bannerImageFile);
    if (Object.keys(changedPayload).length === 0 && !hasImageChange) {
      onSave();
      return;
    }

    const fd = toFormData(
      changedPayload as Record<string, unknown>,
      coverImageFile,
      bannerImageFile,
    );

    await patchEvent.mutateAsync(fd as unknown as EventWriteBody);
    onSave();
  };

  return (
    <form
      id={`event-inline-edit-form-${event.id}`}
      className="space-y-4"
      onSubmit={handleSubmit(handleValidSubmit)}
    >
      <section className={sectionClassName()}>
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Basic Info
        </h3>
        <div className="space-y-1">
          <label
            htmlFor="inline_title"
            className="text-sm font-medium text-foreground"
          >
            Title <span className="text-destructive">*</span>
          </label>
          <Input
            id="inline_title"
            className="rounded-xl border-border bg-background text-foreground"
            {...register("title")}
          />
          {errors.title?.message ? (
            <p className="mt-1 text-xs text-destructive">
              {errors.title.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-1">
          <label
            htmlFor="inline_description"
            className="text-sm font-medium text-foreground"
          >
            Description <span className="text-destructive">*</span>
          </label>
          <Textarea
            id="inline_description"
            className="rounded-xl border-border bg-background text-foreground"
            {...register("description")}
          />
          {errors.description?.message ? (
            <p className="mt-1 text-xs text-destructive">
              {errors.description.message}
            </p>
          ) : null}
        </div>
      </section>

      <section className={sectionClassName()}>
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Type & Scope
        </h3>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Event Type</p>
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
          <p className="text-sm font-medium text-foreground">Scope</p>
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

        <div className="rounded-xl border border-border bg-muted px-3 py-2 text-sm text-foreground">
          <span className="inline-flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            Organiser: {organizerName}
          </span>
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
              setValue("target_ig_id", id || null, { shouldValidate: true });
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
      </section>

      <section className={sectionClassName()}>
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Date & Time
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Start datetime <span className="text-destructive">*</span>
            </p>
            <Input
              className="rounded-xl border-border bg-background text-foreground"
              type="datetime-local"
              {...register("start_datetime")}
            />
            {errors.start_datetime?.message ? (
              <p className="mt-1 text-xs text-destructive">
                {errors.start_datetime.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              End datetime <span className="text-destructive">*</span>
            </p>
            <Input
              className="rounded-xl border-border bg-background text-foreground"
              type="datetime-local"
              {...register("end_datetime")}
            />
            {errors.end_datetime?.message ? (
              <p className="mt-1 text-xs text-destructive">
                {errors.end_datetime.message}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <VenueSection control={control} watch={watch} errors={errors} />

      <section className={sectionClassName()}>
        <h3 className="mb-4 text-sm font-semibold text-foreground">Media</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Cover image</p>
            <ImageUpload
              value={coverImageFile}
              onChange={setCoverImageFile}
              currentUrl={event.cover_image}
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Banner image</p>
            <ImageUpload
              value={bannerImageFile}
              onChange={setBannerImageFile}
              currentUrl={event.banner_image}
            />
          </div>
        </div>
      </section>

      <section className={sectionClassName()}>
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Registration & Settings
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1 md:col-span-2">
            <p className="text-sm font-medium text-foreground">
              Registration URL
            </p>
            <Input
              className="rounded-xl border-border bg-background text-foreground"
              {...register("registration_url")}
            />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Registration deadline
            </p>
            <Input
              className="rounded-xl border-border bg-background text-foreground"
              type="datetime-local"
              {...register("registration_deadline")}
            />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Minimum karma</p>
            <Controller
              control={control}
              name="min_karma"
              render={({ field }) => (
                <Input
                  type="number"
                  className="rounded-xl border-border bg-background text-foreground"
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
            <p className="text-sm text-foreground">Allow collaboration</p>
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
      </section>

      <section className={sectionClassName()}>
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Tags & Co-owners
        </h3>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Tags</p>
          <div className="flex gap-2">
            <Input
              className="rounded-xl border-border bg-background text-foreground"
              value={tagInput}
              placeholder="Add a tag"
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
                      (item) => item !== tag,
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

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Co-owners</p>
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
              <Badge key={owner.user_id} variant="secondary" className="gap-1">
                {owner.full_name} ({owner.muid})
                <button
                  type="button"
                  onClick={() =>
                    setSelectedCoOwners((previous) =>
                      previous.filter((item) => item.user_id !== owner.user_id),
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

      <div className="hidden">
        <button type="submit">Save</button>
        <button type="button" onClick={onDiscard}>
          Discard
        </button>
      </div>
    </form>
  );
}
