import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getActivityLog: vi.fn() }));

vi.mock("@/features/notification/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/notification/api")>()),
  getActivityLog: mocks.getActivityLog,
}));

import { ActivityLogCard } from "./activity-log-card";

const entry = {
  id: "e1",
  action: "PUSH_CAMPAIGN_SEND",
  label: "Sent push campaign",
  actor: { full_name: "Fay Fellow", muid: "fay@mulearn" },
  roles: ["Fellow"],
  title: "Weekend challenge",
  audience_size: 4120,
  audience_label: null,
  created_at: "2026-11-17T10:00:00+00:00",
  entity_name: "push_campaign",
  entity_id: "c1",
  // The backend sends no old_data/new_data for a campaign send.
  old_data: null,
  new_data: null,
  campaign: {
    status: "sending",
    target_count: 4120,
    sent_count: 3000,
    skipped_count: 100,
    failed_count: 20,
  },
};

const configEntry = {
  ...entry,
  id: "e2",
  action: "PUSH_CONFIG_UPDATE",
  label: "Changed push settings",
  title: null,
  audience_size: null,
  campaign: null,
  entity_name: "push_config",
  old_data: { status: "draft" },
  new_data: { status: "sending", audience: { size: 4120 } },
};

function page(data: unknown[]) {
  return {
    data,
    pagination: {
      count: data.length,
      totalPages: 1,
      isNext: false,
      isPrev: false,
    },
  };
}

function pagedPage(isNext: boolean, isPrev: boolean) {
  return {
    data: [entry],
    pagination: { count: 40, totalPages: 2, isNext, isPrev },
  };
}

function renderCard() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <ActivityLogCard />
    </QueryClientProvider>,
  );
}

