import { describe, expect, it } from "vitest";
import {
  COLLAB_TYPES,
  CompanyCollaborationListResponseSchema,
} from "../schemas/jobs.schema";
import {
  buildCollaborationPayload,
  COLLAB_TYPE_LABELS,
} from "./collaboration-payload";

// Field list of the backend's CollaborationSerializer (release 1.91).
const sample = {
  id: "c1",
  company_name: "Acme",
  company_logo: null,
  collab_type: "EVENT_COHOST",
  title: "Hack night",
  description: null,
  target_type: null,
  target_org_id: null,
  event_id: null,
  status: "OPEN",
  responded_by_name: null,
  responded_at: null,
  rejection_reason: null,
  created_at: "2026-11-01T10:00:00Z",
};

const envelope = (response: unknown) => ({
  hasError: false,
  statusCode: 200,
  message: { general: [] },
  response,
});

const pagination = {
  count: 1,
  totalPages: 1,
  isNext: false,
  isPrev: false,
  nextPage: null,
};

describe("buildCollaborationPayload", () => {
  it("posts an open collaboration with just a type and title", () => {
    expect(
      buildCollaborationPayload({ collab_type: "EVENT_COHOST", title: "T" }),
    ).toEqual({ collab_type: "EVENT_COHOST", title: "T" });
  });

  it("trims text and drops an empty description", () => {
    expect(
      buildCollaborationPayload({
        collab_type: "MENTORSHIP_EXCHANGE",
        title: "  Mentor swap ",
        description: "   ",
      }),
    ).toEqual({ collab_type: "MENTORSHIP_EXCHANGE", title: "Mentor swap" });
    expect(
      buildCollaborationPayload({
        collab_type: "MENTORSHIP_EXCHANGE",
        title: "T",
        description: " Details ",
      }).description,
    ).toBe("Details");
  });

  it("invites a specific campus or interest group", () => {
    expect(
      buildCollaborationPayload({
        collab_type: "CAMPUS_PARTNERSHIP",
        title: "T",
        target: { type: "CAMPUS", orgId: "o1" },
      }),
    ).toMatchObject({ target_type: "CAMPUS", target_org_id: "o1" });
  });

  it("never sends a target type without its id", () => {
    expect(
      buildCollaborationPayload({
        collab_type: "IG_SPONSORSHIP",
        title: "T",
        target: { type: "IG", orgId: "" },
      }),
    ).toEqual({ collab_type: "IG_SPONSORSHIP", title: "T" });
  });

  it("labels every backend collaboration type", () => {
    expect(Object.keys(COLLAB_TYPE_LABELS).sort()).toEqual(
      [...COLLAB_TYPES].sort(),
    );
    expect(COLLAB_TYPE_LABELS.EVENT_COHOST).toBe("Event Co-host");
  });
});

describe("CompanyCollaborationListResponseSchema", () => {
  it("reads the paginated {data, pagination} envelope", () => {
    const parsed = CompanyCollaborationListResponseSchema.parse(
      envelope({ data: [sample], pagination }),
    );
    expect(parsed.response.data).toHaveLength(1);
    expect(parsed.response.pagination.totalPages).toBe(1);
  });

  it("tolerates lowercase enum values", () => {
    const parsed = CompanyCollaborationListResponseSchema.parse(
      envelope({
        data: [{ ...sample, status: "pending", target_type: "campus" }],
        pagination,
      }),
    );
    expect(parsed.response.data[0]).toMatchObject({
      status: "PENDING",
      target_type: "CAMPUS",
    });
  });
});
