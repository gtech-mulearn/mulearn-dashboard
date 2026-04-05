"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Controller, type Resolver, useForm } from "react-hook-form";
import { toast } from "sonner";
import { apiClient, endpoints } from "@/api";
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
import {
  resolveEventTypeValue,
  toDatetimeLocal,
  toISOWithOffset,
  useCreateEvent,
  useOrganizerOptions,
  usePatchEvent,
} from "../hooks";
import {
  type CreateEventSchema,
  createEventSchema,
  updateEventSchema,
} from "../schemas";
import type {
  EventDetail,
  EventDetailManage,
  EventListItem,
  EventPatchBody,
  EventWriteBody,
  MinimalCampus,
  MinimalCompany,
  MinimalIG,
  OrganizerOptionsResponse,
  OrganizerType,
} from "../types";
import { EventSearch } from "./event-search";
import { VenueSection } from "./venue-section";

interface EventModalProps {
  open: boolean;
  onClose: () => void;
  initialData?:
    | Partial<EventListItem>
    | Partial<EventDetail>
    | Partial<EventDetailManage>
    | null;
  isEdit?: boolean;
}

interface SelectedOrganiser {
  label: string;
  type: OrganizerType;
  id: string;
}

interface CoOwnerDisplay {
  user_id: string;
  role?: "co_owner" | "admin";
  full_name: string;
  muid: string;
}

type ComparablePatchPayload = Partial<EventPatchBody>;

type OrganizerOptionsLike = Partial<OrganizerOptionsResponse> & {
  canCreateAsIg?: OrganizerOptionsResponse["can_create_as_ig"];
  canCreateAsCampusIg?: OrganizerOptionsResponse["can_create_as_campus_ig"];
  canCreateAsCampus?: OrganizerOptionsResponse["can_create_as_campus"];
  canCreateAsCompany?: OrganizerOptionsResponse["can_create_as_company"];
  canCreateAsAdmin?: OrganizerOptionsResponse["can_create_as_admin"];
  response?: Partial<OrganizerOptionsResponse>;
};

function safeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export default function EventModal({
  open,
  onClose,
  initialData,
  isEdit,
}: EventModalProps) {
  const createEvent = useCreateEvent();
  const patchEvent = usePatchEvent(initialData?.id ?? "");
  const organizerOptionsQuery = useOrganizerOptions();
  const { data: userInfo } = useQuery({
    queryKey: ["user", "info", "events-modal"],
    queryFn: () => apiClient.get<Record<string, unknown>>(endpoints.user.info),
  });

  const isAdminUser = Boolean(
    (userInfo?.is_staff as boolean | undefined) ||
      (Array.isArray(userInfo?.roles) &&
        (userInfo.roles as string[]).some((role) =>
          role.toLowerCase().includes("admin"),
        )),
  );

  const organizerOptions = useMemo<SelectedOrganiser[]>(() => {
    const raw = organizerOptionsQuery.data as OrganizerOptionsLike | undefined;
    if (!raw) return [];

    const options = (raw.response ?? raw) as OrganizerOptionsLike;

    const igs = safeArray<MinimalIG>(
      options.can_create_as_ig ?? options.canCreateAsIg,
    );
    const campusIgs = safeArray<MinimalIG>(
      options.can_create_as_campus_ig ?? options.canCreateAsCampusIg,
    );
    const campuses = safeArray<MinimalCampus>(
      options.can_create_as_campus ?? options.canCreateAsCampus,
    );
    const companies = safeArray<MinimalCompany>(
      options.can_create_as_company ?? options.canCreateAsCompany,
    );
    const canCreateAsAdmin = Boolean(
      options.can_create_as_admin ?? options.canCreateAsAdmin,
    );

    const all: SelectedOrganiser[] = [];

    for (const ig of igs) {
      all.push({ label: ig.name, type: "global_ig", id: ig.id });
    }

    for (const campusIg of campusIgs) {
      all.push({
        label: campusIg.name,
        type: "campus_ig",
        id: campusIg.id,
      });
    }

    for (const campus of campuses) {
      all.push({
        label: campus.name ?? campus.title ?? "Campus",
        type: "campus",
        id: campus.id,
      });
    }

    for (const company of companies) {
      all.push({
        label: company.name ?? company.title ?? "Company",
        type: "company",
        id: company.id,
      });
    }

    if (canCreateAsAdmin) {
      all.push({ label: "Admin", type: "admin", id: "" });
    }

    if (all.length === 0 && isAdminUser) {
      all.push({ label: "Admin", type: "admin", id: "" });
    }

    if (
      all.length === 0 &&
      (Object.keys(raw).length > 0 || Object.keys(options).length > 0)
    ) {
      console.warn("[events] organizer options returned empty", {
        raw,
        options,
      });
    }

    return all;
  }, [organizerOptionsQuery.data, isAdminUser]);

  const [selectedOrganiserId, setSelectedOrganiserId] = useState<string>("");
  const [selectedCoOwners, setSelectedCoOwners] = useState<CoOwnerDisplay[]>(
    [],
  );
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [selectedCampusName, setSelectedCampusName] = useState<string>("");
  const [selectedIgName, setSelectedIgName] = useState<string>("");
  const [selectedCampusIgName, setSelectedCampusIgName] = useState<string>("");
  const [tagInput, setTagInput] = useState("");
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);

  const requestClose = () => {
    setExitConfirmOpen(true);
  };

  const confirmExit = () => {
    setExitConfirmOpen(false);
    onClose();
  };

  const {
    control,
    register,
    watch,
    setValue,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateEventSchema>({
    resolver: zodResolver(
      isEdit ? updateEventSchema : createEventSchema,
    ) as Resolver<CreateEventSchema>,
    defaultValues: EVENT_FORM_DEFAULT_VALUES,
  });

  useEffect(() => {
    if (!open) return;
    const d = initialData as Partial<EventDetailManage> | null | undefined;
    const validScopes: Array<"global" | "campus" | "ig" | "campus_ig"> = [
      "global",
      "campus",
      "ig",
      "campus_ig",
    ];
    const scope = (
      d?.scope && (validScopes as string[]).includes(d.scope)
        ? d.scope
        : "global"
    ) as "global" | "campus" | "ig" | "campus_ig";
    reset({
      ...EVENT_FORM_DEFAULT_VALUES,
      title: d?.title ?? "",
      description: d?.description ?? "",
      event_type: resolveEventTypeValue(d?.event_type, d?.category_name),
      scope,
      start_datetime: toDatetimeLocal(d?.start_datetime),
      end_datetime: toDatetimeLocal(d?.end_datetime),
      venue_type:
        d?.venue?.type ?? (d as Partial<EventListItem>)?.venue_type ?? "online",
      address: d?.venue?.address ?? "",
      city: d?.venue?.city ?? (d as Partial<EventListItem>)?.venue_city ?? "",
      maps_url: d?.venue?.maps_url ?? "",
      online_link: d?.venue?.online_link ?? "",
      platform: d?.venue?.platform ?? "",
      cover_image: d?.cover_image ?? "",
      banner_image: d?.banner_image ?? "",
      registration_url: d?.registration_url ?? "",
      registration_deadline:
        toDatetimeLocal(
          d?.registration_deadline as string | null | undefined,
        ) || "",
      min_karma: d?.min_karma ?? null,
      is_collaboration: d?.is_collaboration ?? false,
      target_campus_id:
        (d as Partial<EventDetail>)?.scope_org?.id ??
        d?.target_campus?.id ??
        null,
      target_ig_id:
        (d as Partial<EventDetail>)?.scope_ig?.id ?? d?.target_ig?.id ?? null,
      target_campus_ig_id:
        (d as Partial<EventDetail>)?.scope_ci_id ??
        d?.target_campus_ig?.id ??
        null,
      tags: d?.tags
        ? Array.isArray(d.tags)
          ? d.tags
          : Object.keys(d.tags)
        : [],
      is_featured: d?.is_featured ?? false,
    });
    setSelectedCoOwners(
      d?.co_owners?.map((owner) => ({
        user_id: owner.user.id,
        role: owner.role ?? "co_owner",
        full_name: owner.user.full_name,
        muid: owner.user.muid,
      })) ?? [],
    );
    setCoverImageFile(null);
    setBannerImageFile(null);
    setSelectedCampusName(
      (d as Partial<EventDetail>)?.scope_org?.title ??
        d?.target_campus?.name ??
        "",
    );
    setSelectedIgName(
      (d as Partial<EventDetail>)?.scope_ig?.name ?? d?.target_ig?.name ?? "",
    );
    setSelectedCampusIgName(
      (d as Partial<EventDetail>)?.scope_ci_id
        ? `${(d as Partial<EventDetail>)?.scope_ig?.name ?? d?.target_ig?.name ?? ""} @ ${(d as Partial<EventDetail>)?.scope_org?.title ?? d?.target_campus?.name ?? ""}`
        : (d?.target_campus_ig?.name ?? ""),
    );
  }, [initialData, open, reset]);

  useEffect(() => {
    if (organizerOptions.length === 1 && !selectedOrganiserId) {
      setSelectedOrganiserId(
        `${organizerOptions[0].type}:${organizerOptions[0].id}`,
      );
    }
  }, [organizerOptions, selectedOrganiserId]);

  useEffect(() => {
    const d = initialData as Partial<EventDetailManage> | null | undefined;
    if (!d?.organizer || organizerOptions.length === 0) return;

    const organizerType = d.organizer.type;
    const organizerId =
      d.organizer.ig?.id ??
      d.organizer.campus?.id ??
      d.organizer.campus_ig?.id ??
      d.organizer.company?.id ??
      "";
    const matching = organizerOptions.find(
      (option) => option.type === organizerType && option.id === organizerId,
    );
    if (matching) {
      setSelectedOrganiserId(`${matching.type}:${matching.id}`);
    }
  }, [initialData, organizerOptions]);

  useEffect(() => {
    const d = initialData as Partial<EventDetailManage> | null | undefined;
    // If admin is editing an event without an organizer, auto-select "Admin" organizer
    if (
      isEdit &&
      isAdminUser &&
      (!d?.organizer || !selectedOrganiserId) &&
      organizerOptions.length > 0
    ) {
      const adminOption = organizerOptions.find((opt) => opt.type === "admin");
      if (adminOption && !selectedOrganiserId) {
        setSelectedOrganiserId(`${adminOption.type}:${adminOption.id}`);
      }
    }
  }, [isEdit, isAdminUser, organizerOptions, selectedOrganiserId, initialData]);

  const scope = watch("scope");

  const selectedOrganizer = organizerOptions.find(
    (option) => `${option.type}:${option.id}` === selectedOrganiserId,
  );
  const isPending =
    createEvent.isPending || patchEvent.isPending || isSubmitting;
  const hasOrganizerPermission = organizerOptions.length > 0;
  const requiresOrganizerSelection = organizerOptions.length > 1;
  const missingOrganizerSelection = !selectedOrganizer;
  const isEditingAsAdmin = isEdit && isAdminUser;
  const shouldRequireOrganizer = !isEditingAsAdmin;
  const disableSaveActions =
    isPending ||
    (!hasOrganizerPermission && shouldRequireOrganizer) ||
    (requiresOrganizerSelection &&
      missingOrganizerSelection &&
      shouldRequireOrganizer);

  // Check if we can publish this event
  const eventStatus =
    isEdit && (initialData as Partial<EventDetailManage>)?.status;
  const canPublish = !eventStatus || eventStatus === "draft";
  const saveButtonLabel =
    isEdit && eventStatus && eventStatus !== "draft"
      ? "Save Changes"
      : "Save as Draft";

  const toFormData = (
    payload: Record<string, unknown>,
    coverFile: File | null,
    bannerFile: File | null,
  ): FormData => {
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
  };

  const normalizeCoOwners = (
    coOwners:
      | Array<{ user_id: string; role?: "co_owner" | "admin" }>
      | undefined,
  ): Array<{ user_id: string; role: "co_owner" | "admin" }> =>
    (coOwners ?? [])
      .map((owner) => ({
        user_id: owner.user_id,
        role: owner.role ?? "co_owner",
      }))
      .sort((a, b) => a.user_id.localeCompare(b.user_id));

  const normalizeTags = (
    tags: string[] | Record<string, unknown> | null | undefined,
  ): string[] | null => {
    if (!tags) return null;
    if (Array.isArray(tags)) {
      return tags.length > 0 ? [...tags].sort() : null;
    }
    const keys = Object.keys(tags);
    return keys.length > 0 ? keys.sort() : null;
  };

  const normalizeDateValue = (value: unknown): number | null => {
    if (typeof value !== "string") return null;
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const valuesAreEqual = (left: unknown, right: unknown): boolean => {
    if (left === right) return true;

    const leftDate = normalizeDateValue(left);
    const rightDate = normalizeDateValue(right);
    if (leftDate !== null && rightDate !== null) {
      return leftDate === rightDate;
    }

    if (Array.isArray(left) && Array.isArray(right)) {
      return JSON.stringify(left) === JSON.stringify(right);
    }

    if (
      left &&
      right &&
      typeof left === "object" &&
      typeof right === "object"
    ) {
      return JSON.stringify(left) === JSON.stringify(right);
    }

    return false;
  };

  const buildComparableInitialPayload = (
    event: EventDetail | EventDetailManage,
  ): ComparablePatchPayload => {
    const organizer = event.organizer;
    const organizerType = organizer?.type ?? "admin";

    const organizerIg =
      organizerType === "global_ig" ? (organizer?.ig?.id ?? null) : null;
    const organizerOrg =
      organizerType === "campus"
        ? (organizer?.campus?.id ?? null)
        : organizerType === "company"
          ? (organizer?.company?.id ?? null)
          : null;
    const organizerCi =
      organizerType === "campus_ig"
        ? ((organizer?.campus_ig?.id ?? organizer?.campus_ig_id ?? null) as
            | string
            | null)
        : null;

    return {
      title: event.title,
      description: event.description,
      start_datetime: event.start_datetime,
      end_datetime: event.end_datetime,
      registration_url: event.registration_url,
      registration_deadline: event.registration_deadline,
      min_karma: event.min_karma,
      venue_type: event.venue.type,
      venue_address: event.venue.address,
      venue_city: event.venue.city,
      venue_maps_url: event.venue.maps_url,
      venue_online_link: event.venue.online_link,
      venue_platform: event.venue.platform,
      scope: event.scope,
      scope_org:
        event.scope === "campus" ? (event.scope_org?.id ?? null) : null,
      scope_ig: event.scope === "ig" ? (event.scope_ig?.id ?? null) : null,
      scope_ci_id:
        event.scope === "campus_ig" ? (event.scope_ci_id ?? null) : null,
      is_collaboration: event.is_collaboration,
      is_featured: event.is_featured,
      tags: normalizeTags(event.tags),
      organiser_type: organizerType,
      organiser_ig: organizerIg,
      organiser_org: organizerOrg,
      organiser_ci_id: organizerCi,
      event_type: resolveEventTypeValue(event.event_type, event.category_name),
      co_owners: normalizeCoOwners(
        event.co_owners?.map((owner) => ({
          user_id: owner.user.id,
          role: owner.role,
        })),
      ),
    } as ComparablePatchPayload;
  };

  const buildChangedPatchPayload = (
    nextPayload: ComparablePatchPayload,
    currentEvent: EventDetail | EventDetailManage,
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

  const onSubmit = async (
    values: CreateEventSchema,
    action: "draft" | "publish",
  ) => {
    const start = toISOWithOffset(values.start_datetime);
    const end = toISOWithOffset(values.end_datetime);
    const deadline = values.registration_deadline
      ? toISOWithOffset(values.registration_deadline as unknown as string)
      : null;

    let hasDateError = false;
    if (!start) {
      setError("start_datetime", {
        type: "manual",
        message: "Invalid date format",
      });
      hasDateError = true;
    }
    if (!end) {
      setError("end_datetime", {
        type: "manual",
        message: "Invalid date format",
      });
      hasDateError = true;
    }
    if (values.registration_deadline && !deadline) {
      setError("registration_deadline", {
        type: "manual",
        message: "Invalid date format",
      });
      hasDateError = true;
    }
    if (hasDateError) return;

    const selectedOrganiser = selectedOrganizer;
    if (!selectedOrganiser && !isEdit) {
      setError("title", {
        type: "manual",
        message: "Select an organiser before saving",
      });
      return;
    }

    const tagsValue =
      values.tags && values.tags.length > 0 ? values.tags : null;

    const basePayload: ComparablePatchPayload = {
      title: values.title,
      description: values.description,
      event_type: values.event_type,
      start_datetime: start as string,
      end_datetime: end as string,
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
      tags: tagsValue,
    };

    const existingOrganizer = (initialData as EventDetail | EventDetailManage)
      ?.organizer;
    const organizerPayload: Partial<EventWriteBody> = selectedOrganiser
      ? {
          organiser_type: selectedOrganiser.type,
          organiser_ig:
            selectedOrganiser.type === "global_ig"
              ? selectedOrganiser.id
              : null,
          organiser_org:
            selectedOrganiser.type === "campus" ||
            selectedOrganiser.type === "company"
              ? selectedOrganiser.id
              : null,
          organiser_ci_id:
            selectedOrganiser.type === "campus_ig"
              ? selectedOrganiser.id
              : null,
          co_owners: selectedCoOwners.map(({ user_id, role }) => ({
            user_id,
            role,
          })),
        }
      : isEdit
        ? {
            organiser_type:
              (initialData as Partial<EventDetail>)?.organizer?.type ??
              existingOrganizer?.type ??
              "admin",
            organiser_ig:
              (initialData as Partial<EventDetail>)?.organizer?.ig?.id ??
              existingOrganizer?.ig?.id ??
              null,
            organiser_org:
              (initialData as Partial<EventDetail>)?.organizer?.campus?.id ??
              (initialData as Partial<EventDetail>)?.organizer?.company?.id ??
              existingOrganizer?.campus?.id ??
              existingOrganizer?.company?.id ??
              null,
            organiser_ci_id:
              (initialData as Partial<EventDetail>)?.organizer?.campus_ig?.id ??
              existingOrganizer?.campus_ig?.id ??
              null,
            co_owners: selectedCoOwners.map(({ user_id, role }) => ({
              user_id,
              role,
            })),
          }
        : {};

    try {
      let savedEventId = initialData?.id;

      if (isEdit && initialData?.id) {
        const fullPayload: ComparablePatchPayload = {
          ...basePayload,
          ...organizerPayload,
        };
        const payload = buildChangedPatchPayload(
          fullPayload,
          initialData as EventDetail | EventDetailManage,
        );

        const hasImageChange = Boolean(coverImageFile || bannerImageFile);
        if (Object.keys(payload).length === 0 && !hasImageChange) {
          toast.info("No changes detected");
          onClose();
          return;
        }

        const patchFd = toFormData(
          payload as Record<string, unknown>,
          coverImageFile,
          bannerImageFile,
        );
        const updated = await patchEvent.mutateAsync(patchFd);
        savedEventId = updated.id;
      } else if (!isEdit) {
        if (!selectedOrganiser) {
          setError("title", {
            type: "manual",
            message: "Select an organiser before saving",
          });
          return;
        }

        const createOrganizerPayload = {
          organiser_type: selectedOrganiser.type,
          organiser_ig:
            selectedOrganiser.type === "global_ig"
              ? selectedOrganiser.id
              : null,
          organiser_org:
            selectedOrganiser.type === "campus" ? selectedOrganiser.id : null,
          organiser_ci_id:
            selectedOrganiser.type === "campus_ig"
              ? selectedOrganiser.id
              : null,
          co_owners: selectedCoOwners.map(({ user_id, role }) => ({
            user_id,
            role,
          })),
        };

        const rawPayload = {
          ...basePayload,
          ...createOrganizerPayload,
        };

        const createFd = toFormData(
          rawPayload as Record<string, unknown>,
          coverImageFile,
          bannerImageFile,
        );
        const created = await createEvent.mutateAsync(createFd);
        savedEventId = created.id;
      }

      if (action === "publish" && savedEventId) {
        const eventStatus = isEdit
          ? (initialData as Partial<EventDetailManage> | null)?.status
          : "draft";

        // Only allow publishing if it's a new event (create) or draft status
        if (eventStatus && eventStatus !== "draft") {
          toast.error(
            `Cannot publish events with status "${eventStatus}". Save as draft and update from the manage page.`,
          );
          return;
        }

        try {
          await eventsApi.publish(savedEventId);
        } catch (error) {
          console.error("Failed to publish event after saving draft", error);
          toast.error("Event saved as draft, but publish failed");
          return;
        }
      }

      onClose();
    } catch {
      // Error already handled by mutation onError toast.
      // Do NOT call onClose() here — keep modal open so user can fix.
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(state) => !state && requestClose()}>
        <DialogContent className="max-h-[90vh] w-full overflow-y-auto p-4 sm:max-w-3xl sm:p-6">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Event" : "Create Event"}</DialogTitle>
          </DialogHeader>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <section className="space-y-3 rounded-lg border p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                Basic Info
              </h3>
              <div className="space-y-1">
                <label
                  htmlFor="title"
                  className="text-sm font-medium text-foreground"
                >
                  Title <span className="text-red-500">*</span>
                </label>
                <Input id="title" placeholder="Title" {...register("title")} />
              </div>
              {errors.title?.message ? (
                <p className="text-xs text-red-600">{errors.title.message}</p>
              ) : null}
              <div className="space-y-1">
                <label
                  htmlFor="description"
                  className="text-sm font-medium text-foreground"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="description"
                  placeholder="Description"
                  {...register("description")}
                />
              </div>
              {errors.description?.message ? (
                <p className="text-xs text-red-600">
                  {errors.description.message}
                </p>
              ) : null}
            </section>

            <section className="space-y-3 rounded-lg border p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                Type &amp; Scope
              </h3>
              <div className="space-y-1">
                <label
                  htmlFor="event_type"
                  className="text-sm font-medium text-foreground"
                >
                  Event type
                </label>
                <select
                  id="event_type"
                  className="h-10 w-full rounded-md border px-3 text-sm"
                  {...register("event_type")}
                >
                  {EVENT_TYPE_SELECT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="scope"
                  className="text-sm font-medium text-foreground"
                >
                  Scope <span className="text-red-500">*</span>
                </label>
                <select
                  id="scope"
                  className="h-10 w-full rounded-md border px-3 text-sm"
                  {...register("scope")}
                >
                  {EVENT_SCOPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {scope === "campus" ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    Target campus <span className="text-red-500">*</span>
                  </p>
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
                </div>
              ) : null}
              {scope === "ig" ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    Target IG <span className="text-red-500">*</span>
                  </p>
                  <EventSearch
                    mode="select"
                    type="ig"
                    value={watch("target_ig_id") ?? null}
                    selectedName={selectedIgName}
                    placeholder="Search interest group"
                    onChange={(id, name) => {
                      setValue("target_ig_id", id || null, {
                        shouldValidate: true,
                      });
                      setSelectedIgName(name);
                    }}
                  />
                </div>
              ) : null}
              {scope === "campus_ig" ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    Target campus IG <span className="text-red-500">*</span>
                  </p>
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
                </div>
              ) : null}
              {errors.target_campus_id?.message ? (
                <p className="text-xs text-red-600">
                  {errors.target_campus_id.message}
                </p>
              ) : null}
              {errors.target_ig_id?.message ? (
                <p className="text-xs text-red-600">
                  {errors.target_ig_id.message}
                </p>
              ) : null}
              {errors.target_campus_ig_id?.message ? (
                <p className="text-xs text-red-600">
                  {errors.target_campus_ig_id.message}
                </p>
              ) : null}
            </section>

            <section className="space-y-3 rounded-lg border p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                Create as
              </h3>
              {organizerOptionsQuery.isLoading ? (
                <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
              ) : !hasOrganizerPermission ? (
                <p className="text-sm text-destructive">
                  You do not have permission to create events. Contact an admin.
                </p>
              ) : organizerOptions.length === 1 ? (
                <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
                  {organizerOptions[0].label}
                </div>
              ) : (
                <select
                  className="h-10 w-full rounded-md border px-3 text-sm"
                  value={selectedOrganiserId}
                  onChange={(e) => setSelectedOrganiserId(e.target.value)}
                >
                  <option value="">Select organiser</option>
                  {organizerOptions.map((option) => (
                    <option
                      key={`${option.type}:${option.id}`}
                      value={`${option.type}:${option.id}`}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </section>

            <section className="space-y-3 rounded-lg border p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                Dates
              </h3>
              <div className="space-y-1">
                <label
                  htmlFor="start_datetime"
                  className="text-sm font-medium text-foreground"
                >
                  Start date &amp; time <span className="text-red-500">*</span>
                </label>
                <Input
                  id="start_datetime"
                  type="datetime-local"
                  {...register("start_datetime")}
                />
                {errors.start_datetime?.message ? (
                  <p className="text-xs text-red-600">
                    {errors.start_datetime.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="end_datetime"
                  className="text-sm font-medium text-foreground"
                >
                  End date &amp; time <span className="text-red-500">*</span>
                </label>
                <Input
                  id="end_datetime"
                  type="datetime-local"
                  {...register("end_datetime")}
                />
                {errors.end_datetime?.message ? (
                  <p className="text-xs text-red-600">
                    {errors.end_datetime.message}
                  </p>
                ) : null}
              </div>
            </section>

            <VenueSection control={control} watch={watch} errors={errors} />

            <section className="space-y-3 rounded-lg border p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                Images
              </h3>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Cover Image{" "}
                  <span className="text-xs text-muted-foreground">
                    (optional)
                  </span>
                </p>
                <ImageUpload
                  value={coverImageFile}
                  onChange={setCoverImageFile}
                  currentUrl={watch("cover_image") ?? undefined}
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Banner Image{" "}
                  <span className="text-xs text-muted-foreground">
                    (optional)
                  </span>
                </p>
                <ImageUpload
                  value={bannerImageFile}
                  onChange={setBannerImageFile}
                  currentUrl={watch("banner_image") ?? undefined}
                />
              </div>
            </section>

            <section className="space-y-3 rounded-lg border p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                Registration
              </h3>
              <div className="space-y-1">
                <label
                  htmlFor="registration_url"
                  className="text-sm font-medium text-foreground"
                >
                  Registration URL{" "}
                  <span className="text-xs text-muted-foreground">
                    (optional)
                  </span>
                </label>
                <Input
                  id="registration_url"
                  placeholder="Registration URL"
                  {...register("registration_url")}
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="registration_deadline"
                  className="text-sm font-medium text-foreground"
                >
                  Registration deadline{" "}
                  <span className="text-xs text-muted-foreground">
                    (optional)
                  </span>
                </label>
                <Input
                  id="registration_deadline"
                  type="datetime-local"
                  {...register("registration_deadline")}
                />
              </div>
              <Controller
                control={control}
                name="min_karma"
                render={({ field }) => (
                  <div className="space-y-1">
                    <label
                      htmlFor="min_karma"
                      className="text-sm font-medium text-foreground"
                    >
                      Minimum karma{" "}
                      <span className="text-xs text-muted-foreground">
                        (optional)
                      </span>
                    </label>
                    <Input
                      id="min_karma"
                      type="number"
                      min={0}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                      placeholder="Minimum karma"
                    />
                  </div>
                )}
              />
            </section>

            <section className="space-y-3 rounded-lg border p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                Tags &amp; Collaboration
              </h3>
              <Controller
                control={control}
                name="tags"
                render={({ field }) => (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      Tags{" "}
                      <span className="text-xs text-muted-foreground">
                        (optional)
                      </span>
                    </p>
                    <Input
                      placeholder="Type a tag and press Enter"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          const nextTag = tagInput.trim().replace(/,$/, "");
                          if (!nextTag) return;
                          const existingTags = Array.isArray(field.value)
                            ? field.value
                            : [];
                          if (!existingTags.includes(nextTag)) {
                            field.onChange([...existingTags, nextTag]);
                          }
                          setTagInput("");
                        }
                      }}
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {(field.value ?? []).map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="cursor-pointer"
                          onClick={() =>
                            field.onChange(
                              (field.value ?? []).filter((t) => t !== tag),
                            )
                          }
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              />

              <div className="flex items-center justify-between">
                <label htmlFor="is_collaboration" className="text-sm">
                  This is a collaboration event{" "}
                  <span className="text-xs text-muted-foreground">
                    (optional)
                  </span>
                </label>
                <Controller
                  control={control}
                  name="is_collaboration"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="is_collaboration"
                    />
                  )}
                />
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="is_featured" className="text-sm">
                  Feature this event{" "}
                  <span className="text-xs text-muted-foreground">
                    (optional)
                  </span>
                </label>
                <Controller
                  control={control}
                  name="is_featured"
                  render={({ field }) => (
                    <Switch
                      checked={Boolean(field.value)}
                      onCheckedChange={field.onChange}
                      id="is_featured"
                    />
                  )}
                />
              </div>

              {watch("is_collaboration") ? (
                isEdit && initialData?.id ? (
                  <EventSearch mode="invite" eventId={initialData.id} />
                ) : (
                  <p className="text-xs text-muted-foreground">
                    You can add collaborators after creating the event from the
                    manage screen.
                  </p>
                )
              ) : null}

              <div className="rounded-md border border-dashed p-3">
                <p className="text-sm font-medium">Linked tasks</p>
                <p className="text-xs text-muted-foreground">
                  Coming soon (optional)
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Co-owners{" "}
                  <span className="text-xs text-muted-foreground">
                    (optional)
                  </span>
                </p>
                <MuidSearchInput
                  onSelectUser={(user) => {
                    if (
                      selectedCoOwners.some(
                        (owner) => owner.user_id === user.id,
                      )
                    ) {
                      return;
                    }
                    setSelectedCoOwners((prev) => [
                      ...prev,
                      {
                        user_id: user.id,
                        role: "co_owner",
                        full_name: user.full_name,
                        muid: user.muid,
                      },
                    ]);
                  }}
                  placeholder="Search by name or muid..."
                />
                <div className="flex flex-wrap gap-2">
                  {selectedCoOwners.map((owner) => (
                    <Badge
                      key={owner.user_id}
                      variant="outline"
                      className="cursor-pointer gap-1"
                      onClick={() =>
                        setSelectedCoOwners((prev) =>
                          prev.filter((item) => item.user_id !== owner.user_id),
                        )
                      }
                    >
                      {owner.full_name}
                      <span className="text-muted-foreground text-xs">
                        ({owner.muid})
                      </span>
                      ✕
                    </Badge>
                  ))}
                </div>
              </div>
            </section>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={requestClose}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={disableSaveActions}
                onClick={handleSubmit((values) => onSubmit(values, "draft"))}
              >
                {saveButtonLabel}
              </Button>
              <Button
                type="button"
                disabled={disableSaveActions || !canPublish}
                title={
                  !canPublish
                    ? `Cannot publish events with status "${eventStatus}". Save as draft and update from the manage page.`
                    : ""
                }
                onClick={handleSubmit((values) => onSubmit(values, "publish"))}
              >
                Save and Publish
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={exitConfirmOpen}
        onOpenChange={setExitConfirmOpen}
        title="Do you really want to exit?"
        description="Any unsaved changes in this event form will be lost."
        onConfirm={confirmExit}
        variant="warning"
        confirmLabel="Yes"
        cancelLabel="No"
      />
    </>
  );
}