describe("ActivityLogCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Element.prototype.hasPointerCapture ??= () => false;
    Element.prototype.releasePointerCapture ??= () => undefined;
    Element.prototype.setPointerCapture ??= () => undefined;
    Element.prototype.scrollIntoView ??= () => undefined;
  });

  it("lists entries with who, action and audience", async () => {
    mocks.getActivityLog.mockResolvedValue(page([entry]));
    renderCard();
    expect(await screen.findByText("Sent push campaign")).toBeInTheDocument();
    expect(screen.getByText("Fellow")).toBeInTheDocument();
    expect(screen.getByText("4,120 people")).toBeInTheDocument();
  });

  it("filters by action", async () => {
    mocks.getActivityLog.mockResolvedValue(page([entry]));
    renderCard();
    await screen.findByText("Sent push campaign");
    fireEvent.click(screen.getByRole("combobox", { name: /action/i }));
    fireEvent.click(
      await screen.findByRole("option", { name: "Deleted all announcements" }),
    );
    await waitFor(() =>
      expect(mocks.getActivityLog).toHaveBeenLastCalledWith(
        expect.objectContaining({
          action: "NOTIF_BROADCAST_DEL_ALL",
          pageIndex: 1,
        }),
      ),
    );
  });

  it("opens details with before and after", async () => {
    mocks.getActivityLog.mockResolvedValue(page([configEntry]));
    renderCard();
    fireEvent.click(await screen.findByText("Changed push settings"));
    expect(await screen.findByText("Before")).toBeInTheDocument();
    expect(screen.getByText("After")).toBeInTheDocument();
    expect(screen.getByText("draft")).toBeInTheDocument();
    expect(screen.getByText("sending")).toBeInTheDocument();
  });

  it("shows the empty state", async () => {
    mocks.getActivityLog.mockResolvedValue(page([]));
    renderCard();
    expect(await screen.findByText("Nothing logged yet.")).toBeInTheDocument();
  });

  it("pages with Next and Prev", async () => {
    mocks.getActivityLog.mockImplementation(async (q: { pageIndex: number }) =>
      q.pageIndex === 1 ? pagedPage(true, false) : pagedPage(false, true),
    );
    renderCard();
    await screen.findByText("Sent push campaign");
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await waitFor(() =>
      expect(mocks.getActivityLog).toHaveBeenLastCalledWith(
        expect.objectContaining({ pageIndex: 2, perPage: 20 }),
      ),
    );
    const prev = screen.getByRole("button", { name: "Prev" });
    await waitFor(() => expect(prev).toBeEnabled());
    fireEvent.click(prev);
    await waitFor(() =>
      expect(mocks.getActivityLog).toHaveBeenLastCalledWith(
        expect.objectContaining({ pageIndex: 1 }),
      ),
    );
  });

  it("resets to page 1 when a filter changes", async () => {
    mocks.getActivityLog.mockImplementation(async (q: { pageIndex: number }) =>
      q.pageIndex === 1 ? pagedPage(true, false) : pagedPage(false, true),
    );
    renderCard();
    await screen.findByText("Sent push campaign");
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await waitFor(() =>
      expect(mocks.getActivityLog).toHaveBeenLastCalledWith(
        expect.objectContaining({ pageIndex: 2 }),
      ),
    );
    fireEvent.click(screen.getByRole("combobox", { name: /action/i }));
    fireEvent.click(
      await screen.findByRole("option", { name: "Sent test push" }),
    );
    await waitFor(() =>
      expect(mocks.getActivityLog).toHaveBeenLastCalledWith(
        expect.objectContaining({ action: "PUSH_TEST_SEND", pageIndex: 1 }),
      ),
    );
  });

  it("applies the actor filter on Enter", async () => {
    mocks.getActivityLog.mockResolvedValue(page([entry]));
    renderCard();
    await screen.findByText("Sent push campaign");
    const input = screen.getByLabelText("Actor muid");
    fireEvent.change(input, { target: { value: "fay@mulearn" } });
    expect(mocks.getActivityLog).not.toHaveBeenCalledWith(
      expect.objectContaining({ actor: "fay@mulearn" }),
    );
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() =>
      expect(mocks.getActivityLog).toHaveBeenLastCalledWith(
        expect.objectContaining({ actor: "fay@mulearn", pageIndex: 1 }),
      ),
    );
  });

  it("shows an error with Retry that refetches", async () => {
    mocks.getActivityLog.mockRejectedValueOnce(new Error("403"));
    mocks.getActivityLog.mockResolvedValue(page([entry]));
    renderCard();
    expect(
      await screen.findByText("Couldn't load the activity log."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Nothing logged yet.")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByText("Sent push campaign")).toBeInTheDocument();
  });

  it("opens details from the keyboard", async () => {
    mocks.getActivityLog.mockResolvedValue(page([entry]));
    renderCard();
    const row = (await screen.findByText("Weekend challenge")).closest("tr");
    expect(row).not.toBeNull();
    if (!row) return;
    expect(row).toHaveAttribute("tabindex", "0");
    fireEvent.keyDown(row, { key: "Enter" });
    expect(await screen.findByText("Before")).toBeInTheDocument();
  });

  it("shows a dash when the title is null", async () => {
    mocks.getActivityLog.mockResolvedValue(
      page([{ ...configEntry, audience_size: 12 }]),
    );
    renderCard();
    const row = (await screen.findByText("Changed push settings")).closest(
      "tr",
    );
    expect(row).not.toBeNull();
    if (!row) return;
    expect(within(row).getByText("12 people")).toBeInTheDocument();
    const titleCell = row.querySelector("td.max-w-64");
    expect(titleCell).not.toBeNull();
    expect(titleCell?.textContent).toBe("—");
  });

  it("shows Admin for the Admins role", async () => {
    mocks.getActivityLog.mockResolvedValue(
      page([{ ...entry, roles: ["Admins"] }]),
    );
    renderCard();
    expect(await screen.findByText("Admin")).toBeInTheDocument();
    expect(screen.queryByText("Admins")).not.toBeInTheDocument();
  });

  it("summarises a campaign row with live counts, without before/after data", async () => {
    mocks.getActivityLog.mockResolvedValue(page([entry]));
    renderCard();
    fireEvent.click(await screen.findByText("Weekend challenge"));
    const summary = await screen.findByTestId("campaign-summary");
    expect(summary).toHaveTextContent("sending");
    expect(summary).toHaveTextContent(
      "3,000 sent / 100 skipped / 20 failed of 4,120",
    );
    expect(screen.getAllByText("Nothing recorded.")).toHaveLength(2);
  });

  it("lays out before and after in one column on phones", async () => {
    mocks.getActivityLog.mockResolvedValue(page([configEntry]));
    renderCard();
    fireEvent.click(await screen.findByText("Changed push settings"));
    const grid = (await screen.findByText("Before")).closest(
      "section",
    )?.parentElement;
    expect(grid?.className).toContain("grid-cols-1");
    expect(grid?.className).toContain("sm:grid-cols-2");
  });

  it("shows list values as a capped list", async () => {
    const items = Array.from({ length: 25 }, (_, i) => `Announcement ${i + 1}`);
    mocks.getActivityLog.mockResolvedValue(
      page([
        {
          ...configEntry,
          action: "NOTIF_BROADCAST_DEL_ALL",
          label: "Deleted all announcements",
          old_data: { items },
        },
      ]),
    );
    renderCard();
    fireEvent.click(await screen.findByText("Deleted all announcements"));
    expect(await screen.findByText("Announcement 20")).toBeInTheDocument();
    expect(screen.queryByText("Announcement 21")).not.toBeInTheDocument();
    expect(screen.getByText("and 5 more")).toBeInTheDocument();
  });

  it("explains a filtered empty result and clears the filters", async () => {
    mocks.getActivityLog.mockResolvedValue(page([]));
    renderCard();
    await screen.findByText("Nothing logged yet.");
    const input = screen.getByLabelText("Actor muid");
    fireEvent.change(input, { target: { value: "  Nobody@MuLearn " } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(
      await screen.findByText("No activity matches these filters"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Nothing logged yet.")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(await screen.findByText("Nothing logged yet.")).toBeInTheDocument();
    expect(screen.getByLabelText("Actor muid")).toHaveValue("");
  });

  it("trims and lower-cases the actor on Enter", async () => {
    mocks.getActivityLog.mockResolvedValue(page([entry]));
    renderCard();
    await screen.findByText("Sent push campaign");
    const input = screen.getByLabelText("Actor muid");
    fireEvent.change(input, { target: { value: "  Fay@MuLearn " } });
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() =>
      expect(mocks.getActivityLog).toHaveBeenLastCalledWith(
        expect.objectContaining({ actor: "fay@mulearn" }),
      ),
    );
  });

  it("applies the actor filter on blur", async () => {
    mocks.getActivityLog.mockResolvedValue(page([entry]));
    renderCard();
    await screen.findByText("Sent push campaign");
    const input = screen.getByLabelText("Actor muid");
    fireEvent.change(input, { target: { value: "fay@mulearn" } });
    fireEvent.blur(input);
    await waitFor(() =>
      expect(mocks.getActivityLog).toHaveBeenLastCalledWith(
        expect.objectContaining({ actor: "fay@mulearn" }),
      ),
    );
  });

  it("removes the actor filter when the box is emptied", async () => {
    mocks.getActivityLog.mockResolvedValue(page([entry]));
    renderCard();
    await screen.findByText("Sent push campaign");
    const input = screen.getByLabelText("Actor muid");
    fireEvent.change(input, { target: { value: "fay@mulearn" } });
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() =>
      expect(mocks.getActivityLog).toHaveBeenLastCalledWith(
        expect.objectContaining({ actor: "fay@mulearn" }),
      ),
    );
    fireEvent.change(input, { target: { value: "" } });
    await waitFor(() =>
      expect(mocks.getActivityLog).toHaveBeenLastCalledWith(
        expect.objectContaining({ actor: undefined }),
      ),
    );
  });

  it("shows the backend message when loading fails", async () => {
    mocks.getActivityLog.mockRejectedValue(new Error("Role not verified"));
    renderCard();
    expect(await screen.findByText("Role not verified")).toBeInTheDocument();
    expect(
      screen.queryByText("Check your filters and try again."),
    ).not.toBeInTheDocument();
  });

  it("says dates are in UTC", async () => {
    mocks.getActivityLog.mockResolvedValue(page([entry]));
    renderCard();
    expect(await screen.findByText("Dates are in UTC.")).toBeInTheDocument();
  });
});
