/**
 * Datetime conversion helpers for `<input type="datetime-local">`-style pickers.
 *
 * The pickers work in the browser's LOCAL wall-clock ("YYYY-MM-DDTHH:mm"), while
 * the backend stores/returns UTC ISO instants (Django USE_TZ=True, TIME_ZONE=UTC).
 * These two functions are the single place that bridges the two representations,
 * so a time entered as 8:41 PM is stored/rendered as 8:41 PM — not shifted by the
 * local UTC offset.
 */

/**
 * Local wall-clock string ("YYYY-MM-DDTHH:mm", browser timezone) → UTC ISO
 * instant for the backend. Values that already carry timezone info, or that
 * aren't a datetime-local string (e.g. a date-only value), are passed through.
 */
export function localInputToUtcIso(value?: string | null): string | undefined {
  if (!value) return undefined;
  // Already has an explicit zone (…Z or ±hh:mm) — leave as-is.
  if (/[zZ]$|[+-]\d{2}:\d{2}$/.test(value)) return value;
  // Only datetime-local ("YYYY-MM-DDTHH:mm") values are treated as local time.
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return value;
  const d = new Date(value); // parsed in the browser's local timezone
  return Number.isNaN(d.getTime()) ? value : d.toISOString();
}

/**
 * UTC ISO instant → local wall-clock string ("YYYY-MM-DDTHH:mm") for seeding a
 * datetime-local picker. Returns "" for missing/invalid input.
 */
export function utcIsoToLocalInput(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}
