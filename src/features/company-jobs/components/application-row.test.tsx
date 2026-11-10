import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../hooks", () => ({
  useWithdrawApplication: () => ({ mutate: vi.fn(), isPending: false }),
  useResubmitApplication: () => ({ mutate: vi.fn(), isPending: false }),
}));

import { ApplicationRow } from "./application-row";

function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      {children}
    </QueryClientProvider>
  );
}

const application = (status: string) => ({
  id: "app1",
  status,
  applied_at: "2026-10-01T10:00:00Z",
  job: { id: "job1", title: "Frontend intern", company_name: "Acme" },
});

describe("ApplicationRow — rate the company", () => {
  it.each([
    "selected",
    "rejected",
    "Selected",
  ])("offers a rating once the outcome is final (%s)", (status) => {
    render(<ApplicationRow application={application(status)} />, {
      wrapper,
    });
    expect(
      screen.getByRole("button", { name: /rate company/i }),
    ).toBeInTheDocument();
  });

  it.each([
    "applied",
    "shortlisted",
    "withdrawn",
  ])("hides it while the application is %s", (status) => {
    render(<ApplicationRow application={application(status)} />, {
      wrapper,
    });
    expect(
      screen.queryByRole("button", { name: /rate company/i }),
    ).not.toBeInTheDocument();
  });
});
