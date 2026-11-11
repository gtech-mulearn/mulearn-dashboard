import { describe, expect, it } from "vitest";
import {
  aggregateMentorStatus,
  mentorTierLabel,
  pickPrimaryApplication,
} from "./mentor-status";

// GET mentor/status/ returns every application, newest first (release 1.91).
const pendingChangeRequest = {
  id: "p",
  status: "PENDING",
  mentor_tier: "COMPANY_MENTOR",
  organization: "Acme",
  created_at: "2026-11-02T10:00:00Z",
};
const approvedIg = {
  id: "a",
  status: "APPROVED",
  mentor_tier: "IG_MENTOR",
  organization: null,
  created_at: "2026-10-01T10:00:00Z",
};

describe("aggregateMentorStatus", () => {
  it("aggregates approved over newer pending", () => {
    const s = aggregateMentorStatus([pendingChangeRequest, approvedIg]);
    expect(s.status).toBe("APPROVED");
    expect(s.pendingApplication?.id).toBe("p");
    expect(s.approvedApplications.map((a) => a.id)).toEqual(["a"]);
  });

  it("points edits at the pending application", () => {
    const s = aggregateMentorStatus([pendingChangeRequest, approvedIg]);
    expect(s.id).toBe("p");
    expect(s.mentor_tier).toBe("COMPANY_MENTOR");
    expect(s.organization).toBe("Acme");
  });

  it("does not depend on the response order", () => {
    const s = aggregateMentorStatus([approvedIg, pendingChangeRequest]);
    expect(s.pendingApplication?.id).toBe("p");
    expect(s.applications.map((a) => a.id)).toEqual(["p", "a"]);
  });

  it("treats a revoked grant as a rejection with an explanation", () => {
    const s = aggregateMentorStatus([{ id: "g", status: "GRANT_REVOKED" }]);
    expect(s.status).toBe("REJECTED");
    expect(s.rejection_reason).toBe("Your mentor access was revoked.");
  });

  it("keeps the backend's rejection reason", () => {
    const s = aggregateMentorStatus([
      { id: "r", status: "REJECTED", rejection_reason: "Need more detail" },
    ]);
    expect(s.status).toBe("REJECTED");
    expect(s.rejection_reason).toBe("Need more detail");
  });

  it("still reads the legacy single-object shape", () => {
    const s = aggregateMentorStatus({ status: "approved", id: "x" });
    expect(s.status).toBe("APPROVED");
    expect(s.id).toBe("x");
  });

  it("returns an empty application list when there is nothing to read", () => {
    expect(aggregateMentorStatus([]).applications).toEqual([]);
    expect(aggregateMentorStatus(null).applications).toEqual([]);
  });
});

describe("mentorTierLabel", () => {
  it("names each tier for people", () => {
    expect(mentorTierLabel("IG_MENTOR")).toBe("IG Mentor");
    expect(mentorTierLabel("CAMPUS_MENTOR")).toBe("Campus Mentor");
    expect(mentorTierLabel("COMPANY_MENTOR")).toBe("Company Mentor");
    expect(mentorTierLabel(null)).toBe("mentor");
  });
});

describe("pickPrimaryApplication", () => {
  it("prefers an approved application over a newer pending one", () => {
    expect(
      pickPrimaryApplication([
        { id: "new", status: "PENDING", updated_at: "2026-11-05" },
        { id: "ok", status: "APPROVED", updated_at: "2026-10-01" },
      ])?.id,
    ).toBe("ok");
  });

  it("picks the most recently updated application regardless of order", () => {
    expect(
      pickPrimaryApplication([
        { id: "newer", status: "REJECTED", updated_at: "2026-02-01" },
        { id: "old", status: "REJECTED", updated_at: "2026-01-01" },
      ])?.id,
    ).toBe("newer");
    expect(
      pickPrimaryApplication([
        { id: "old", status: "REJECTED", updated_at: "2026-01-01" },
        { id: "newer", status: "REJECTED", updated_at: "2026-02-01" },
      ])?.id,
    ).toBe("newer");
  });

  it("returns undefined for an empty list", () => {
    expect(pickPrimaryApplication([])).toBeUndefined();
  });
});
