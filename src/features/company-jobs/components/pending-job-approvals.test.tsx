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
  fetchPendingJobs: vi.fn(),
  approveJob: vi.fn(),
  rejectJob: vi.fn(),
  requestJobChanges: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("../api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../api")>()),
  fetchPendingJobs: mocks.fetchPendingJobs,
  approveJob: mocks.approveJob,
  rejectJob: mocks.rejectJob,
  requestJobChanges: mocks.requestJobChanges,
}));
vi.mock("sonner", () => ({
  toast: { error: mocks.toastError, success: mocks.toastSuccess },
}));

import { PendingJobApprovals } from "./pending-job-approvals";

const SELF_APPROVAL = "You cannot approve your own job posting.";

const job = (id: string, title: string) => ({
  id,
  title,
  job_type: "Internship",
  status: "Pending Approval",
  created_at: "2026-11-01T10:00:00Z",
  created_by_name: "Mentor Mia",
  rules: [],
});

function renderWith(jobs: unknown[]) {
  mocks.fetchPendingJobs.mockResolvedValue({
    jobs,
    pagination: {
      count: jobs.length,
      totalPages: 1,
      isNext: false,
      isPrev: false,
      nextPage: null,
    },
  });
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  render(<PendingJobApprovals onViewJob={vi.fn()} />, { wrapper });
}

async function rowFor(title: string) {
  return (await screen.findByText(title)).closest("li") as HTMLElement;
}

describe("PendingJobApprovals", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lists every job waiting for approval", async () => {
    renderWith([job("j1", "Frontend intern"), job("j2", "Data gig")]);
    expect(await screen.findByText("Frontend intern")).toBeInTheDocument();
    expect(screen.getByText("Data gig")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^approve$/i })).toHaveLength(
      2,
    );
    expect(screen.getAllByText(/Mentor Mia/)).toHaveLength(2);
  });

  it("renders nothing when no job is waiting", async () => {
    renderWith([]);
    await waitFor(() => expect(mocks.fetchPendingJobs).toHaveBeenCalled());
    expect(
      screen.queryByRole("heading", { name: /waiting for your approval/i }),
    ).not.toBeInTheDocument();
  });

  it("needs a note before requesting changes", async () => {
    renderWith([job("j1", "Frontend intern")]);
    const row = await rowFor("Frontend intern");
    fireEvent.click(
      within(row).getByRole("button", { name: /request changes/i }),
    );
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: /send/i }));
    expect(await within(dialog).findByText(/add a note/i)).toBeInTheDocument();
    expect(mocks.requestJobChanges).not.toHaveBeenCalled();

    fireEvent.change(within(dialog).getByRole("textbox"), {
      target: { value: "  Fix salary " },
    });
    mocks.requestJobChanges.mockResolvedValue(undefined);
    fireEvent.click(within(dialog).getByRole("button", { name: /send/i }));
    await waitFor(() =>
      expect(mocks.requestJobChanges).toHaveBeenCalledWith("j1", "Fix salary"),
    );
  });

  it("needs a reason before rejecting", async () => {
    renderWith([job("j1", "Frontend intern")]);
    const row = await rowFor("Frontend intern");
    fireEvent.click(within(row).getByRole("button", { name: /reject/i }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(
      within(dialog).getByRole("button", { name: /reject job/i }),
    );
    expect(
      await within(dialog).findByText(/add a reason/i),
    ).toBeInTheDocument();
    expect(mocks.rejectJob).not.toHaveBeenCalled();

    fireEvent.change(within(dialog).getByRole("textbox"), {
      target: { value: "Duplicate posting" },
    });
    mocks.rejectJob.mockResolvedValue(undefined);
    fireEvent.click(
      within(dialog).getByRole("button", { name: /reject job/i }),
    );
    await waitFor(() =>
      expect(mocks.rejectJob).toHaveBeenCalledWith("j1", "Duplicate posting"),
    );
  });

  it("shows the backend's self-approval message verbatim", async () => {
    renderWith([job("j1", "Frontend intern")]);
    mocks.approveJob.mockRejectedValue(
      new ApiError(403, SELF_APPROVAL, {
        hasError: true,
        statusCode: 403,
        message: { general: [SELF_APPROVAL] },
        response: {},
      }),
    );
    const row = await rowFor("Frontend intern");
    fireEvent.click(within(row).getByRole("button", { name: /^approve$/i }));
    await waitFor(() =>
      expect(mocks.toastError).toHaveBeenCalledWith(SELF_APPROVAL),
    );
    expect(mocks.approveJob).toHaveBeenCalledWith("j1");
  });
});
