"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, type Resolver, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  EVENT_FORM_DEFAULT_VALUES,
  EVENT_SCOPE_OPTIONS,
} from "../constants/events.constants";
import {
  buildChangedPatchPayload,
  buildEventPatchPayload,
  eventEditSectionClassName,
  toDatetimeLocal,
  toEventFormData,
  usePatchEvent,
} from "../hooks";
import { type CreateEventSchema, updateEventSchema } from "../schemas";
import type { EventInlineEditFormProps, EventWriteBody } from "../types";
import { EventSearch } from "./event-search";
import { VenueSection } from "./venue-section";

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

    setCoverImageFile(null);
    setBannerImageFile(null);
    setSelectedCampusName(
      event.scope_org?.title ?? event.target_campus?.name ?? "",
    );
    setSelectedIgName(event.scope_ig?.name ?? event.target_ig?.name ?? "");
    setSelectedCampusIgName(event.target_campus_ig?.name ?? "");
  }, [event, reset]);

  const scope = watch("scope");

  const minStartDatetime = useMemo(() => {
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
    const originalStart = event.start_datetime ? new Date(event.start_datetime) : null;
    const limitDate =
      originalStart && originalStart.getTime() < oneHourFromNow.getTime()
        ? originalStart
        : oneHourFromNow;
    return toDatetimeLocal(limitDate.toISOString());
  }, [event.start_datetime]);

  const startDatetimeValue = watch("start_datetime");
  const minEndDatetime = useMemo(() => {
    if (!startDatetimeValue) {
      return minStartDatetime;
    }
    return startDatetimeValue;
  }, [startDatetimeValue, minStartDatetime]);

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

    if (values.start_datetime) {
      const originalStartLocal = toDatetimeLocal(event.start_datetime);
      if (values.start_datetime !== originalStartLocal) {
        const start = new Date(values.start_datetime).getTime();
        const now = Date.now();
        const oneHourInMs = 60 * 60 * 1000;
        if (start < now + oneHourInMs) {
          setError("start_datetime", {
            type: "manual",
            message: "Start time must be at least 1 hour in the future",
          });
          hasRequiredError = true;
        }
      }
    }

    if (values.start_datetime && values.end_datetime) {
      const start = new Date(values.start_datetime).getTime();
      const end = new Date(values.end_datetime).getTime();
      if (end <= start) {
        setError("end_datetime", {
          type: "manual",
          message: "End datetime must be after start datetime",
        });
        hasRequiredError = true;
      }
    }

    if (hasRequiredError) return;

    const { start, end, patchPayload } = buildEventPatchPayload(values);

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

    const changedPayload = buildChangedPatchPayload(patchPayload, event);
    const hasImageChange = Boolean(coverImageFile || bannerImageFile);
    if (Object.keys(changedPayload).length === 0 && !hasImageChange) {
      toast.info("No changes to save");
      return;
    }

    const fd = toEventFormData(
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
      <section className={eventEditSectionClassName()}>
        <h3 className="mb-4 text-base font-semibold tracking-tight text-foreground">
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

      <section className={eventEditSectionClassName()}>
        <h3 className="mb-4 text-base font-semibold tracking-tight text-foreground">
          Type & Scope
        </h3>

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
                    <Button
                      key={item.value}
                      type="button"
                      variant={active ? "default" : "outline"}
                      onClick={() => field.onChange(item.value)}
                    >
                      {item.label}
                    </Button>
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

      <section className={eventEditSectionClassName()}>
        <h3 className="mb-4 text-base font-semibold tracking-tight text-foreground">
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
              min={minStartDatetime}
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
              min={minEndDatetime}
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

      <section className={eventEditSectionClassName()}>
        <h3 className="mb-4 text-base font-semibold tracking-tight text-foreground">
          Media
        </h3>
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

      <section className={eventEditSectionClassName()}>
        <h3 className="mb-4 text-base font-semibold tracking-tight text-foreground">
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

      <section className={eventEditSectionClassName()}>
        <h3 className="mb-4 text-base font-semibold tracking-tight text-foreground">
          Tags
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
                <Button
                  variant="ghost"
                  aria-label={`Remove tag ${tag}`}
                  size="icon"
                  type="button"
                  onClick={() => {
                    const next = (watch("tags") ?? []).filter(
                      (item) => item !== tag,
                    );
                    setValue("tags", next, { shouldDirty: true });
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      </section>

      <div className="hidden">
        <Button type="submit">Save</Button>
        <Button variant="ghost" type="button" onClick={onDiscard}>
          Discard
        </Button>
      </div>
    </form>
  );
}
