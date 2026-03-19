import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateEvent, useUpdateEvent } from "../hooks/events.hooks";
import type {
  CreateEventPayload,
  Event,
  UpdateEventPayload,
} from "../types/events.types";

interface EventModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: Partial<Event> | null;
  isEdit?: boolean;
}

const defaultEvent: Partial<Event> = {
  name: "",
  description: "",
  event_type: "online",
  ticket_type: "free",
  ticket_value: "0",
  event_start_time: "09:00:00",
  event_end_time: "18:00:00",
};

const EventModal: React.FC<EventModalProps> = ({
  open,
  onClose,
  initialData,
  isEdit,
}) => {
  const [form, setForm] = useState<Partial<Event>>(initialData || defaultEvent);
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent(form.id || "");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ticketValue =
      form.ticket_value !== undefined && form.ticket_value !== null
        ? Number(form.ticket_value)
        : undefined;
    const payload: CreateEventPayload = {
      name: form.name || "",
      description: form.description || "",
      event_type: form.event_type || "online",
      ticket_type: form.ticket_type || "free",
      registration_start_date: form.registration_start_date || undefined,
      registration_end_date: form.registration_end_date || undefined,
      event_start_date: form.event_start_date || undefined,
      event_end_date: form.event_end_date || undefined,
      event_start_time: form.event_start_time || undefined,
      event_end_time: form.event_end_time || undefined,
      user_limit: form.user_limit ?? undefined,
      cover_image: form.cover_image || undefined,
      location_name: form.location_name || undefined,
      location_address: form.location_address || undefined,
      ticket_value: Number.isNaN(ticketValue) ? undefined : ticketValue,
      link: form.link || undefined,
      category: form.category || undefined,
      tag: form.tags || undefined,
    };
    if (isEdit && form.id) {
      await updateEvent.mutateAsync(payload as UpdateEventPayload);
    } else {
      await createEvent.mutateAsync(payload);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>{isEdit ? "Edit Event" : "Create Event"}</DialogTitle>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="name"
            value={form.name || ""}
            onChange={handleChange}
            placeholder="Event Name"
            required
          />
          <Textarea
            name="description"
            value={form.description || ""}
            onChange={handleChange}
            placeholder="Description"
            required
          />
          <Input
            name="cover_image"
            value={form.cover_image || ""}
            onChange={handleChange}
            placeholder="Cover Image URL"
          />
          <Input
            name="event_start_date"
            value={form.event_start_date || ""}
            onChange={handleChange}
            placeholder="Start Date (YYYY-MM-DD)"
          />
          <Input
            name="event_end_date"
            value={form.event_end_date || ""}
            onChange={handleChange}
            placeholder="End Date (YYYY-MM-DD)"
          />
          <Input
            name="event_start_time"
            value={form.event_start_time || ""}
            onChange={handleChange}
            placeholder="Start Time (HH:MM:SS)"
          />
          <Input
            name="event_end_time"
            value={form.event_end_time || ""}
            onChange={handleChange}
            placeholder="End Time (HH:MM:SS)"
          />
          <Input
            name="location_name"
            value={form.location_name || ""}
            onChange={handleChange}
            placeholder="Location Name"
          />
          <Input
            name="ticket_value"
            value={form.ticket_value || ""}
            onChange={handleChange}
            placeholder="Ticket Value"
          />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="default">
              {isEdit ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventModal;
