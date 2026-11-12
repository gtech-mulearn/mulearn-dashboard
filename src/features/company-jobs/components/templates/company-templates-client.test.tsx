import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const templates = vi.hoisted(() => ({
  data: [] as Array<Record<string, unknown>>,
}));

vi.mock("@/features/company-jobs/hooks", () => ({
  useEventTemplates: () => ({ data: templates.data, isLoading: false }),
  useCreateEventTemplate: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteEventTemplate: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

import { CompanyTemplatesPageClient } from "./company-templates-client";

describe("CompanyTemplatesPageClient", () => {
  it("renders the empty state without crashing", () => {
    templates.data = [];
    render(<CompanyTemplatesPageClient />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Event Templates" }),
    ).toBeInTheDocument();
    expect(screen.getByText("No Event Templates Yet")).toBeInTheDocument();
  });

  it("lists saved event templates", () => {
    templates.data = [
      {
        id: "t1",
        title: "Backend Masterclass",
        description: "Scaling services",
        event_type: "tech_talk",
        default_duration_minutes: 90,
        mode: "ONLINE",
      },
    ];
    render(<CompanyTemplatesPageClient />);
    expect(screen.getByText("Backend Masterclass")).toBeInTheDocument();
  });
});
