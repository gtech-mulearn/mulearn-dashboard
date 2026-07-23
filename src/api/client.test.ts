import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiClient } from "./client";

describe("apiClient expected errors", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("does not log an expected business-error status", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            hasError: true,
            statusCode: 400,
            message: { general: ["No mentor request found for your account."] },
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {
      // Expected application states should not appear as console failures.
    });

    await expect(
      apiClient.get("/api/v1/dashboard/mentor/status/", undefined, {
        expectedErrorStatuses: [400],
      }),
    ).rejects.toBeInstanceOf(ApiError);

    expect(consoleError).not.toHaveBeenCalled();
  });
});
