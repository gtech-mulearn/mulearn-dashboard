/**
 * Events — pure transforms / normalizers
 *
 * 📍 src/features/events/hooks/events.transforms.ts
 *
 * Framework-free helpers that map raw API payloads and form values to/from the
 * shapes the UI uses. Extracted out of events.hooks.ts so the data-access hooks
 * stay focused on querying/mutating (SRP) and these transforms can be unit
 * tested in isolation.
 */

import type {
  CollaborationTarget,
  CollaboratorType,
  EventType,
} from "../types";

type CollaborationTargetBucketKey = "ig" | "campus" | "company" | "campus_ig";

interface CollaborationTargetSourceShape {
  data?: unknown;
  response?: unknown;
  ig?: unknown;
  campus?: unknown;
  company?: unknown;
  campus_ig?: unknown;
}

export function resolveEventTypeValue(
  eventType?: string | null,
  categoryName?: string | null,
): EventType | undefined {
  const raw = eventType || categoryName;
  if (!raw || typeof raw !== "string") return undefined;

  const normalized = raw.trim().toLowerCase().replace(/\s+/g, "_");
  if (normalized === "other") {
    return "others";
  }
  return normalized as EventType;
}

// Convert a datetime-local string (e.g. "2026-03-22T10:00") to a full ISO string in UTC.
export function toISOWithOffset(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  if (value.includes("+") || value.includes("Z")) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

// Convert an API ISO string back to "YYYY-MM-DDTHH:mm" for datetime-local inputs.
export function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (num: number) => num.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function normalizeTarget(
  item: unknown,
  collaboratorType?: CollaboratorType,
): CollaborationTarget | null {
  if (!item || typeof item !== "object") return null;

  const value = item as Record<string, unknown>;
  const id =
    (value.id as string | undefined) ??
    (value.ig_id as string | undefined) ??
    (value.org_id as string | undefined) ??
    (value.company_id as string | undefined) ??
    (value.campus_id as string | undefined) ??
    (value.campus_ig_id as string | undefined);
  const name =
    (value.name as string | undefined) ??
    (value.title as string | undefined) ??
    (value.ig_name as string | undefined) ??
    (value.org_name as string | undefined) ??
    (value.company_name as string | undefined);

  const targetType =
    (value.collaborator_type as CollaboratorType | undefined) ??
    collaboratorType ??
    "ig";

  if (!id || !name) return null;

  return {
    id,
    name,
    collaborator_type: targetType,
    logo: (value.logo as string | null | undefined) ?? null,
    icon: (value.icon as string | undefined) ?? undefined,
    code: (value.code as string | undefined) ?? undefined,
    title: (value.title as string | undefined) ?? undefined,
    org_type: (value.org_type as "College" | "School" | undefined) ?? undefined,
  };
}

function dedupeTargets(targets: CollaborationTarget[]): CollaborationTarget[] {
  const uniqueTargets = new Map<string, CollaborationTarget>();

  for (const target of targets) {
    if (!uniqueTargets.has(target.id)) {
      uniqueTargets.set(target.id, target);
    }
  }

  return Array.from(uniqueTargets.values());
}

export function normalizeCollaborationTargets(
  data: unknown,
): CollaborationTarget[] {
  if (!data || typeof data !== "object") {
    return [];
  }

  const shaped = data as CollaborationTargetSourceShape;
  const bucketKeys: CollaborationTargetBucketKey[] = [
    "ig",
    "campus",
    "campus_ig",
    "company",
  ];
  const hasBuckets = bucketKeys.some((key) => Array.isArray(shaped[key]));

  if (hasBuckets) {
    return dedupeTargets(
      bucketKeys.flatMap((type) => {
        const items = Array.isArray(shaped[type])
          ? (shaped[type] as unknown[])
          : [];
        return items
          .map((item) => normalizeTarget(item, type))
          .filter((item): item is CollaborationTarget => Boolean(item));
      }),
    );
  }

  if (Array.isArray(data)) {
    return dedupeTargets(
      data
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const value = item as Record<string, unknown>;
          const type =
            (value.collaborator_type as CollaboratorType | undefined) ?? "ig";
          return normalizeTarget(item, type);
        })
        .filter((item): item is CollaborationTarget => Boolean(item)),
    );
  }

  if (shaped.response && typeof shaped.response === "object") {
    return normalizeCollaborationTargets(shaped.response);
  }

  if (Array.isArray(shaped.data)) {
    return normalizeCollaborationTargets(shaped.data);
  }

  return [];
}
