import type { CollaborationTarget, CollaboratorType } from "../types";

type CollaborationTargetBucketKey = "ig" | "campus" | "company" | "campus_ig";

interface CollaborationTargetSourceShape {
  data?: unknown;
  results?: unknown;
  response?: unknown;
  ig?: unknown;
  campus?: unknown;
  company?: unknown;
  campus_ig?: unknown;
}

function extractTargetArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];

  const shaped = value as CollaborationTargetSourceShape;

  if (Array.isArray(shaped.data)) return shaped.data;
  if (Array.isArray(shaped.results)) return shaped.results;

  if (shaped.response && typeof shaped.response === "object") {
    const response = shaped.response as CollaborationTargetSourceShape;
    if (Array.isArray(response.data)) return response.data;

    const nestedBuckets = [
      response.ig,
      response.campus,
      response.company,
      response.campus_ig,
    ];
    if (nestedBuckets.some(Array.isArray)) {
      return nestedBuckets.flatMap((bucket) =>
        Array.isArray(bucket) ? bucket : [],
      );
    }
  }

  const bucketValues = [
    shaped.ig,
    shaped.campus,
    shaped.company,
    shaped.campus_ig,
  ];
  if (bucketValues.some(Array.isArray)) {
    return bucketValues.flatMap((bucket) =>
      Array.isArray(bucket) ? bucket : [],
    );
  }

  return [];
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
  };
}

export function normalizeCollaborationTargets(
  data: unknown,
): CollaborationTarget[] {
  const source = extractTargetArray(data);
  if (source.length > 0) {
    return source
      .map((item) => normalizeTarget(item))
      .filter((item): item is CollaborationTarget => Boolean(item));
  }

  if (!data || typeof data !== "object") return [];

  const shaped = data as CollaborationTargetSourceShape;
  const buckets: Array<[CollaborationTargetBucketKey, unknown]> = [
    ["ig", shaped.ig],
    ["campus", shaped.campus],
    ["company", shaped.company],
    ["campus_ig", shaped.campus_ig],
  ];

  return buckets.flatMap(([bucketType, bucketValue]) => {
    if (!Array.isArray(bucketValue)) return [];

    return bucketValue
      .map((item) => normalizeTarget(item, bucketType))
      .filter((item): item is CollaborationTarget => Boolean(item));
  });
}
