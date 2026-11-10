import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  COMPANY_CAPABILITIES,
  type CompanyAccessRole,
} from "../../lib/company-access";

const mocks = vi.hoisted(() => ({
  fetchCompanyImpactReport: vi.fn(),
  fetchCompanyFeedbackList: vi.fn(),
  fetchCompanyProfile: vi.fn(),
  fetchPublicCompanyProfile: vi.fn(),
  setImpactReportPublished: vi.fn(),
  useCompanyAccess: vi.fn(),
}));

vi.mock("../../api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../api")>()),
  fetchCompanyImpactReport: mocks.fetchCompanyImpactReport,
  fetchCompanyFeedbackList: mocks.fetchCompanyFeedbackList,
  fetchCompanyProfile: mocks.fetchCompanyProfile,
  fetchPublicCompanyProfile: mocks.fetchPublicCompanyProfile,
  setImpactReportPublished: mocks.setImpactReportPublished,
}));
vi.mock("../../hooks/use-company-access", () => ({
  useCompanyAccess: mocks.useCompanyAccess,
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

import { CompanyFeedbackPageClient } from "./company-feedback-client";

const impact = {
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

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

function setup(role: CompanyAccessRole, published: boolean) {
  mocks.useCompanyAccess.mockReturnValue({
    role,
    can: COMPANY_CAPABILITIES[role],
    isLoading: false,
  });
  mocks.fetchCompanyImpactReport.mockResolvedValue(impact);
  mocks.fetchCompanyProfile.mockResolvedValue({
    id: "co1",
    slug: "acme",
    status: "verified",
  });
  mocks.fetchPublicCompanyProfile.mockResolvedValue({
    slug: "acme",
    impact_summary: published ? impact : null,
  });
  mocks.fetchCompanyFeedbackList.mockResolvedValue({
    data: [
      {
        id: "f1",
        interaction_type: "JOB",
        entity_id: "j1",
        submitted_by_name: "Asha Nair",
        rating: 4,
        comment: "Smooth hiring process",
        created_at: "2026-11-01T10:00:00Z",
      },
    ],
    pagination: {
      count: 1,
      totalPages: 1,
      isNext: false,
      isPrev: false,
      nextPage: null,
    },
  });
}

describe("CompanyFeedbackPageClient", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows reach, quality and outcomes from the impact report", async () => {
    setup("owner", false);
    render(<CompanyFeedbackPageClient />, { wrapper });
    expect(await screen.findByText("120")).toBeInTheDocument();
    expect(screen.getByText("4.4")).toBeInTheDocument();
    expect(screen.getByText("from 15 ratings")).toBeInTheDocument();
    expect(screen.getByText("2,500")).toBeInTheDocument();
  });

  it("unpublishes when the toggle is turned off", async () => {
    setup("owner", true);
    mocks.setImpactReportPublished.mockResolvedValue(undefined);
    render(<CompanyFeedbackPageClient />, { wrapper });

    const toggle = await screen.findByRole("switch", {
      name: /show on your public profile/i,
    });
    await waitFor(() => expect(toggle).toHaveAttribute("aria-checked", "true"));
    fireEvent.click(toggle);
    await waitFor(() =>
      expect(mocks.setImpactReportPublished).toHaveBeenCalledWith(false),
    );
  });

  it("lets only the owner or a co-admin change publishing", async () => {
    setup("company_mentor", false);
    render(<CompanyFeedbackPageClient />, { wrapper });
    const toggle = await screen.findByRole("switch", {
      name: /show on your public profile/i,
    });
    expect(toggle).toBeDisabled();
  });

  it("lists feedback with its type, stars, comment and author", async () => {
    setup("owner", false);
    render(<CompanyFeedbackPageClient />, { wrapper });
    expect(
      await screen.findByText("Smooth hiring process"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Rated 4 out of 5")).toBeInTheDocument();
    expect(screen.getByText("Asha Nair")).toBeInTheDocument();
    expect(screen.getByText("Job application")).toBeInTheDocument();
  });
});

describe("CompanyFeedbackPageClient — own publish flag (BE-4)", () => {
  it("trusts profile.publish_impact_report over the public-profile guess", async () => {
    setup("owner", false);
    mocks.fetchCompanyProfile.mockResolvedValue({
      id: "co1",
      slug: "acme",
      status: "verified",
      publish_impact_report: true,
    });
    render(<CompanyFeedbackPageClient />, { wrapper });
    const toggle = await screen.findByRole("switch", {
      name: /show on your public profile/i,
    });
    await waitFor(() => expect(toggle).toHaveAttribute("aria-checked", "true"));
  });
});
