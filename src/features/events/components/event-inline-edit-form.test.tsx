import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.mock is hoisted above module-level consts, so the spy has to be too.
const { patchMutate } = vi.hoisted(() => ({ patchMutate: vi.fn() }));

// The form's data hooks are mocked so the test exercises the form's own
// validation and error rendering, not react-query or the network.
vi.mock("../hooks", async () => {
  const actual = await vi.importActual<typeof import("../hooks")>("../hooks");
  // Stable identities: returning a fresh [] per call changes the reference on
  // every render and re-fires the effects that depend on it.
  const empty = { data: [] as never[], isLoading: false };
  // The form only keeps event_scope if it matches a known cluster, so the
  // cluster list has to contain the fixture's value or the form refuses to
  // submit for an unrelated reason.
  const clusters = {
    data: [{ label: "Coder", value: "coder" }],
    isLoading: false,
  };
  const mutation = { mutateAsync: patchMutate, isPending: false };
  return {
    ...actual,
    useEventCategories: () => empty,
    useIGClusters: () => clusters,
    useEventTypeScope: () => empty,
    usePatchEvent: () => mutation,
  };
});

import { EventInlineEditForm } from "./event-inline-edit-form";

const event = {
  id: "evt-1",
  title: "Campus Tech Fest",
  description: "A day of talks and demos run by the campus chapter.",
  event_scope: "coder",
  event_type: "workshop",
  status: "published",
  start_datetime: "2026-10-01T10:00:00Z",
  end_datetime: "2026-10-01T12:00:00Z",
  registration_url: "https://mulearn.org/register",
  venue: {
    type: "online",
    online_link: "https://meet.google.com/x",
    platform: "Meet",
  },
  organizer: { organiser_type: "campus" },
  tags: [],
} as never;

function renderForm(overrides: Record<string, unknown> = {}) {
  // The campus/IG target pickers run their own search queries, so the tree
  // needs a client even though this test never asserts on their results.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <EventInlineEditForm
        event={{ ...(event as object), ...overrides } as never}
        onSave={vi.fn()}
        onDiscard={vi.fn()}
        onDirtyChange={vi.fn()}
      />
    </QueryClientProvider>,
  );
}

function submit() {
  const form = document.getElementById(
    "event-inline-edit-form-evt-1",
  ) as HTMLFormElement;
  fireEvent.submit(form);
}

describe("EventInlineEditForm registration URL", () => {
  beforeEach(() => {
    patchMutate.mockReset();
  });

  it("tells the user what is wrong when the link has no scheme", async () => {
    renderForm();

    fireEvent.change(screen.getByDisplayValue("https://mulearn.org/register"), {
      target: { value: "mulearn.org/register" },
    });
    submit();

    // The bug this covers: validation blocked the save and rendered nothing,
    // so the Save button appeared to do nothing at all.
    await waitFor(() => {
      expect(screen.getByText(/starting with https:\/\//i)).toBeInTheDocument();
    });
    expect(patchMutate).not.toHaveBeenCalled();
  });

  it("says which target is missing when the scope has none", async () => {
    // scope=campus with no scope_org: the schema raises the issue against
    // target_campus_id, a path no form rendered, so Save did nothing.
    renderForm({ scope: "campus", scope_org: null });

    submit();

    await waitFor(() => {
      expect(
        screen.getByText(/target campus is required/i),
      ).toBeInTheDocument();
    });
    expect(patchMutate).not.toHaveBeenCalled();
  });

  it("saves when the link is a full URL", async () => {
    renderForm();

    fireEvent.change(screen.getByDisplayValue("https://mulearn.org/register"), {
      target: { value: "https://mulearn.org/signup" },
    });
    submit();

    await waitFor(() => {
      expect(patchMutate).toHaveBeenCalled();
    });
  });
});
