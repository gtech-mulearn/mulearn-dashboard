"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Controller, type Resolver, useForm } from "react-hook-form";
import { toast } from "sonner";
import { apiClient, endpoints } from "@/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { eventsApi } from "../api";
import { useCreateEvent, useOrganizerOptions, usePatchEvent } from "../hooks";
import {
  type CreateEventSchema,
  createEventSchema,
  updateEventSchema,
} from "../schemas";
import type {
  EventCoOwnerInput,
  EventDetail,
  EventDetailManage,
  EventListItem,
  EventPatchBody,
  EventWriteBody,
  OrganizerOptionsResponse,
  OrganizerType,
} from "../types";
import { CollaboratorSearchInput } from "./collaborator-search-input";
import { EntitySearchSelect } from "./entity-search-select";
import { UserSearchInput } from "./user-search-input";
import { VenueSection } from "./venue-section";

// Convert a datetime-local string (e.g. "2026-03-22T10:00") to a full ISO string
// in UTC (ending in 'Z') for the backend.
function toISOWithOffset(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.includes("+") || value.includes("Z")) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

// Convert a full ISO string from the API back to "YYYY-MM-DDTHH:mm" for datetime-local inputs.
function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

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

const defaultValues: CreateEventSchema = {
  title: "",
  description: "",
  event_type: undefined,
  scope: "global",
  start_datetime: "",
  end_datetime: "",
  venue_type: "online",
  address: "",
  city: "",
  maps_url: "",
  online_link: "",
  platform: "",
  cover_image: "",
  banner_image: "",
  registration_url: "",
  registration_deadline: null,
  min_karma: null,
  linked_tasks: [],
  co_owners: [],
  is_collaboration: false,
  target_campus_id: null,
  target_ig_id: null,
  target_campus_ig_id: null,
  tags: [],
  is_featured: false,
};

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

    const igs = safeArray<OrganizerOptionsResponse["can_create_as_ig"][number]>(
      options.can_create_as_ig ?? options.canCreateAsIg,
    );
    const campusIgs = safeArray<
      OrganizerOptionsResponse["can_create_as_campus_ig"][number]
    >(options.can_create_as_campus_ig ?? options.canCreateAsCampusIg);
    const campuses = safeArray<
      OrganizerOptionsResponse["can_create_as_campus"][number]
    >(options.can_create_as_campus ?? options.canCreateAsCampus);
    const companies = safeArray<
      OrganizerOptionsResponse["can_create_as_company"][number]
    >(options.can_create_as_company ?? options.canCreateAsCompany);
    const canCreateAsAdmin = Boolean(
      options.can_create_as_admin ?? options.canCreateAsAdmin,
    );

    const all: SelectedOrganiser[] = [];

    for (const ig of igs) {
      all.push({ label: ig.name, type: "global_ig", id: ig.id });
    }

    for (const campusIg of campusIgs) {
      all.push({
        label: `${campusIg.ig.name} - ${campusIg.campus.name}`,
        type: "campus_ig",
        id: campusIg.id,
      });
    }

    for (const campus of campuses) {
      all.push({ label: campus.name, type: "campus", id: campus.id });
    }

    for (const company of companies) {
      all.push({ label: company.name, type: "company", id: company.id });
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
  const [selectedCoOwners, setSelectedCoOwners] = useState<EventCoOwnerInput[]>(
    [],
  );
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [selectedCampusName, setSelectedCampusName] = useState<string>("");
  const [selectedIgName, setSelectedIgName] = useState<string>("");
  const [selectedCampusIgName, setSelectedCampusIgName] = useState<string>("");
  const [tagInput, setTagInput] = useState("");

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
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;
    const d = initialData as Partial<EventDetailManage> | null | undefined;
    reset({
      ...defaultValues,
      title: d?.title ?? "",
      description: d?.description ?? "",
      event_type: d?.event_type,
      scope: d?.scope ?? "global",
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
      target_campus_id: d?.target_campus?.id ?? null,
      target_ig_id: d?.target_ig?.id ?? null,
      target_campus_ig_id: d?.target_campus_ig?.id ?? null,
      tags: d?.tags ?? [],
      is_featured: d?.is_featured ?? false,
    });
    setSelectedCoOwners(
      d?.co_owners?.map((owner) => ({
        user_id: owner.user.id,
        role: owner.role,
      })) ?? [],
    );
    setCoverImageFile(null);
    setBannerImageFile(null);
    setSelectedCampusName(d?.target_campus?.name ?? "");
    setSelectedIgName(d?.target_ig?.name ?? "");
    setSelectedCampusIgName(
      d?.target_campus_ig
        ? `${d.target_campus_ig.ig.name} @ ${d.target_campus_ig.campus.name}`
        : "",
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

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

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
    if (!selectedOrganiser && shouldRequireOrganizer) {
      setError("title", {
        type: "manual",
        message: "Select an organiser before saving",
      });
      return;
    }

    const coverBase64 = coverImageFile
      ? await toBase64(coverImageFile)
      : (values.cover_image ?? null);
    const bannerBase64 = bannerImageFile
      ? await toBase64(bannerImageFile)
      : (values.banner_image ?? null);

    if (!selectedOrganiser) {
      // This should not happen if validation works, but type guard for safety
      setError("title", {
        type: "manual",
        message: "Organizer selection is required",
      });
      return;
    }

    const payload: EventWriteBody = {
      ...values,
      start_datetime: start as string,
      end_datetime: end as string,
      registration_deadline: deadline,
      cover_image: coverBase64,
      banner_image: bannerBase64,
      organiser_type: selectedOrganiser.type,
      organiser_ig_id:
        selectedOrganiser.type === "global_ig"
          ? selectedOrganiser.id
          : undefined,
      organiser_campus_id:
        selectedOrganiser.type === "campus" ? selectedOrganiser.id : undefined,
      organiser_campus_ig_id:
        selectedOrganiser.type === "campus_ig"
          ? selectedOrganiser.id
          : undefined,
      organiser_company_id:
        selectedOrganiser.type === "company" ? selectedOrganiser.id : undefined,
      co_owners: selectedCoOwners,
    };

    try {
      let savedEventId = initialData?.id;

      if (isEdit && initialData?.id) {
        const updated = await patchEvent.mutateAsync(payload as EventPatchBody);
        savedEventId = updated.id;
      } else if (!isEdit) {
        const created = await createEvent.mutateAsync(
          payload as EventWriteBody,
        );
        savedEventId = created.id;
      }

      if (action === "publish" && savedEventId) {
        try {
          await eventsApi.publish(savedEventId);
        } catch {
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
    <Dialog open={open} onOpenChange={(state) => !state && onClose()}>
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
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label
                  htmlFor="event_type"
                  className="text-sm font-medium text-foreground"
                >
                  Event type <span className="text-red-500">*</span>
                </label>
                <select
                  id="event_type"
                  className="h-10 w-full rounded-md border px-3 text-sm"
                  {...register("event_type")}
                >
                  <option value="">Select event type</option>
                  <option value="workshop">Workshop</option>
                  <option value="webinar">Webinar</option>
                  <option value="hackathon">Hackathon</option>
                  <option value="meetup">Meetup</option>
                  <option value="competition">Competition</option>
                  <option value="social_gathering">Social Gathering</option>
                  <option value="other">Other</option>
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
                  <option value="global">Global</option>
                  <option value="campus">Campus</option>
                  <option value="ig">IG</option>
                  <option value="campus_ig">Campus IG</option>
                </select>
              </div>
            </div>

            {scope === "campus" ? (
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Target campus <span className="text-red-500">*</span>
                </p>
                <EntitySearchSelect
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
                <EntitySearchSelect
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
                <EntitySearchSelect
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

          {!hasOrganizerPermission ? (
            <section className="space-y-3 rounded-lg border p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                Organizer
              </h3>
              <p className="text-sm text-destructive">
                You do not have permission to create events. Contact an admin.
              </p>
            </section>
          ) : organizerOptions.length > 1 ? (
            <section className="space-y-3 rounded-lg border p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                Create as
              </h3>
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
            </section>
          ) : (
            <section className="space-y-3 rounded-lg border p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                Create as
              </h3>
              <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
                {selectedOrganizer?.label ?? "Organizer unavailable"}
              </div>
            </section>
          )}

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
              <div className="space-y-1">
                <label
                  htmlFor="cover_image"
                  className="text-xs text-muted-foreground"
                >
                  Or paste image URL
                </label>
                <Input
                  id="cover_image"
                  placeholder="https://example.com/cover.jpg"
                  {...register("cover_image")}
                />
              </div>
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
              <div className="space-y-1">
                <label
                  htmlFor="banner_image"
                  className="text-xs text-muted-foreground"
                >
                  Or paste image URL
                </label>
                <Input
                  id="banner_image"
                  placeholder="https://example.com/banner.jpg"
                  {...register("banner_image")}
                />
              </div>
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
                <CollaboratorSearchInput eventId={initialData.id} />
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
              <UserSearchInput
                onSelect={(user) => {
                  if (
                    selectedCoOwners.some((owner) => owner.user_id === user.id)
                  ) {
                    return;
                  }
                  setSelectedCoOwners((prev) => [
                    ...prev,
                    { user_id: user.id, role: "co_owner" },
                  ]);
                }}
                placeholder="Search by name or muid..."
              />
              <div className="flex flex-wrap gap-2">
                {selectedCoOwners.map((owner) => (
                  <Badge
                    key={owner.user_id}
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() =>
                      setSelectedCoOwners((prev) =>
                        prev.filter((item) => item.user_id !== owner.user_id),
                      )
                    }
                  >
                    {owner.user_id}
                  </Badge>
                ))}
              </div>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={disableSaveActions}
              onClick={handleSubmit((values) => onSubmit(values, "draft"))}
            >
              Save as Draft
            </Button>
            <Button
              type="button"
              disabled={disableSaveActions}
              onClick={handleSubmit((values) => onSubmit(values, "publish"))}
            >
              Save and Publish
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
