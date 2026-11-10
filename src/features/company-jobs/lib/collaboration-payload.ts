import type { CollabTargetType, CollabType } from "../types";

export const COLLAB_TYPE_LABELS: Record<CollabType, string> = {
  EVENT_COHOST: "Event Co-host",
  IG_SPONSORSHIP: "IG Sponsorship",
  CAMPUS_PARTNERSHIP: "Campus Partnership",
  MENTORSHIP_EXCHANGE: "Mentorship Exchange",
};

export const COLLAB_TARGET_LABELS: Record<CollabTargetType, string> = {
  CAMPUS: "Campus",
  IG: "Interest group",
};

/** Body for POST company/collaborations/. */
export interface CollaborationCreatePayload {
  collab_type: CollabType;
  title: string;
  description?: string;
  target_type?: CollabTargetType;
  target_org_id?: string;
}

export interface CollaborationForm {
  collab_type: CollabType;
  title: string;
  description?: string;
  target?: { type: CollabTargetType; orgId: string } | null;
}

/**
 * Without a target the backend posts an OPEN discovery post; with both
 * target_type and target_org_id it invites that campus/IG (PENDING). A type
 * without an id would be stored as an open post with a dangling type, so it
 * is never sent alone.
 */
export function buildCollaborationPayload(
  form: CollaborationForm,
): CollaborationCreatePayload {
  const payload: CollaborationCreatePayload = {
    collab_type: form.collab_type,
    title: form.title.trim(),
  };
  const description = form.description?.trim();
  if (description) payload.description = description;
  const orgId = form.target?.orgId.trim();
  if (form.target && orgId) {
    payload.target_type = form.target.type;
    payload.target_org_id = orgId;
  }
  return payload;
}
