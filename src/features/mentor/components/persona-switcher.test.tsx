import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  switchPersona: vi.fn(),
  getPersonaCurrent: vi.fn(),
  getPersonaStatus: vi.fn(),
}));
vi.mock("../api/mentor.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../api/mentor.api")>()),
  switchPersona: mocks.switchPersona,
  getPersonaCurrent: mocks.getPersonaCurrent,
  getPersonaStatus: mocks.getPersonaStatus,
}));
vi.mock("@/features/mentor/tasks/hooks/use-mentor-tasks", () => ({
  useTaskIgDropdown: () => ({ data: [{ id: "ig1", name: "Web Development" }] }),
}));
vi.mock("@/features/mentor/onboarding/hooks/use-onboarding", () => ({
  useMentorProfile: () => ({
    data: { applications: [{ org: "org1", company: "GEC Thrissur" }] },
  }),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

import { PersonaSwitcher } from "./persona-switcher";

function renderSwitcher() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return render(<PersonaSwitcher />, { wrapper });
}

const scopes = [
  { scope_type: "IG_MENTOR", scope_id: "ig1" },
  { scope_type: "CAMPUS_MENTOR", scope_id: "org1" },
];

describe("PersonaSwitcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getPersonaCurrent.mockResolvedValue({
      active_persona: "mentor",
      active_scope_type: "IG_MENTOR",
      active_scope_id: "ig1",
      available_scopes: scopes,
    });
    mocks.getPersonaStatus.mockResolvedValue({
      active_persona: "mentor",
      active_scope_type: "IG_MENTOR",
      active_scope_id: "ig1",
      active_scope_name: "Web Development",
    });
    mocks.switchPersona.mockResolvedValue(undefined);
  });

  it("shows the active scope and lists learner plus every scope", async () => {
    renderSwitcher();
    const trigger = await screen.findByRole("button", {
      name: /switch persona/i,
    });
    await waitFor(() => expect(trigger).toHaveTextContent("Web Development"));

    fireEvent.keyDown(trigger, { key: "Enter" });
    expect(
      await screen.findByRole("menuitemradio", { name: /learner/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitemradio", { name: /web development/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitemradio", { name: /gec thrissur/i }),
    ).toBeInTheDocument();
  });

  it("switches to the chosen scope", async () => {
    renderSwitcher();
    const trigger = await screen.findByRole("button", {
      name: /switch persona/i,
    });
    fireEvent.keyDown(trigger, { key: "Enter" });
    fireEvent.click(
      await screen.findByRole("menuitemradio", { name: /gec thrissur/i }),
    );
    await waitFor(() =>
      expect(mocks.switchPersona).toHaveBeenCalledWith({
        persona: "mentor",
        scope_type: "CAMPUS_MENTOR",
        scope_id: "org1",
      }),
    );
  });

  it("switches back to learner", async () => {
    renderSwitcher();
    const trigger = await screen.findByRole("button", {
      name: /switch persona/i,
    });
    fireEvent.keyDown(trigger, { key: "Enter" });
    fireEvent.click(
      await screen.findByRole("menuitemradio", { name: /learner/i }),
    );
    await waitFor(() =>
      expect(mocks.switchPersona).toHaveBeenCalledWith({ persona: "learner" }),
    );
  });

  it("stays hidden without any mentor scope", async () => {
    mocks.getPersonaCurrent.mockResolvedValue({
      active_persona: "learner",
      active_scope_type: null,
      active_scope_id: null,
      available_scopes: [],
    });
    const { container } = renderSwitcher();
    await waitFor(() => expect(mocks.getPersonaCurrent).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });
});
