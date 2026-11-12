import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  pendingIds: [] as string[],
  invitedIds: [] as string[],
  getCircles: vi.fn(),
  getMyPendingInvites: vi.fn(),
  joinCircle: vi.fn(),
}));

vi.mock("../api/learning-circle.api", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  getCircles: api.getCircles,
  getMyPendingInvites: api.getMyPendingInvites,
  joinCircle: api.joinCircle,
}));
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}));

import { useIsCirclePendingJoin, useJoinCircle } from "./use-learning-circle";

function setup(circleId: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const hook = renderHook(
    () => ({
      pending: useIsCirclePendingJoin(circleId),
      join: useJoinCircle(),
    }),
    { wrapper },
  );
  return { ...hook, queryClient };
}

describe("pending join requests", () => {
  beforeEach(() => {
    api.pendingIds = [];
    api.invitedIds = [];
    api.getCircles.mockReset();
    // Like the backend, list?status=pending holds every unaccepted link:
    // the user's own join requests and invitations from a lead.
    api.getCircles.mockImplementation(async () => ({
      circles: [...api.pendingIds, ...api.invitedIds].map((id) => ({ id })),
      pagination: {},
    }));
    api.getMyPendingInvites.mockReset();
    api.getMyPendingInvites.mockImplementation(async () =>
      api.invitedIds.map((id) => ({ link_id: `link-${id}`, circle_id: id })),
    );
    api.joinCircle.mockReset();
    // The server records a pending request when the user asks to join.
    api.joinCircle.mockImplementation(async (id: string) => {
      api.pendingIds.push(id);
    });
  });

  it("shows a circle as pending right after the user asks to join", async () => {
    const { result } = setup("c1");
    act(() => result.current.join.mutate("c1"));
    await waitFor(() => expect(result.current.pending).toBe(true));
  });

  it("clears pending when a fresh server response no longer has the request", async () => {
    const { result, queryClient } = setup("c1");
    api.pendingIds = ["c1"];
    act(() => result.current.join.mutate("c1"));
    await waitFor(() => expect(result.current.pending).toBe(true));

    // The circle lead rejects the request; the next fetch no longer lists it.
    api.pendingIds = [];
    await act(() => queryClient.refetchQueries());
    await waitFor(() => expect(result.current.pending).toBe(false));
  });

  it("doesn't mark an accepted invitation as pending", async () => {
    // Joining a circle the user was invited to makes them a member at once.
    api.joinCircle.mockResolvedValue(undefined);
    const { result } = setup("c3");
    await act(() => result.current.join.mutateAsync("c3"));
    await waitFor(() => expect(result.current.pending).toBe(false));
  });

  it("shows a request the server reports as pending without a local join", async () => {
    api.pendingIds = ["c2"];
    const { result } = setup("c2");
    await waitFor(() => expect(result.current.pending).toBe(true));
  });

  it("doesn't treat an invitation from a lead as the user's join request", async () => {
    // The user can still join (which accepts the invitation); they never
    // asked to join, so "Requested" would be wrong and would hide Join.
    api.invitedIds = ["c4"];
    const { result } = setup("c4");
    await waitFor(() => expect(api.getMyPendingInvites).toHaveBeenCalled());
    await waitFor(() => expect(api.getCircles).toHaveBeenCalled());
    // Let both queries settle before reading the derived flag.
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(result.current.pending).toBe(false);
  });

  it("refreshes the user's invitations after joining, since joining accepts one", async () => {
    // A stale invitation would otherwise hide a later, real join request.
    api.invitedIds = ["c5"];
    api.joinCircle.mockImplementation(async () => {
      api.invitedIds = [];
    });
    const { result } = setup("c5");
    await waitFor(() =>
      expect(api.getMyPendingInvites).toHaveBeenCalledTimes(1),
    );
    await act(() => result.current.join.mutateAsync("c5"));
    await waitFor(() =>
      expect(api.getMyPendingInvites).toHaveBeenCalledTimes(2),
    );
    expect(result.current.pending).toBe(false);
  });
});
