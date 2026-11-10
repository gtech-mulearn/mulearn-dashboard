import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  CompanyProfileCompleteness,
  CompanyTrustSignals,
} from "./company-trust-signals";

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

describe("CompanyTrustSignals (public profile)", () => {
  it("shows verification date, partnerships and the published impact", () => {
    render(
      <CompanyTrustSignals
        verifiedSince="2026-03-15T00:00:00Z"
        collaborationSummary={{
          total_partnerships: 4,
          campus_partnerships: 3,
          ig_partnerships: 1,
        }}
        impactSummary={impact}
      />,
    );
    expect(screen.getByText(/Verified since 15 Mar 2026/)).toBeInTheDocument();
    expect(screen.getByText(/4 partnerships/)).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();
    expect(screen.getByText("4.4")).toBeInTheDocument();
  });

  it("renders nothing without any signal", () => {
    const { container } = render(
      <CompanyTrustSignals
        verifiedSince={null}
        collaborationSummary={null}
        impactSummary={null}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});

describe("CompanyProfileCompleteness (owner profile)", () => {
  it("shows completeness and the review-time message while pending", () => {
    render(
      <CompanyProfileCompleteness
        completeness={60}
        slaMessage="Registrations are typically reviewed within 3 business days."
      />,
    );
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "60",
    );
    expect(screen.getByText(/within 3 business days/)).toBeInTheDocument();
  });
});
