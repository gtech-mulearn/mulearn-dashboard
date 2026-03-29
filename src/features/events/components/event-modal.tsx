"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { Controller, type Resolver, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

    return all;
  }, [organizerOptionsQuery.data]);

  const [selectedOrganiserId, setSelectedOrganiserId] = useState<string>("");
  const [selectedCoOwners, setSelectedCoOwners] = useState<EventCoOwnerInput[]>(
    [],
  );
  const [tagInput, setTagInput] = useState("");

  const {
    control,
    register,
    watch,
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

  const scope = watch("scope");

  const isPending =
    createEvent.isPending || patchEvent.isPending || isSubmitting;

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

    const selectedOrganiser = organizerOptions.find(
      (option) => `${option.type}:${option.id}` === selectedOrganiserId,
    );
    if (!selectedOrganiser) {
      setError("title", {
        type: "manual",
        message: "Select an organiser before saving",
      });
      return;
    }

    const payload: EventWriteBody = {
      ...values,
      start_datetime: start as string,
      end_datetime: end as string,
      registration_deadline: deadline,
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Event" : "Create Event"}</DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <section className="space-y-3 rounded-lg border p-4">
            <h3 className="font-semibold">Basic Info</h3>
            <Input placeholder="Title" {...register("title")} />
            {errors.title?.message ? (
              <p className="text-xs text-red-600">{errors.title.message}</p>
            ) : null}
            <Textarea placeholder="Description" {...register("description")} />
            {errors.description?.message ? (
              <p className="text-xs text-red-600">
                {errors.description.message}
              </p>
            ) : null}
          </section>

          <section className="space-y-3 rounded-lg border p-4">
            <h3 className="font-semibold">Type &amp; Scope</h3>
            <select
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
            <select
              className="h-10 w-full rounded-md border px-3 text-sm"
              {...register("scope")}
            >
              <option value="global">Global</option>
              <option value="campus">Campus</option>
              <option value="ig">IG</option>
              <option value="campus_ig">Campus IG</option>
            </select>

            {scope === "campus" ? (
              <Input
                placeholder="Target campus UUID"
                {...register("target_campus_id")}
              />
            ) : null}
            {scope === "ig" ? (
              <Input
                placeholder="Target IG UUID"
                {...register("target_ig_id")}
              />
            ) : null}
            {scope === "campus_ig" ? (
              <Input
                placeholder="Target campus IG UUID"
                {...register("target_campus_ig_id")}
              />
            ) : null}
          </section>

          {organizerOptions.length > 1 ? (
            <section className="space-y-3 rounded-lg border p-4">
              <h3 className="font-semibold">Create as...</h3>
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
          ) : null}

          <section className="space-y-3 rounded-lg border p-4">
            <h3 className="font-semibold">Dates</h3>
            <div className="space-y-1">
              <label
                htmlFor="start_datetime"
                className="text-sm font-medium text-gray-700"
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
                className="text-sm font-medium text-gray-700"
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
            <h3 className="font-semibold">Images</h3>
            <div className="space-y-1">
              <label
                htmlFor="cover_image"
                className="text-sm font-medium text-gray-700"
              >
                Cover image URL
              </label>
              <Input
                id="cover_image"
                placeholder="https://..."
                {...register("cover_image")}
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="banner_image"
                className="text-sm font-medium text-gray-700"
              >
                Banner image URL
              </label>
              <Input
                id="banner_image"
                placeholder="https://..."
                {...register("banner_image")}
              />
            </div>
          </section>

          <section className="space-y-3 rounded-lg border p-4">
            <h3 className="font-semibold">Registration</h3>
            <Input
              placeholder="Registration URL"
              {...register("registration_url")}
            />
            <div className="space-y-1">
              <label
                htmlFor="registration_deadline"
                className="text-sm font-medium text-gray-700"
              >
                Registration deadline
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
                <Input
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
              )}
            />
          </section>

          <section className="space-y-3 rounded-lg border p-4">
            <h3 className="font-semibold">Tags &amp; Collaboration</h3>
            <Controller
              control={control}
              name="tags"
              render={({ field }) => (
                <div className="space-y-2">
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
                  <div className="flex flex-wrap gap-2">
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
                This is a collaboration event
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
              <p className="text-xs text-muted-foreground">Coming soon</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Co-owners</p>
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

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={handleSubmit((values) => onSubmit(values, "draft"))}
            >
              Save as Draft
            </Button>
            <Button
              type="button"
              disabled={isPending}
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
