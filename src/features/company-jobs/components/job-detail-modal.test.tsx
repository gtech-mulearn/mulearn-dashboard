import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { PublicJob } from "../types";

const { mutation } = vi.hoisted(() => ({
  mutation: () => ({
    mutate: vi.fn(),
    isPending: false,
    isSuccess: false,
    reset: vi.fn(),
  }),
}));
vi.mock("../hooks", () => ({
  useApplyJob: mutation,
  useResubmitApplication: mutation,
  useTrackJobView: mutation,
  useLearnerApplications: () => ({ data: { applications: [] } }),
  useEligibilitySkills: () => ({
    data: [{ id: "skill-1", name: "Python" }],
    isLoading: false,
  }),
}));

import { JobDetailModal } from "./job-detail-modal";

const job = (over: Partial<PublicJob>): PublicJob =>
  ({
    id: "j1",
    title: "Backend intern",
    status: "Active",
    company_name: "Acme",
    rules: [{ id: "r1", rule_type: "skill", rule_value: "skill-1" }],
    ...over,
  }) as PublicJob;

describe("JobDetailModal — eligibility", () => {
  it("explains unmet requirements and blocks applying", () => {
    render(
      <JobDetailModal
        open
        onOpenChange={vi.fn()}
        job={job({
          eligibility: {
            eligible: false,
            rules: [
              {
                rule_type: "skill",
                rule_value: "skill-1",
                met: false,
                message: "Requires the 'Python' skill.",
              },
            ],
          },
        })}
      />,
    );
    expect(
      screen.getByText("Requires the 'Python' skill."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /not eligible/i }),
    ).toBeDisabled();
    expect(screen.queryByLabelText(/resume link/i)).not.toBeInTheDocument();
  });

  it("names the skill a rule requires instead of its id", () => {
    render(<JobDetailModal open onOpenChange={vi.fn()} job={job({})} />);
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.queryByText("skill-1")).not.toBeInTheDocument();
  });
});
