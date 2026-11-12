import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  CompanyFeedbackListResponseSchema,
  ImpactReportSchema,
} from "../schemas/jobs.schema";

const { apiGet, apiPatch } = vi.hoisted(() => ({
  apiGet: vi.fn(),
  apiPatch: vi.fn(),
}));
vi.mock("@/api/client", () => ({
  apiClient: { get: apiGet, patch: apiPatch },
  publicApiClient: { get: vi.fn() },
}));

import { fetchCompanyFeedbackList, setImpactReportPublished } from "./jobs.api";

// build_impact_summary() output (backend release 1.91).
const impactSample = {
  company: { id: "co1", name: "Acme" },
  reach: {
    total_learners_touched: 120,
    job_applicants: 80,
    task_completers: 30,
    event_attendees: 25,
    session_mentees: 6,
  },
  quality_signal: {
    average_rating: 4.4,
    total_ratings: 15,
    feedback_average_rating: 4.5,
    feedback_count: 10,
    session_average_rating: 4.2,
    session_rating_count: 5,
  },
  outcome_signal: { hires: 3, karma_distributed: 2500 },
};

const pagination = {
  count: 1,
  totalPages: 1,
  isNext: false,
  isPrev: false,
  nextPage: null,
};

describe("impact report and feedback contract", () => {
  beforeEach(() => vi.clearAllMocks());

  it("parses the nested impact report", () => {
    const report = ImpactReportSchema.parse(impactSample);
    expect(report.outcome_signal.hires).toBe(3);
    expect(report.reach.total_learners_touched).toBe(120);
  });

  it("keeps ratings empty when nobody has rated yet", () => {
    const report = ImpactReportSchema.parse({
      ...impactSample,
      quality_signal: {
        ...impactSample.quality_signal,
        average_rating: null,
        feedback_average_rating: null,
        session_average_rating: null,
      },
    });
    expect(report.quality_signal.average_rating).toBeNull();
  });

  it("parses the paginated feedback list", () => {
    const parsed = CompanyFeedbackListResponseSchema.parse({
      hasError: false,
      statusCode: 200,
      response: {
        data: [
          {
            id: "f1",
            interaction_type: "JOB",
            entity_id: "j1",
            submitted_by_name: "Asha",
            rating: 4,
            comment: "Smooth process",
            created_at: "2026-11-01T10:00:00Z",
          },
        ],
        pagination,
      },
    });
    expect(parsed.response.data[0].interaction_type).toBe("JOB");
  });

  it("sends { publish: false } to unpublish", async () => {
    apiPatch.mockResolvedValue({ hasError: false });
    await setImpactReportPublished(false);
    expect(apiPatch).toHaveBeenCalledWith(
      expect.stringContaining("/impact-report/publish/"),
      { publish: false },
      expect.anything(),
    );
  });

  it("requests a page of feedback", async () => {
    apiGet.mockResolvedValue({ response: { data: [], pagination } });
    await fetchCompanyFeedbackList({ page: 2, perPage: 10 });
    expect(apiGet).toHaveBeenCalledWith(
      expect.stringMatching(/feedback\/list\/\?pageIndex=2&perPage=10$/),
      expect.anything(),
    );
  });
});
