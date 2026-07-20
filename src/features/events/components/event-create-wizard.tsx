"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Check, Loader2, Plus, X } from "lucide-react";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
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
import { getApiResponseError } from "@/hooks/use-get-error";
import { usePermissions } from "@/hooks/use-permissions";
import { eventsApi } from "../api";
import {
  EVENT_CREATE_WIZARD_STEPS,
  EVENT_FORM_DEFAULT_VALUES,
  EVENT_SCOPE_OPTIONS,
} from "../constants/events.constants";
import {
  toEventFormData,
  toISOWithOffset,
  useCreateEvent,
  useEventCategories,
  useEventTypeScope,
  useIGClusters,
  useOrganizerOptions,
} from "../hooks";
import { getAllowedScopes } from "../lib/events.policy";
import { type CreateEventSchema, createEventSchema } from "../schemas";
import type {
  EventCreateWizardProps,
  EventScope,
  SelectedOrganiser,
} from "../types";
import { EventSearch } from "./event-search";
import { VenueSection } from "./venue-section";

const MAX_WIZARD_UPLOAD_BYTES = 900 * 1024;
const MAX_SINGLE_IMAGE_BYTES = 450 * 1024;
const MAX_IMAGE_DIMENSION = 1600;

function formatReviewEnum(value: unknown): string {
  if (typeof value !== "string") return "Not set";

  const normalized = value.trim();
  if (!normalized) return "Not set";

  return normalized
    .split(/[_\s-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function formatReviewDateTime(value: unknown): string {
  if (typeof value !== "string") return "Not set";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Not set";

  return parsed.toLocaleString();
}

async function readImageDimensions(
  file: File,
): Promise<{ width: number; height: number; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? "");
      const image = new Image();
      image.onload = () => {
        resolve({
          width: image.naturalWidth,
          height: image.naturalHeight,
          dataUrl,
        });
      };
      image.onerror = () => reject(new Error("Unable to load image"));
      image.src = dataUrl;
    };
    reader.onerror = () => reject(new Error("Unable to read image"));
    reader.readAsDataURL(file);
  });
}

async function canvasToFile(
  canvas: HTMLCanvasElement,
  fileName: string,
  mimeType: string,
  quality: number,
): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Unable to compress image"));
          return;
        }
        resolve(new File([blob], fileName, { type: mimeType }));
      },
      mimeType,
      quality,
    );
  });
}

async function compressImageForUpload(
  file: File,
  maxBytes: number,
): Promise<File> {
  if (file.size <= maxBytes) return file;
  if (file.type === "image/gif") return file;

  try {
    const { width, height, dataUrl } = await readImageDimensions(file);
    const maxSide = Math.max(width, height);
    const initialScale =
      maxSide > MAX_IMAGE_DIMENSION ? MAX_IMAGE_DIMENSION / maxSide : 1;

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return file;

    let targetWidth = Math.max(1, Math.round(width * initialScale));
    let targetHeight = Math.max(1, Math.round(height * initialScale));
    const image = new Image();

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Unable to decode image"));
      image.src = dataUrl;
    });

    const outputType =
      file.type === "image/png" || file.type === "image/webp"
        ? "image/webp"
        : "image/jpeg";

    let quality = 0.9;
    let attempts = 0;
    let compressed = file;

    while (attempts < 8) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      context.clearRect(0, 0, targetWidth, targetHeight);
      context.drawImage(image, 0, 0, targetWidth, targetHeight);

      compressed = await canvasToFile(
        canvas,
        file.name.replace(/\.(png|jpe?g|webp)$/i, ".webp"),
        outputType,
        quality,
      );

      if (compressed.size <= maxBytes) {
        return compressed;
      }

      quality = Math.max(0.55, quality - 0.1);
      targetWidth = Math.max(1, Math.round(targetWidth * 0.9));
      targetHeight = Math.max(1, Math.round(targetHeight * 0.9));
      attempts += 1;
    }

    return compressed;
  } catch {
    return file;
  }
}

