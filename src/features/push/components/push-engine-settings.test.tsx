import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  hasRole: vi.fn(),
  mutate: vi.fn(),
  rules: {} as Record<string, Record<string, unknown>>,
  query: { isError: false, error: null as unknown, refetch: vi.fn() },
}));

vi.mock("@/hooks/use-permissions", () => ({
  usePermissions: () => ({ hasRole: mocks.hasRole }),
}));
vi.mock("../hooks", () => ({
  usePushConfig: () => ({
    isLoading: false,
    isError: mocks.query.isError,
    error: mocks.query.error,
    refetch: mocks.query.refetch,
    data: mocks.query.isError
      ? undefined
      : {
          configured: true,
          global: {
            kill_switch: false,
            daily_cap: 5,
            engagement_daily_cap: 2,
            max_per_minute: 600,
            default_quiet_start: 22,
            default_quiet_end: 7,
            nudge_window_start: 9,
            nudge_window_end: 20,
          },
          rules: mocks.rules,
          types: { KARMA_RECEIVED: true },
        },
  }),
  useUpdatePushConfig: () => ({ isPending: false, mutate: mocks.mutate }),
}));

import { PushEngineSettings } from "./push-engine-settings";

describe("PushEngineSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.query.isError = false;
    mocks.query.error = null;
    mocks.rules = {
      STREAK_RESCUE: {
        enabled: true,
        variants: [
          { key: "keep", title: "Keep it going", body: "Hi {days}" },
          { key: "v2", title: "Day {days_plus_one}", body: "Yo" },
        ],
      },
    };
  });

  it("fellows see settings read-only", () => {
    mocks.hasRole.mockReturnValue(false);
    render(<PushEngineSettings />);
    expect(
      screen.queryByRole("button", { name: /save changes/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /discard/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Only admins can change these.")).toBeVisible();
    expect(
      screen.getByRole("switch", { name: /pause all pushes/i }),
    ).toBeDisabled();
    expect(screen.getByLabelText("Pushes per person per day")).toBeDisabled();
    expect(
      screen.getByRole("switch", { name: /push for karma_received/i }),
    ).toBeDisabled();
  });

  it("admins can save", () => {
    mocks.hasRole.mockReturnValue(true);
    render(<PushEngineSettings />);
    expect(screen.queryByText("Only admins can change these.")).toBeNull();
    const cap = screen.getByLabelText("Pushes per person per day");
    expect(cap).toBeEnabled();
    fireEvent.change(cap, { target: { value: "8" } });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));
    expect(mocks.mutate).toHaveBeenCalledWith({ global: { daily_cap: 8 } });
  });

  it("saves only the edited rule's versions with only allowed fields", () => {
    mocks.hasRole.mockReturnValue(true);
    render(<PushEngineSettings />);
    fireEvent.change(screen.getByLabelText("Body for keep"), {
      target: { value: "New" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));
    expect(mocks.mutate).toHaveBeenCalledWith({
      rules: {
        STREAK_RESCUE: {
          variants: expect.arrayContaining([
            expect.objectContaining({ key: "keep", body: "New" }),
          ]),
        },
      },
    });
    const sent = mocks.mutate.mock.calls[0][0].rules.STREAK_RESCUE.variants;
    const allowed = ["key", "title", "body", "body_no_tasks", "voice"];
    for (const v of sent) {
      for (const k of Object.keys(v)) expect(allowed).toContain(k);
    }
  });

  it("adds a version with the next free key", () => {
    mocks.hasRole.mockReturnValue(true);
    render(<PushEngineSettings />);
    fireEvent.click(screen.getByRole("button", { name: /add version/i }));
    expect(screen.getByLabelText("Title for v3")).toBeInTheDocument();
  });

  it("warns when legacy copy is in use", () => {
    mocks.hasRole.mockReturnValue(true);
    mocks.rules = {
      STREAK_RESCUE: {
        enabled: true,
        title: "Old",
        body: "Old body",
        variants: [{ key: "keep", title: "T", body: "B" }],
      },
    };
    render(<PushEngineSettings />);
    expect(
      screen.getByText(
        "Custom copy saved before versions existed is in use. Saving versions replaces it.",
      ),
    ).toBeVisible();
  });

  it("disables remove when one version is left", () => {
    mocks.hasRole.mockReturnValue(true);
    mocks.rules = {
      STREAK_RESCUE: {
        enabled: true,
        variants: [{ key: "keep", title: "T", body: "B" }],
      },
    };
    render(<PushEngineSettings />);
    expect(
      screen.getByRole("button", { name: /remove version keep/i }),
    ).toBeDisabled();
  });

  it("is read-only for non-admins", () => {
    mocks.hasRole.mockReturnValue(false);
    render(<PushEngineSettings />);
    expect(screen.getByLabelText("Body for keep")).toBeDisabled();
    expect(
      screen.queryByRole("button", { name: /add version/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /remove version/i }),
    ).not.toBeInTheDocument();
  });

  it("warns for a body-only legacy rule", () => {
    mocks.hasRole.mockReturnValue(true);
    mocks.rules = {
      STREAK_RESCUE: {
        enabled: true,
        body: "Old body",
        variants: [{ key: "keep", title: "T", body: "B" }],
      },
    };
    render(<PushEngineSettings />);
    expect(
      screen.getByText(/Custom copy saved before versions existed/),
    ).toBeVisible();
  });

  it("warns for body_with_tasks and body_default legacy copy", () => {
    mocks.hasRole.mockReturnValue(true);
    mocks.rules = {
      COMEBACK: {
        enabled: true,
        body_with_tasks: "Old",
        variants: [{ key: "a", title: "T", body: "B" }],
      },
      STREAK_RESCUE: {
        enabled: true,
        body_default: "Old",
        variants: [{ key: "keep", title: "T", body: "B" }],
      },
    };
    render(<PushEngineSettings />);
    expect(
      screen.getAllByText(/Custom copy saved before versions existed/),
    ).toHaveLength(2);
  });

  it("does not warn when no legacy copy is present", () => {
    mocks.hasRole.mockReturnValue(true);
    render(<PushEngineSettings />);
    expect(
      screen.queryByText(/Custom copy saved before versions existed/),
    ).toBeNull();
  });

  it("locks instant switches while there are unsaved edits", () => {
    mocks.hasRole.mockReturnValue(true);
    render(<PushEngineSettings />);
    const kill = screen.getByRole("switch", { name: /pause all pushes/i });
    const type = screen.getByRole("switch", {
      name: /push for karma_received/i,
    });
    expect(kill).toBeEnabled();
    expect(type).toBeEnabled();
    expect(screen.queryByText("Save or discard your changes first")).toBeNull();
    fireEvent.change(screen.getByLabelText("Body for keep"), {
      target: { value: "Unsaved" },
    });
    expect(kill).toBeDisabled();
    expect(type).toBeDisabled();
    expect(
      screen.getAllByText("Save or discard your changes first").length,
    ).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: /discard/i }));
    expect(kill).toBeEnabled();
    expect(type).toBeEnabled();
  });

  it("shows the backend message with Retry when settings fail to load", () => {
    mocks.hasRole.mockReturnValue(false);
    mocks.query.isError = true;
    mocks.query.error = new Error("Not allowed to view push settings");
    render(<PushEngineSettings />);
    expect(screen.getByText("Couldn't load push settings.")).toBeVisible();
    expect(screen.getByText("Not allowed to view push settings")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(mocks.query.refetch).toHaveBeenCalled();
  });
});
