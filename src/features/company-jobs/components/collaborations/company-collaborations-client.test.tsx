import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/errors";

const mocks = vi.hoisted(() => ({
  fetchCollaborations: vi.fn(),
  discoverCollaborations: vi.fn(),
  createCollaboration: vi.fn(),
  withdrawCollaboration: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("../../api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../api")>()),
  fetchCollaborations: mocks.fetchCollaborations,
  discoverCollaborations: mocks.discoverCollaborations,
  createCollaboration: mocks.createCollaboration,
  withdrawCollaboration: mocks.withdrawCollaboration,
}));
vi.mock("@/features/interest-groups", () => ({
  useInterestGroupsList: () => ({ data: undefined, isLoading: false }),
  extractInterestGroups: () => [],
}));
vi.mock("@/features/onboarding", () => ({
  useCollegeSearch: () => ({ data: [], isFetching: false }),
}));
vi.mock("sonner", () => ({
  toast: { error: mocks.toastError, success: mocks.toastSuccess },
}));

import { CompanyCollaborationsPageClient } from "./company-collaborations-client";

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const post = (over: Record<string, unknown>) => ({
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
  ...over,
});

const page = (data: unknown[]) => ({
  data,
  pagination: {
    count: data.length,
    totalPages: 1,
    isNext: false,
    isPrev: false,
    nextPage: null,
  },
});

describe("CompanyCollaborationsPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.discoverCollaborations.mockResolvedValue(page([]));
  });

  it("lists the company's posts with a badge per status", async () => {
    mocks.fetchCollaborations.mockResolvedValue(
      page([
        post({ id: "a", title: "Open post", status: "OPEN" }),
        post({
          id: "b",
          title: "Invite",
          status: "PENDING",
          target_type: "CAMPUS",
          target_org_id: "org-1",
        }),
        post({
          id: "c",
          title: "Done",
          status: "ACCEPTED",
          responded_by_name: "Lead Person",
        }),
        post({
          id: "d",
          title: "No",
          status: "DECLINED",
          rejection_reason: "Not this semester",
        }),
        post({ id: "e", title: "Gone", status: "WITHDRAWN" }),
      ]),
    );
    render(<CompanyCollaborationsPageClient />, { wrapper });

    const table = await screen.findByRole("table");
    expect(within(table).getByText("Open")).toBeInTheDocument();
    expect(within(table).getByText("Awaiting response")).toBeInTheDocument();
    expect(within(table).getByText("Accepted")).toBeInTheDocument();
    expect(within(table).getByText("Declined")).toBeInTheDocument();
    expect(within(table).getByText("Withdrawn")).toBeInTheDocument();
    expect(within(table).getByText(/Not this semester/)).toBeInTheDocument();
    expect(within(table).getAllByText("Event Co-host")).toHaveLength(5);
    // Only OPEN and PENDING posts can be withdrawn.
    expect(
      within(table).getAllByRole("button", { name: /withdraw/i }),
    ).toHaveLength(2);
  });

  it("withdraws a post after confirmation", async () => {
    mocks.fetchCollaborations.mockResolvedValue(page([post({})]));
    mocks.withdrawCollaboration.mockResolvedValue(undefined);
    render(<CompanyCollaborationsPageClient />, { wrapper });

    fireEvent.click(await screen.findByRole("button", { name: /withdraw/i }));
    const dialog = await screen.findByTestId("confirm-dialog");
    fireEvent.click(
      within(dialog).getByRole("button", { name: /^withdraw$/i }),
    );

    await waitFor(() =>
      expect(mocks.withdrawCollaboration).toHaveBeenCalledWith("c1"),
    );
  });

  it("posts an open collaboration and shows the backend's cap message verbatim", async () => {
    const cap =
      "You already have 5 open/pending collaboration posts. Resolve those before posting more.";
    mocks.fetchCollaborations.mockResolvedValue(page([]));
    mocks.createCollaboration.mockRejectedValue(
      new ApiError(429, cap, {
        hasError: true,
        statusCode: 429,
        message: { general: [cap] },
        response: {},
      }),
    );
    render(<CompanyCollaborationsPageClient />, { wrapper });

    fireEvent.click(
      (await screen.findAllByRole("button", { name: /new collaboration/i }))[0],
    );
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(
      within(dialog).getByRole("radio", { name: /mentorship exchange/i }),
    );
    fireEvent.change(within(dialog).getByLabelText("Title"), {
      target: { value: "  Mentor swap  " },
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: /post collaboration/i }),
    );

    await waitFor(() => expect(mocks.toastError).toHaveBeenCalledWith(cap));
    expect(mocks.toastError).toHaveBeenCalledTimes(1);
    expect(mocks.createCollaboration).toHaveBeenCalledWith({
      collab_type: "MENTORSHIP_EXCHANGE",
      title: "Mentor swap",
    });
  });

  it("asks for the missing fields instead of posting", async () => {
    mocks.fetchCollaborations.mockResolvedValue(page([]));
    render(<CompanyCollaborationsPageClient />, { wrapper });

    fireEvent.click(
      (await screen.findAllByRole("button", { name: /new collaboration/i }))[0],
    );
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(
      within(dialog).getByRole("button", { name: /post collaboration/i }),
    );

    expect(
      await within(dialog).findByText("Choose a collaboration type."),
    ).toBeInTheDocument();
    expect(within(dialog).getByText("Add a title.")).toBeInTheDocument();
    expect(mocks.createCollaboration).not.toHaveBeenCalled();
  });
});
