import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ sendTestPush: vi.fn() }));

vi.mock("./api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./api")>()),
  sendTestPush: mocks.sendTestPush,
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

import { notificationKeys } from "@/features/notification/hooks/query-keys";
import { useSendTestPush } from "./hooks";

function setup() {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  const invalidate = vi.spyOn(client, "invalidateQueries");
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { invalidate, ...renderHook(() => useSendTestPush(), { wrapper }) };
}

describe("useSendTestPush", () => {
  it("refreshes the activity log after a success", async () => {
    mocks.sendTestPush.mockResolvedValueOnce(undefined);
    const { result, invalidate } = setup();
    result.current.mutate({ title: "T", body: "B" });
    await waitFor(() =>
      expect(invalidate).toHaveBeenCalledWith({
        queryKey: notificationKeys.activityLogAll(),
      }),
    );
  });

  it("refreshes the activity log after a failure too", async () => {
    mocks.sendTestPush.mockRejectedValueOnce(new Error("no devices"));
    const { result, invalidate } = setup();
    result.current.mutate({ title: "T", body: "B" });
    await waitFor(() =>
      expect(invalidate).toHaveBeenCalledWith({
        queryKey: notificationKeys.activityLogAll(),
      }),
    );
  });
});
