import type { ActivityLogEntry } from "../../schemas";

/** Display only: the backend role title "Admins" reads better as "Admin". */
export function roleLabel(role: string) {
  return role === "Admins" ? "Admin" : role;
}

export function audienceText(entry: ActivityLogEntry) {
  if (entry.audience_size !== null) {
    return `${entry.audience_size.toLocaleString()} people`;
  }
  return entry.audience_label ?? "—";
}
