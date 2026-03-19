"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, type Resolver, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateEvent, usePatchEvent } from "../hooks";
import {
  type CreateEventSchema,
  createEventSchema,
  updateEventSchema,
} from "../schemas";
import type { EventListItem } from "../types";
import { VenueSection } from "./venue-section";

interface EventModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: Partial<EventListItem> | null;
  isEdit?: boolean;
}

const defaultValues: CreateEventSchema = {
  title: "",
  description: "",
  event_type: undefined,
  scope: "global",
  organiser_type: "admin",
  organiser_ig_id: undefined,
  organiser_campus_id: undefined,
  organiser_campus_ig_id: undefined,
  organiser_company_id: undefined,
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
  const patchEvent = usePatchEvent((initialData?.id as string) || "");

  const {
    control,
    register,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateEventSchema>({
    resolver: zodResolver(
      isEdit ? updateEventSchema : createEventSchema,
    ) as Resolver<CreateEventSchema>,
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;
    reset({
      ...defaultValues,
      title: initialData?.title ?? "",
      event_type: initialData?.event_type,
      scope: initialData?.scope ?? "global",
      start_datetime: initialData?.start_datetime ?? "",
      end_datetime: initialData?.end_datetime ?? "",
      venue_type: initialData?.venue_type ?? "online",
      city: initialData?.venue_city ?? undefined,
      min_karma: initialData?.min_karma ?? null,
      tags: initialData?.tags ?? [],
      is_featured: initialData?.is_featured ?? false,
    });
  }, [initialData, open, reset]);

  const scope = watch("scope");
  const organiserType = watch("organiser_type");

  const onSubmit = async (values: CreateEventSchema) => {
    const payload = values;

    if (isEdit && initialData?.id) {
      await patchEvent.mutateAsync(payload);
    } else {
      await createEvent.mutateAsync(payload);
    }

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(state) => !state && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Event" : "Create Event"}</DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
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
            <h3 className="font-semibold">Type & Scope</h3>
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

          <section className="space-y-3 rounded-lg border p-4">
            <h3 className="font-semibold">Organiser</h3>
            <select
              className="h-10 w-full rounded-md border px-3 text-sm"
              {...register("organiser_type")}
            >
              <option value="admin">Admin</option>
              <option value="global_ig">Global IG</option>
              <option value="campus_ig">Campus IG</option>
              <option value="campus">Campus</option>
              <option value="company">Company</option>
            </select>

            {organiserType === "global_ig" ? (
              <Input
                placeholder="Organiser IG UUID"
                {...register("organiser_ig_id")}
              />
            ) : null}
            {organiserType === "campus" ? (
              <Input
                placeholder="Organiser campus UUID"
                {...register("organiser_campus_id")}
              />
            ) : null}
            {organiserType === "campus_ig" ? (
              <Input
                placeholder="Organiser campus IG UUID"
                {...register("organiser_campus_ig_id")}
              />
            ) : null}
            {organiserType === "company" ? (
              <Input
                placeholder="Organiser company UUID"
                {...register("organiser_company_id")}
              />
            ) : null}
          </section>

          <section className="space-y-3 rounded-lg border p-4">
            <h3 className="font-semibold">Dates</h3>
            <Input type="datetime-local" {...register("start_datetime")} />
            {errors.start_datetime?.message ? (
              <p className="text-xs text-red-600">
                {errors.start_datetime.message}
              </p>
            ) : null}
            <Input type="datetime-local" {...register("end_datetime")} />
            {errors.end_datetime?.message ? (
              <p className="text-xs text-red-600">
                {errors.end_datetime.message}
              </p>
            ) : null}
          </section>

          <VenueSection control={control} watch={watch} errors={errors} />

          <section className="space-y-3 rounded-lg border p-4">
            <h3 className="font-semibold">Registration</h3>
            <Input
              placeholder="Registration URL"
              {...register("registration_url")}
            />
            <Input
              type="datetime-local"
              {...register("registration_deadline")}
            />
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
            <h3 className="font-semibold">Tags & Collaboration</h3>
            <Controller
              control={control}
              name="tags"
              render={({ field }) => (
                <Input
                  placeholder="Tags (comma separated)"
                  value={
                    Array.isArray(field.value) ? field.value.join(", ") : ""
                  }
                  onChange={(e) => {
                    const tags = e.target.value
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean);
                    field.onChange(tags);
                  }}
                />
              )}
            />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("is_collaboration")} />
              This is a collaboration event
            </label>
          </section>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createEvent.isPending || patchEvent.isPending}
            >
              {isEdit ? "Save Changes" : "Create Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
