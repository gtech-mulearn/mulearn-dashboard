import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/errors";

const { requestPreferredIgChange, toastError, toastSuccess } = vi.hoisted(
  () => ({
    requestPreferredIgChange: vi.fn(),
    toastError: vi.fn(),
    toastSuccess: vi.fn(),
  }),
);

vi.mock("@/features/mentor/api/mentor.api", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  requestPreferredIgChange,
}));
vi.mock("sonner", () => ({
  toast: { error: toastError, success: toastSuccess },
}));

import { useRequestPreferredIgChange } from "./use-onboarding";

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("useRequestPreferredIgChange", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends the new IG list for the approved application", async () => {
    requestPreferredIgChange.mockResolvedValue(undefined);
    const { result } = renderHook(() => useRequestPreferredIgChange(), {
      wrapper,
    });
    result.current.mutate({ applicationId: "app-1", igIds: ["ig-2"] });
    await waitFor(() => expect(toastSuccess).toHaveBeenCalled());
    expect(requestPreferredIgChange).toHaveBeenCalledWith("app-1", ["ig-2"]);
  });

  it("shows the backend's reason when the request is refused", async () => {
    const message =
      "You already have a pending change request for this mentor tier.";
    requestPreferredIgChange.mockRejectedValue(
      new ApiError(400, "Bad Request", { message: { general: [message] } }),
    );
    const { result } = renderHook(() => useRequestPreferredIgChange(), {
      wrapper,
    });
    result.current.mutate({ applicationId: "app-1", igIds: ["ig-2"] });
    await waitFor(() => expect(toastError).toHaveBeenCalledWith(message));
  });
});
