import type { CreateEventSchema } from "../schemas/events.schema";

export interface EventTemplateInput {
  title: string;
  description?: string | null;
  event_type?: string | null;
  default_duration_minutes?: number | null;
}

const DEFAULT_DURATION_MINUTES = 60;
// Same lead time the wizard uses for a fresh event.
const START_LEAD_MINUTES = 15;

/** Date → "YYYY-MM-DDTHH:mm" in local time (datetime-local value). */
function toLocalInput(date: Date): string {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

/**
 * Prefill wizard fields from a company event template: its title,
 * description and type, and a start 15 minutes from now that lasts the
 * template's default duration (one hour when unset).
 */
export function applyEventTemplate(
  template: EventTemplateInput,
  now: Date,
): Partial<CreateEventSchema> {
  const start = new Date(now.getTime() + START_LEAD_MINUTES * 60000);
  start.setSeconds(0, 0);
  const minutes =
    template.default_duration_minutes && template.default_duration_minutes > 0
      ? template.default_duration_minutes
      : DEFAULT_DURATION_MINUTES;
  const end = new Date(start.getTime() + minutes * 60000);

  const values: Partial<CreateEventSchema> = {
    title: template.title,
    start_datetime: toLocalInput(start),
    end_datetime: toLocalInput(end),
  };
  if (template.description) values.description = template.description;
  if (template.event_type) values.event_type = template.event_type;
  return values;
}
