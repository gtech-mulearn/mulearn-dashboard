import { beforeEach, describe, expect, it, vi } from "vitest";

const { apiPost } = vi.hoisted(() => ({ apiPost: vi.fn() }));
vi.mock("@/api/client", () => ({
  apiClient: { post: apiPost, get: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import { createSession } from "./sessions.api";

const base = {
  title: "Resume clinic",
  description: "",
  ig_id: "",
  mode: "ONLINE" as const,
  starts_at: "2026-12-01T10:00",
  ends_at: "2026-12-01T11:00",
  meeting_link: "https://meet.google.com/abc-defg-hij",
  venue: "",
  is_recurring: false,
  recurrence_type: "WEEKLY" as const,
  recurrence_interval: 1,
  recurrence_end_date: "",
};

describe("createSession payload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiPost.mockResolvedValue({ response: {} });
  });

  it("creates a campus session for the chosen campus scope", async () => {
    await createSession({
      ...base,
      session_type: "CAMPUS_SESSION",
      entity_id: "org1",
    });
    const payload = apiPost.mock.calls[0][1];
    expect(payload).toMatchObject({
      session_type: "CAMPUS_SESSION",
      entity_id: "org1",
    });
    expect(payload).not.toHaveProperty("ig_id");
  });

  it("lets the chosen scope win over a stale IG pick", async () => {
    await createSession({
      ...base,
      ig_id: "ig1",
      session_type: "COMPANY_SESSION",
      entity_id: "org7",
    });
    expect(apiPost.mock.calls[0][1]).toMatchObject({
      session_type: "COMPANY_SESSION",
      entity_id: "org7",
    });
  });

  it("still creates an IG session from the IG picker", async () => {
    await createSession({ ...base, ig_id: "ig1" });
    expect(apiPost.mock.calls[0][1]).toMatchObject({
      session_type: "IG_SESSION",
      entity_id: "ig1",
    });
  });
});
