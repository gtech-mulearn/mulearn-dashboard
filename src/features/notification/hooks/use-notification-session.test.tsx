import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  signedIn: false,
  getUnreadCount: vi.fn(),
  getNotificationFeed: vi.fn(),
}));

vi.mock("@/lib/auth", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/auth")>();
  return {
    ...original,
    authStore: {
      ...original.authStore,
      isAuthenticated: () => mocks.signedIn,
    },
  };
});
vi.mock("../api", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  getUnreadCount: mocks.getUnreadCount,
  getNotificationFeed: mocks.getNotificationFeed,
}));

import { useNotificationFeed, useUnreadCount } from "./use-notification";

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

describe("notification queries and the session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUnreadCount.mockResolvedValue(3);
    mocks.getNotificationFeed.mockResolvedValue({
      page: 1,
      page_size: 20,
      count: 0,
      results: [],
    });
  });

  it("doesn't ask for notifications when nobody is signed in", async () => {
    mocks.signedIn = false;
    renderHook(
      () => ({ count: useUnreadCount(), feed: useNotificationFeed(true) }),
      { wrapper: makeWrapper() },
    );
    // Give any query a chance to start.
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(mocks.getUnreadCount).not.toHaveBeenCalled();
    expect(mocks.getNotificationFeed).not.toHaveBeenCalled();
  });

  it("loads the unread count for a signed-in user", async () => {
    mocks.signedIn = true;
    const { result } = renderHook(() => useUnreadCount(), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => expect(result.current.data).toBe(3));
  });
});
