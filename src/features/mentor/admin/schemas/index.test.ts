import { describe, expect, it } from "vitest";
import {
  MentorApplicationListItemSchema,
  MentorDetailResponseSchema,
  MentorListResponseSchema,
  MentorRosterItemSchema,
} from "./index";

// Mirrors MentorApplicationListSerializer.Meta.fields
// (mulearnbackend/api/dashboard/mentor/serializers.py) incl. org_name.
const application = {
  id: "a1",
  user_id: "u1",
  user_full_name: "Meera Mentor",
  user_email: "meera@example.com",
  muid: "meera@mulearn",
  reason: "Want to give back",
  preferred_ig_ids: ["ig-1", "ig-2"],
  verification_note: null,
  verified_at: null,
  mentor_tier: "IG_MENTOR",
  org: "org-9",
  org_name: "Acme Labs",
  status: "GRANT_REVOKED",
  created_at: "2026-09-01T10:00:00Z",
  updated_at: "2026-09-02T10:00:00Z",
};

describe("MentorApplicationListItemSchema", () => {
  it("parses a revoked application and keeps org_name and IG ids", () => {
    const parsed = MentorApplicationListItemSchema.safeParse(application);
    expect(parsed.success).toBe(true);
    expect(parsed.success && parsed.data.org_name).toBe("Acme Labs");
    expect(parsed.success && parsed.data.preferred_ig_ids).toEqual([
      "ig-1",
      "ig-2",
    ]);
  });
});

describe("mentor detail response", () => {
  const detail = { statusCode: 200, response: application };

  it("parses with the single-object detail schema", () => {
    expect(MentorDetailResponseSchema.safeParse(detail).success).toBe(true);
  });

  it("does not fit the paginated list schema (why detail needs its own)", () => {
    expect(MentorListResponseSchema.safeParse(detail).success).toBe(false);
  });
});

describe("MentorRosterItemSchema", () => {
  it("keeps created_at for the Joined column", () => {
    const parsed = MentorRosterItemSchema.safeParse({
      id: "m1",
      user_full_name: "Meera Mentor",
      avg_rating: 4.5,
      rating_count: 6,
      created_at: "2026-08-01T10:00:00Z",
    });
    expect(parsed.success && parsed.data.created_at).toBe(
      "2026-08-01T10:00:00Z",
    );
  });
});
