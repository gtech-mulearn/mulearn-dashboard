import { format, isValid, parse } from "date-fns";

const TIME_FORMATS = ["HH:mm:ss", "HH:mm"];

export function formatTime(time?: string | null): string {
  if (!time) return "";
  const trimmed = time.trim();
  const parsed = TIME_FORMATS.map((fmt) =>
    parse(trimmed, fmt, new Date()),
  ).find((d) => isValid(d));
  if (!parsed) return time;
  return format(parsed, "h:mm a");
}
