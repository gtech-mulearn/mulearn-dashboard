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
  fetchDeactivatedMentors: vi.fn(),
  reactivateMentor: vi.fn(),
}));
vi.mock("../api/mentor-verify.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../api/mentor-verify.api")>()),
  fetchDeactivatedMentors: mocks.fetchDeactivatedMentors,
}));
vi.mock("../api/mentor-assign.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../api/mentor-assign.api")>()),
  reactivateMentor: mocks.reactivateMentor,
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

import { DeactivatedMentorsTab } from "./deactivated-mentors-tab";

function renderTab() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return render(<DeactivatedMentorsTab />, { wrapper });
}

describe("DeactivatedMentorsTab (BE-5)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.reactivateMentor.mockResolvedValue(undefined);
  });

  it("reactivates a mentor by their UserMentor id", async () => {
    mocks.fetchDeactivatedMentors.mockResolvedValue({
      data: [
        {
          id: "um-1",
          user_full_name: "Mira Mentor",
          muid: "mira@mulearn",
          updated_at: "2026-11-01T10:00:00Z",
        },
      ],
      totalPages: 1,
      totalItems: 1,
    });
    renderTab();
    const row = (await screen.findByText("Mira Mentor")).closest(
      "li",
    ) as HTMLElement;
    fireEvent.click(within(row).getByRole("button", { name: /reactivate/i }));
    const dialog = await screen.findByTestId("confirm-dialog");
    fireEvent.click(
      within(dialog).getByRole("button", { name: /reactivate mentor/i }),
    );
    await waitFor(() =>
      expect(mocks.reactivateMentor).toHaveBeenCalledWith("um-1"),
    );
  });

  it("says so when no mentor is deactivated", async () => {
    mocks.fetchDeactivatedMentors.mockResolvedValue({
      data: [],
      totalPages: 1,
      totalItems: 0,
    });
    renderTab();
    expect(
      await screen.findByText(/no deactivated mentors/i),
    ).toBeInTheDocument();
  });
});
