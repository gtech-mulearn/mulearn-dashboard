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

const mocks = vi.hoisted(() => ({
  fetchIncomingCollaborations: vi.fn(),
  discoverCollaborations: vi.fn(),
  respondCollaboration: vi.fn(),
  useLeadTargets: vi.fn(),
}));
vi.mock("../../api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../api")>()),
  fetchIncomingCollaborations: mocks.fetchIncomingCollaborations,
  discoverCollaborations: mocks.discoverCollaborations,
  respondCollaboration: mocks.respondCollaboration,
}));
vi.mock("../../hooks/use-lead-targets", () => ({
  useLeadTargets: mocks.useLeadTargets,
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

import { IncomingCollaborationsClient } from "./incoming-collaborations-client";

const post = (over: Record<string, unknown>) => ({
  id: "c1",
  company_name: "Acme",
  company_logo: null,
  collab_type: "EVENT_COHOST",
  title: "Hack night",
  description: "Let's co-host",
  target_type: "IG",
  target_org_id: "ig1",
  event_id: null,
  status: "PENDING",
  responded_by_name: null,
  responded_at: null,
  rejection_reason: null,
  created_at: "2026-11-01T10:00:00Z",
  ...over,
});

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  render(<IncomingCollaborationsClient />, { wrapper });
}

describe("IncomingCollaborationsClient (BE-9)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.respondCollaboration.mockResolvedValue(undefined);
    mocks.useLeadTargets.mockReturnValue({
      targets: [{ type: "IG", orgId: "ig1", label: "Web Development" }],
      isLoading: false,
    });
    mocks.discoverCollaborations.mockResolvedValue({
      data: [],
      pagination: {
        count: 0,
        totalPages: 1,
        isNext: false,
        isPrev: false,
        nextPage: null,
      },
    });
  });

  it("accepts an invitation", async () => {
    mocks.fetchIncomingCollaborations.mockResolvedValue([post({})]);
    renderPage();
    const card = (await screen.findByText("Hack night")).closest(
      "li",
    ) as HTMLElement;
    fireEvent.click(within(card).getByRole("button", { name: /accept/i }));
    await waitFor(() =>
      expect(mocks.respondCollaboration).toHaveBeenCalledWith("c1", {
        accept: true,
      }),
    );
  });

  it("declines with an optional reason", async () => {
    mocks.fetchIncomingCollaborations.mockResolvedValue([post({})]);
    renderPage();
    const card = (await screen.findByText("Hack night")).closest(
      "li",
    ) as HTMLElement;
    fireEvent.click(within(card).getByRole("button", { name: /decline/i }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(within(dialog).getByRole("textbox"), {
      target: { value: " Busy this term " },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: /^decline$/i }));
    await waitFor(() =>
      expect(mocks.respondCollaboration).toHaveBeenCalledWith("c1", {
        accept: false,
        rejection_reason: "Busy this term",
      }),
    );
  });

  it("claims an open post for the lead's IG", async () => {
    mocks.fetchIncomingCollaborations.mockResolvedValue([]);
    mocks.discoverCollaborations.mockResolvedValue({
      data: [
        post({
          id: "c2",
          title: "Open post",
          status: "OPEN",
          target_type: null,
          target_org_id: null,
        }),
      ],
      pagination: {
        count: 1,
        totalPages: 1,
        isNext: false,
        isPrev: false,
        nextPage: null,
      },
    });
    renderPage();
    const card = (await screen.findByText("Open post")).closest(
      "li",
    ) as HTMLElement;
    fireEvent.click(within(card).getByRole("button", { name: /claim/i }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: /^claim$/i }));
    await waitFor(() =>
      expect(mocks.respondCollaboration).toHaveBeenCalledWith("c2", {
        accept: true,
        target_type: "IG",
        target_org_id: "ig1",
      }),
    );
  });
});