export function EventCreateWizard({ open, onClose }: EventCreateWizardProps) {
  const createEvent = useCreateEvent();
  const organizerOptionsQuery = useOrganizerOptions();
  const { can } = usePermissions();
  const { data: clusterOptions, isLoading: clustersLoading } = useIGClusters();
  const { data: categoryOptions, isLoading: categoriesLoading } =
    useEventCategories();
  const { data: typeScopeData, isLoading: typeScopeLoading } =
    useEventTypeScope();

  const eventTypeSelectOptions = useMemo(
    () => typeScopeData?.event_type ?? [],
    [typeScopeData],
  );

  const creatorCampusName =
    organizerOptionsQuery.data?.campus_context?.title ?? null;

  const [currentStep, setCurrentStep] = useState(1);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [selectedOrganiserId, setSelectedOrganiserId] = useState("");
  const [selectedCampusName, setSelectedCampusName] = useState("");
  const [selectedIgName, setSelectedIgName] = useState("");
  const [selectedCampusIgName, setSelectedCampusIgName] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const [organiserError, setOrganiserError] = useState("");

  const {
    control,
    register,
    setValue,
    watch,
    trigger,
    reset,
    setError,
    clearErrors,
    formState: { errors, isDirty },
  } = useForm<CreateEventSchema>({
    resolver: zodResolver(createEventSchema) as Resolver<CreateEventSchema>,
    defaultValues: EVENT_FORM_DEFAULT_VALUES,
  });

  const startDatetimeValue = watch("start_datetime");
  const minEndDatetime = startDatetimeValue || undefined;

  // Auto-select the first available cluster when options load (replaces hardcoded "coder" default)
  useEffect(() => {
    if (!watch("event_scope") && clusterOptions && clusterOptions.length > 1) {
      setValue("event_scope", clusterOptions[1].value, { shouldDirty: false });
    }
  }, [clusterOptions, watch, setValue]);

  // Default to "others", mirroring Event.event_type's server-side default.
  // This must not depend on categoryOptions — that table is empty, which used
  // to leave event_type unset and the form permanently invalid.
  useEffect(() => {
    if (!watch("event_type")) {
      setValue("event_type", "others", { shouldDirty: false });
    }
  }, [watch, setValue]);

  // Opportunistically mirror the choice onto the legacy category FK, for as
  // long as those rows exist. Absence is fine: the API allows a null category.
  useEffect(() => {
    const eventType = watch("event_type");
    if (!eventType || watch("category") || !categoryOptions?.length) return;

    const matching = categoryOptions.find((c) => {
      if (typeof c.name !== "string") return false;
      return c.name.trim().toLowerCase().replace(/\s+/g, "_") === eventType;
    });
    if (matching) {
      setValue("category", matching.id, { shouldDirty: false });
    }
  }, [categoryOptions, watch, setValue]);

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

    const isAdmin = can("events:create_as_admin");
    if (data.can_create_as_admin && isAdmin) {
      list.push({ label: "Admin", type: "admin", id: "" });
    }

    const isEnabler = can("events:create_as_enabler");

    if (isEnabler && data.campus_context) {
      const alreadyHasCampus = list.some(
        (c) => c.type === "campus" && c.id === data.campus_context?.id,
      );
      if (!alreadyHasCampus) {
        list.push({
          label: data.campus_context.title ?? "Campus",
          type: "campus",
          id: data.campus_context.id,
        });
      }
    }

    return list;
  }, [organizerOptionsQuery.data, can]);

  const selectedOrganiser = organizerOptions.find(
    (item) => `${item.type}:${item.id}` === selectedOrganiserId,
  );

  const allowedScopes = useMemo(
    () => (selectedOrganiser ? getAllowedScopes(selectedOrganiser.type) : []),
    [selectedOrganiser],
  );

  const updateSelectedOrganiserId = useCallback((nextId: string) => {
    setSelectedOrganiserId(nextId);
    setOrganiserError("");
  }, []);

  useEffect(() => {
    if (organizerOptions.length !== 1) return;
    const onlyOption = organizerOptions[0];
    const nextId = `${onlyOption.type}:${onlyOption.id}`;
    if (selectedOrganiserId !== nextId) {
      updateSelectedOrganiserId(nextId);
    }
  }, [organizerOptions, selectedOrganiserId, updateSelectedOrganiserId]);

  const scope = watch("scope");

  // When the organiser IS the targeted entity, lock the target to it — an
  // organiser must not aim a scoped event at somebody else's campus/IG.
  useEffect(() => {
    if (!selectedOrganiser) return;
    if (selectedOrganiser.type === "campus" && scope === "campus") {
      setValue("target_campus_id", selectedOrganiser.id, {
        shouldValidate: true,
      });
      setSelectedCampusName(selectedOrganiser.label);
    }
    if (selectedOrganiser.type === "global_ig" && scope === "ig") {
      setValue("target_ig_id", selectedOrganiser.id, { shouldValidate: true });
      setSelectedIgName(selectedOrganiser.label);
    }
    if (selectedOrganiser.type === "campus_ig" && scope === "campus_ig") {
      setValue("target_campus_ig_id", selectedOrganiser.id, {
        shouldValidate: true,
      });
      setSelectedCampusIgName(selectedOrganiser.label);
    }
  }, [selectedOrganiser, scope, setValue]);

  const venueType = watch("venue_type");
  useEffect(() => {
    if (venueType === "online") {
      setValue("maps_url", "");
    }
  }, [venueType, setValue]);

  // Keep the selected scope valid when the organiser (and thus allowed scopes) changes.
  useEffect(() => {
    if (allowedScopes.length === 0) return;
    if (!allowedScopes.includes(scope as EventScope)) {
      setValue("scope", allowedScopes[0] as CreateEventSchema["scope"], {
        shouldValidate: false,
      });
    }
  }, [allowedScopes, scope, setValue]);

  const resetWizard = () => {
    reset(EVENT_FORM_DEFAULT_VALUES);
    setCurrentStep(1);
    setCoverImageFile(null);
    setBannerImageFile(null);
    updateSelectedOrganiserId("");
    setSelectedCampusName("");
    setSelectedIgName("");
    setSelectedCampusIgName("");
    setTagInput("");
    setOrganiserError("");
  };

  const requestClose = () => {
    if (isDirty) {
      setConfirmCloseOpen(true);
      return;
    }
    resetWizard();
    onClose();
  };

  const validateStep = async (
    stepIndex: number = currentStep,
  ): Promise<boolean> => {
    if (stepIndex === 1) {
      return trigger(["title", "description", "event_scope", "event_type"]);
    }

    if (stepIndex === 2) {
      if (!selectedOrganiser) {
        setOrganiserError("Select an organiser before proceeding");
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

    if (stepIndex === 3) {
      const fields: Array<keyof CreateEventSchema> = [
        "start_datetime",
        "end_datetime",
        "venue_type",
      ];

      clearErrors([
        "start_datetime",
        "end_datetime",
        "address",
        "city",
        "maps_url",
        "online_link",
        "platform",
      ]);

      let hasStepError = false;
      const startDatetime = watch("start_datetime");
      const endDatetime = watch("end_datetime");
      const venueType = watch("venue_type");

      if (!startDatetime) {
        setError("start_datetime", {
          type: "manual",
          message: "Start datetime is required",
        });
        hasStepError = true;
      }

      if (!endDatetime) {
        setError("end_datetime", {
          type: "manual",
          message: "End datetime is required",
        });
        hasStepError = true;
      }

      if (startDatetime && endDatetime) {
        const start = new Date(startDatetime).getTime();
        const end = new Date(endDatetime).getTime();
        if (end <= start) {
          setError("end_datetime", {
            type: "manual",
            message: "End datetime must be after start datetime",
          });
          hasStepError = true;
        }
      }

      if (venueType === "physical") {
        if (!watch("address")) {
          setError("address", {
            type: "manual",
            message: "Address is required for physical venues",
          });
          hasStepError = true;
        }
        if (!watch("city")) {
          setError("city", {
            type: "manual",
            message: "City is required for physical venues",
          });
          hasStepError = true;
        }
        if (!watch("maps_url")) {
          setError("maps_url", {
            type: "manual",
            message: "Maps URL is required for physical venues",
          });
          hasStepError = true;
        }
        fields.push("address", "city", "maps_url");
      }
      if (venueType === "online") {
        if (!watch("online_link")) {
          setError("online_link", {
            type: "manual",
            message: "Online link is required for online venues",
          });
          hasStepError = true;
        }
        if (!watch("platform")) {
          setError("platform", {
            type: "manual",
            message: "Platform is required for online venues",
          });
          hasStepError = true;
        }
        fields.push("online_link", "platform");
      }
      if (venueType === "hybrid") {
        if (!watch("address")) {
          setError("address", {
            type: "manual",
            message: "Address is required for physical venues",
          });
          hasStepError = true;
        }
        if (!watch("city")) {
          setError("city", {
            type: "manual",
            message: "City is required for physical venues",
          });
          hasStepError = true;
        }
        if (!watch("maps_url")) {
          setError("maps_url", {
            type: "manual",
            message: "Maps URL is required for hybrid venues",
          });
          hasStepError = true;
        }
        if (!watch("online_link")) {
          setError("online_link", {
            type: "manual",
            message: "Online link is required for online venues",
          });
          hasStepError = true;
        }
        if (!watch("platform")) {
          setError("platform", {
            type: "manual",
            message: "Platform is required for online venues",
          });
          hasStepError = true;
        }
        fields.push("address", "city", "maps_url", "online_link", "platform");
      }

      if (hasStepError) return false;

      return trigger(fields);
    }

    return true;
  };

  const handleStepClick = async (targetStep: number) => {
    if (targetStep === currentStep) return;

    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      return;
    }

    // Forward jump - validate sequentially
    for (let step = currentStep; step < targetStep; step++) {
      const isValid = await validateStep(step);
      if (!isValid) {
        setCurrentStep(step);
        return;
      }
    }
    setCurrentStep(targetStep);
  };

  const addTag = () => {
    const normalized = tagInput.trim().replace(/,$/, "").toLowerCase();
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
  };

  const submitWizard = async (action: "draft" | "publish") => {
    if (!selectedOrganiser) {
      setOrganiserError("Select an organiser before saving");
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
      event_scope: values.event_scope,
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
      is_collaboration: values.is_collaboration,
      is_featured: values.is_featured,
      tags: values.tags && values.tags.length > 0 ? values.tags : null,
      category: values.category || null,
      event_type: values.event_type || null,
    };

    const compressedCoverImage = coverImageFile
      ? await compressImageForUpload(coverImageFile, MAX_SINGLE_IMAGE_BYTES)
      : null;
    const compressedBannerImage = bannerImageFile
      ? await compressImageForUpload(bannerImageFile, MAX_SINGLE_IMAGE_BYTES)
      : null;

    const totalUploadBytes =
      (compressedCoverImage?.size ?? 0) + (compressedBannerImage?.size ?? 0);
    if (totalUploadBytes > MAX_WIZARD_UPLOAD_BYTES) {
      const currentSizeMB = (totalUploadBytes / (1024 * 1024)).toFixed(2);
      const maxSizeMB = (MAX_WIZARD_UPLOAD_BYTES / (1024 * 1024)).toFixed(2);
      toast.error(
        `Total image upload is ${currentSizeMB}MB. Please keep cover + banner under ${maxSizeMB}MB.`,
      );
      return;
    }

    let createdEventId: string | null = null;
    try {
      const requestBody =
        compressedCoverImage || compressedBannerImage
          ? toEventFormData(
              payload,
              compressedCoverImage,
              compressedBannerImage,
            )
          : payload;

      const created = await createEvent.mutateAsync(requestBody as never);
      createdEventId = created.id;

      if (action === "publish") {
        await eventsApi.publish(created.id);
      }

      toast.success(
        action === "publish" ? "Event published" : "Event saved as draft",
      );
      resetWizard();
      onClose();
    } catch (err) {
      if (createdEventId) {
        const errMsg = getApiResponseError(err, {
          fallback: "Failed to publish event",
        });
        toast.error(`Event saved as draft, but failed to publish: ${errMsg}`);
        resetWizard();
        onClose();
      } else {
        const errMsg = getApiResponseError(err, {
          fallback:
            action === "publish"
              ? "Failed to publish event"
              : "Failed to create event",
        });
        toast.error(errMsg);
      }
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => (!next ? requestClose() : null)}
      >
        <DialogContent className="flex h-[100dvh] w-screen max-w-none flex-col overflow-hidden rounded-none border-0 sm:h-[92dvh] sm:w-[94vw] sm:max-w-[1400px] sm:rounded-2xl sm:border">
          <DialogHeader className="pb-2">
            <DialogTitle>Create Event</DialogTitle>
          </DialogHeader>

          <div className="mx-auto hidden w-full max-w-6xl items-center gap-4 px-4 pb-2 sm:flex">
            {EVENT_CREATE_WIZARD_STEPS.map((label, index) => {
              const stepIndex = index + 1;
              const isActive = stepIndex === currentStep;
              const isCompleted = stepIndex < currentStep;

              return (
                <Fragment key={label}>
                  <button
                    type="button"
                    onClick={() => handleStepClick(stepIndex)}
                    className={`flex items-center gap-3 text-left focus:outline-none transition-all duration-200 ${
                      isActive
                        ? "cursor-default pointer-events-none"
                        : "cursor-pointer hover:opacity-80"
                    }`}
                  >
                    {isActive ? (
                      <Button
                        asChild
                        variant="default"
                        size="icon-sm"
                        className="ring-2 ring-brand-blue ring-offset-2 pointer-events-none shrink-0"
                      >
                        <span className="flex items-center justify-center">
                          {stepIndex}
                        </span>
                      </Button>
                    ) : isCompleted ? (
                      <Button
                        asChild
                        variant="default"
                        size="icon-sm"
                        className="pointer-events-none shrink-0"
                      >
                        <span className="flex items-center justify-center">
                          <Check className="h-4 w-4" />
                        </span>
                      </Button>
                    ) : (
                      <Button
                        asChild
                        variant="secondary"
                        size="icon-sm"
                        className="pointer-events-none shrink-0"
                      >
                        <span className="flex items-center justify-center">
                          {stepIndex}
                        </span>
                      </Button>
                    )}
                    <div className="min-w-0 pt-1">
                      <p
                        className={`text-xs whitespace-nowrap leading-none ${isActive ? "font-medium text-foreground" : "text-muted-foreground"}`}
                      >
                        {label}
                      </p>
                    </div>
                  </button>
                  {index < EVENT_CREATE_WIZARD_STEPS.length - 1 ? (
                    <div
                      className={`h-0.5 flex-1 self-center ${isCompleted ? "bg-primary" : "bg-border"}`}
                    />
                  ) : null}
                </Fragment>
              );
            })}
          </div>

          <div className="mx-auto w-full max-w-5xl px-1 pb-2 sm:hidden">
            <p className="text-sm font-medium text-foreground">
              Step {currentStep} of {EVENT_CREATE_WIZARD_STEPS.length} -{" "}
              {EVENT_CREATE_WIZARD_STEPS[currentStep - 1]}
            </p>
            <div className="mt-2 h-1 w-full rounded-full bg-border">
              <div
                className="h-1 rounded-full bg-primary transition-all"
                style={{
                  width: `${(currentStep / EVENT_CREATE_WIZARD_STEPS.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto w-full max-w-5xl">
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
                      rows={4}
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
                              <div className="h-12 w-full animate-pulse rounded-xl bg-muted" />
                            ) : (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full justify-between rounded-xl"
                                  >
                                    <span>
                                      {currentCluster?.label ??
                                        "Select cluster"}
                                    </span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-full max-w-sm p-1">
                                  {(clusterOptions ?? [])
                                    .filter((item) => item.value !== "all")
                                    .map((item) => {
                                      const isSelected =
                                        field.value === item.value;
                                      return (
                                        <DropdownMenuItem
                                          key={item.value}
                                          onSelect={() =>
                                            field.onChange(item.value)
                                          }
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
                      name="event_type"
                      render={({ field }) => {
                        const selectedType = eventTypeSelectOptions.find(
                          (item) => item.value === field.value,
                        );

                        const isLoadingOptions =
                          categoriesLoading || typeScopeLoading;

                        return (
                          <div className="w-full">
                            {isLoadingOptions ? (
                              <div className="h-12 w-full animate-pulse rounded-xl bg-muted" />
                            ) : (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full justify-between rounded-xl"
                                  >
                                    <span>
                                      {selectedType?.label ??
                                        "Select event type"}
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
                                            (categoryOptions ?? []).find(
                                              (c) => {
                                                if (typeof c.name !== "string")
                                                  return false;
                                                const catSlug = c.name
                                                  .trim()
                                                  .toLowerCase()
                                                  .replace(/\s+/g, "_");
                                                return catSlug === item.value;
                                              },
                                            ) ||
                                            (categoryOptions ?? []).find(
                                              (c) => {
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
                                              },
                                            ) ||
                                            categoryOptions?.[0];

                                          // event_type is the field that counts:
                                          // it maps to Event.EventType on the
                                          // backend. category is a nullable FK
                                          // to a lookup table that duplicates
                                          // the same enum, so set it only if a
                                          // matching row happens to exist.
                                          field.onChange(item.value);
                                          if (matchingCat) {
                                            setValue(
                                              "category",
                                              matchingCat.id,
                                              { shouldDirty: true },
                                            );
                                          }
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
                    {errors.event_type?.message ? (
                      <p className="text-xs text-destructive">
                        {errors.event_type.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Tags</p>
                    <div className="flex gap-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                      />
                      <Button type="button" variant="outline" onClick={addTag}>
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
                  {!organizerOptionsQuery.isLoading &&
                  organizerOptions.length === 0 ? (
                    <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <p>
                        You don&apos;t have permission to create events yet.
                        Contact your admin to get an organiser role (IG Lead,
                        Campus Lead, Company, or Mentor).
                      </p>
                    </div>
                  ) : null}
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
                    ) : !organizerOptionsQuery.isLoading &&
                      organizerOptions.length === 0 ? (
                      <p className="text-sm text-destructive">
                        You don't have permission to create events. Contact an
                        admin.
                      </p>
                    ) : (
                      <select
                        className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
                        value={selectedOrganiserId}
                        onChange={(e) =>
                          updateSelectedOrganiserId(e.target.value)
                        }
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
                    {organiserError ? (
                      <p className="text-xs text-destructive">
                        {organiserError}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      Scope <span className="text-destructive">*</span>
                    </p>
                    <Controller
                      control={control}
                      name="scope"
                      render={({ field }) => {
                        const availableScopes = EVENT_SCOPE_OPTIONS.filter(
                          (item) => allowedScopes.includes(item.value),
                        );
                        const currentScope = availableScopes.find(
                          (item) => item.value === field.value,
                        );

                        return (
                          <div className="w-full">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="w-full justify-between rounded-xl"
                                  disabled={availableScopes.length <= 1}
                                >
                                  <span>
                                    {currentScope?.label ?? "Select scope"}
                                  </span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="w-full max-w-sm p-1">
                                {availableScopes.map((item) => {
                                  const isSelected = field.value === item.value;
                                  return (
                                    <DropdownMenuItem
                                      key={item.value}
                                      onSelect={() =>
                                        field.onChange(item.value)
                                      }
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
                          </div>
                        );
                      }}
                    />
                  </div>

                  {scope === "campus" ? (
                    selectedOrganiser?.type === "campus" ? (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Target Campus
                        </p>
                        <div className="flex h-10 items-center rounded-xl border border-border bg-muted px-3 text-sm text-foreground">
                          {selectedOrganiser.label}
                        </div>
                      </div>
                    ) : (
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
                    )
                  ) : null}

                  {scope === "ig" ? (
                    selectedOrganiser?.type === "global_ig" ? (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Target Interest Group
                        </p>
                        <div className="flex h-10 items-center rounded-xl border border-border bg-muted px-3 text-sm text-foreground">
                          {selectedOrganiser.label}
                        </div>
                      </div>
                    ) : (
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
                    )
                  ) : null}

                  {scope === "campus_ig" ? (
                    selectedOrganiser?.type === "campus_ig" ? (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Target Campus IG
                        </p>
                        <div className="flex h-10 items-center rounded-xl border border-border bg-muted px-3 text-sm text-foreground">
                          {creatorCampusName
                            ? `${selectedOrganiser.label} · ${creatorCampusName}`
                            : selectedOrganiser.label}
                        </div>
                      </div>
                    ) : (
                      <EventSearch
                        mode="select"
                        type="campus_ig"
                        value={watch("target_campus_ig_id") ?? null}
                        selectedName={selectedCampusIgName}
                        placeholder="Search campus IG"
                        campusContextLabel={creatorCampusName}
                        campusId={
                          organizerOptionsQuery.data?.campus_context?.id ?? null
                        }
                        onChange={(id, name) => {
                          setValue("target_campus_ig_id", id || null, {
                            shouldValidate: true,
                          });
                          setSelectedCampusIgName(name);
                        }}
                      />
                    )
                  ) : null}
                </section>
              ) : null}

              {currentStep === 3 ? (
                <section className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        Start datetime{" "}
                        <span className="text-destructive">*</span>
                      </p>
                      <Input
                        type="datetime-local"
                        {...register("start_datetime")}
                      />
                      {errors.start_datetime?.message ? (
                        <p className="text-xs text-destructive">
                          {errors.start_datetime.message}
                        </p>
                      ) : null}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        End datetime <span className="text-destructive">*</span>
                      </p>
                      <Input
                        type="datetime-local"
                        min={minEndDatetime}
                        {...register("end_datetime")}
                      />
                      {errors.end_datetime?.message ? (
                        <p className="text-xs text-destructive">
                          {errors.end_datetime.message}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <VenueSection
                    control={control}
                    watch={watch}
                    errors={errors}
                    variant="plain"
                  />
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
                </section>
              ) : null}

              {currentStep === 6 ? (
                <section className="space-y-4">
                  <h3 className="text-lg font-bold text-foreground">
                    Review your event
                  </h3>
                  <div className="rounded-2xl border border-border bg-card lc-card-shadow divide-y divide-border">
                    {[
                      ["Title", watch("title") || "Not set", true],
                      [
                        "Description",
                        watch("description")
                          ? `${watch("description").slice(0, 100)}${watch("description").length > 100 ? "..." : ""}`
                          : "Not set",
                        true,
                      ],
                      [
                        "Organizer",
                        selectedOrganiser?.label || "Not set",
                        false,
                      ],
                      ["Scope", formatReviewEnum(watch("scope")), false],
                      [
                        "Start",
                        formatReviewDateTime(watch("start_datetime")),
                        true,
                      ],
                      [
                        "End",
                        formatReviewDateTime(watch("end_datetime")),
                        true,
                      ],
                      ["Venue", formatReviewEnum(watch("venue_type")), true],
                      [
                        "Tags",
                        (watch("tags") ?? []).join(", ") || "Not set",
                        false,
                      ],
                      [
                        "Collaboration",
                        watch("is_collaboration") ? "Yes" : "No",
                        false,
                      ],
                      ["Featured", watch("is_featured") ? "Yes" : "No", false],
                      ["Min karma", watch("min_karma") ?? "Not set", false],
                      [
                        "Registration URL",
                        watch("registration_url") || "Not set",
                        false,
                      ],
                    ].map(([label, value, required]) => (
                      <div
                        key={String(label)}
                        className="flex items-start justify-between gap-4 px-4 py-3"
                      >
                        <p className="w-28 shrink-0 text-xs font-medium text-muted-foreground">
                          {label}
                        </p>
                        <p
                          className={`text-right text-sm ${String(value) === "Not set" ? (required ? "text-destructive" : "text-muted-foreground") : "text-foreground"}`}
                        >
                          {String(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border bg-card/80 p-4 backdrop-blur-sm">
            <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-2">
              <Button variant="ghost" onClick={requestClose}>
                Cancel
              </Button>

              <div className="flex flex-wrap items-center justify-end gap-2">
                {currentStep > 1 ? (
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentStep((value) => Math.max(1, value - 1))
                    }
                  >
                    Back
                  </Button>
                ) : null}

                {currentStep < 6 ? (
                  <Button
                    onClick={async () => {
                      const ok = await validateStep();
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
                      disabled={createEvent.isPending}
                      onClick={() => submitWizard("draft")}
                    >
                      {createEvent.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Save as Draft
                    </Button>
                    <Button
                      disabled={
                        createEvent.isPending ||
                        !watch("start_datetime") ||
                        !watch("end_datetime")
                      }
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
