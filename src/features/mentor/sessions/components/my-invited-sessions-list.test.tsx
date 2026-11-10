import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

const { useParticipantHistory } = vi.hoisted(() => ({
  useParticipantHistory: vi.fn(),
}));
vi.mock("../hooks/use-sessions", () => ({ useParticipantHistory }));

import { MyInvitedSessionsList } from "./my-invited-sessions-list";

function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      {children}
    </QueryClientProvider>
  );
}

const row = (over: Record<string, unknown>) => ({
  id: "p1",
  session_id: "s1",
  user_id: "u1",
  participant_role: "MENTEE",
  attendance_status: "ATTENDED",
  session_title: "Resume review",
  session_status: "COMPLETED",
  session_type: "COMPANY_SESSION",
  session_entity_name: "Acme",
  ...over,
});

function showRows(rows: unknown[]) {
  useParticipantHistory.mockReturnValue({
    data: { data: rows, totalPages: 1, totalCount: rows.length },
    isLoading: false,
  });
  render(<MyInvitedSessionsList />, { wrapper });
}

describe("MyInvitedSessionsList — rate the company", () => {
  it("offers a rating on a completed company session attended as mentee", () => {
    showRows([row({})]);
    expect(
      screen.getByRole("button", { name: /rate company/i }),
    ).toBeInTheDocument();
  });

  it.each([
    ["an IG session", { session_type: "IG_SESSION" }],
    ["a session still scheduled", { session_status: "SCHEDULED" }],
    ["a co-mentor", { participant_role: "CO_MENTOR" }],
    ["a row without session_type", { session_type: undefined }],
  ])("hides it for %s", (_label, over) => {
    showRows([row(over)]);
    expect(
      screen.queryByRole("button", { name: /rate company/i }),
    ).not.toBeInTheDocument();
  });
});
