"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Lock, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, type Resolver, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  EVENT_BANNER_IMAGE_ASPECT,
  EVENT_BANNER_IMAGE_MOBILE_PREVIEW_ASPECT,
  EVENT_COVER_IMAGE_ASPECT,
  EVENT_FORM_DEFAULT_VALUES,
  EVENT_SCOPE_OPTIONS,
} from "../constants/events.constants";
import {
  buildChangedPatchPayload,
  buildEventPatchPayload,
  eventEditSectionClassName,
  toDatetimeLocal,
  toEventFormData,
  useEventCategories,
  useEventTypeScope,
  useIGClusters,
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

  const { data: clusterOptions, isLoading: clustersLoading } = useIGClusters();
  const { data: categoryOptions, isLoading: categoriesLoading } =
    useEventCategories();
  const { data: typeScopeData, isLoading: typeScopeLoading } =
    useEventTypeScope();

  const eventTypeSelectOptions = useMemo(
    () => typeScopeData?.event_type ?? [],
    [typeScopeData],
  );

  const {
    control,
    register,
    reset,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
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

    // category_id/event_scope/event_type come straight off the API response.
    // No inference/fuzzy-matching fallback.
    const resolvedCategory =
      event.category_id &&
      categoryOptions?.some((c) => c.id === event.category_id)
        ? event.category_id
        : "";

    const resolvedEventScope =
      event.event_scope &&
      clusterOptions?.some(
        (item) => item.value.toLowerCase() === event.event_scope?.toLowerCase(),
      )
        ? event.event_scope.toLowerCase()
        : "";

    reset({
      ...EVENT_FORM_DEFAULT_VALUES,
      title: event.title ?? "",
      description: event.description ?? "",
      scope,
      category: resolvedCategory,
      event_type: event.event_type ?? "",
      event_scope: resolvedEventScope,
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
  }, [event, reset, categoryOptions, clusterOptions]);

  const scope = watch("scope");
  const startDatetimeValue = watch("start_datetime");
  const minEndDatetime = startDatetimeValue || undefined;

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
    return "µLearn";
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
    if (!values.event_scope) {
      setError("event_scope", {
        type: "manual",
        message: "Please select a cluster",
      });
      hasRequiredError = true;
    }
    // event_type is the required field; category is a nullable FK the API
    // declares optional, and its lookup table has no event rows.
    if (!values.event_type) {
      setError("event_type", {
        type: "manual",
        message: "Please select an event type",
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
            maxLength={5000}
            className="rounded-xl border-border bg-background text-foreground"
            {...register("description")}
          />
          {errors.description?.message ? (
            <p className="mt-1 text-xs text-destructive">
              {errors.description.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Event Cluster / Category{" "}
              <span className="text-destructive">*</span>
            </p>
            <Controller
              control={control}
              name="event_scope"
              render={({ field }) => {
                const currentCluster = (clusterOptions ?? []).find(
                  (item) => item.value === field.value,
                );

                return (
                  <div className="w-full">
                    {clustersLoading ? (
                      <div className="h-10 w-full animate-pulse rounded-xl bg-muted" />
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-between rounded-xl"
                          >
                            <span>
                              {currentCluster?.label ?? "Select cluster"}
                            </span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full max-w-sm p-1">
                          {(clusterOptions ?? [])
                            .filter((item) => item.value !== "all")
                            .map((item) => {
                              const isSelected = field.value === item.value;
                              return (
                                <DropdownMenuItem
                                  key={item.value}
                                  onSelect={() => field.onChange(item.value)}
                                  className="flex items-center justify-between rounded-md px-3 py-2"
                                >
                                  <span>{item.label}</span>
                                  {isSelected ? (
                                    <Check className="h-4 w-4 text-primary" />
                                  ) : null}
                                </DropdownMenuItem>
                              );
                            })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                );
              }}
            />
            {errors.event_scope?.message ? (
              <p className="text-xs text-destructive">
                {errors.event_scope.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Event Type <span className="text-destructive">*</span>
            </p>
            <Controller
              control={control}
              name="category"
              render={() => {
                const eventTypeValue = watch("event_type");
                const selectedType =
                  eventTypeSelectOptions.find(
                    (item) => item.value === eventTypeValue,
                  ) ??
                  eventTypeSelectOptions.find(
                    (item) => item.value === "others",
                  );

                const isLoadingOptions = categoriesLoading || typeScopeLoading;

                return (
                  <div className="w-full">
                    {isLoadingOptions ? (
                      <div className="h-10 w-full animate-pulse rounded-xl bg-muted" />
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-between rounded-xl animate-fade-in"
                          >
                            <span>
                              {selectedType?.label ?? "Select event type"}
                            </span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full max-w-sm p-1">
                          {eventTypeSelectOptions.map((item) => {
                            const isSelected =
                              selectedType?.value === item.value;
                            return (
                              <DropdownMenuItem
                                key={item.value}
                                onSelect={() => {
                                  const matchingCat =
                                    (categoryOptions ?? []).find((c) => {
                                      if (typeof c.name !== "string")
                                        return false;
                                      const catSlug = c.name
                                        .trim()
                                        .toLowerCase()
                                        .replace(/\s+/g, "_");
                                      return catSlug === item.value;
                                    }) ||
                                    (categoryOptions ?? []).find((c) => {
                                      if (typeof c.name !== "string")
                                        return false;
                                      const catSlug = c.name
                                        .trim()
                                        .toLowerCase()
                                        .replace(/\s+/g, "_");
                                      return (
                                        catSlug === "others" ||
                                        catSlug === "other"
                                      );
                                    }) ||
                                    categoryOptions?.[0];

                                  if (matchingCat) {
                                    setValue("category", matchingCat.id, {
                                      shouldValidate: true,
                                    });
                                  } else {
                                    clearErrors("category");
                                  }
                                  setValue("event_type", item.value, {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                  });
                                }}
                                className="flex items-center justify-between rounded-md px-3 py-2"
                              >
                                <span>{item.label}</span>
                                {isSelected ? (
                                  <Check className="h-4 w-4 text-primary" />
                                ) : null}
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                );
              }}
            />
            {errors.category?.message ? (
              <p className="text-xs text-destructive">
                {errors.category.message}
              </p>
            ) : null}
          </div>
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
            campusId={event.scope_org?.id ?? null}
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
              aspectRatio={EVENT_COVER_IMAGE_ASPECT}
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Banner image</p>
            <ImageUpload
              value={bannerImageFile}
              onChange={setBannerImageFile}
              currentUrl={event.banner_image}
              aspectRatio={EVENT_BANNER_IMAGE_ASPECT}
              previewAspect={EVENT_BANNER_IMAGE_MOBILE_PREVIEW_ASPECT}
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
              maxLength={30}
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
                  className="h-5 w-5 text-foreground hover:text-destructive"
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
