import Cookies from "js-cookie";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const refreshAccessToken = vi.fn();
vi.mock("./refresh.client", () => ({
  refreshAccessToken: () => refreshAccessToken(),
}));

const { apiClient, ApiError } = await import("./client");

const RID = "req_0193a1b2c3d4e5f60718293a4b5c6d7e";

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  Cookies.set("accessToken", "stale-token");
  Cookies.set("refreshToken", "refresh-token");
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  refreshAccessToken.mockReset();
});

afterEach(() => {
  for (const name of ["accessToken", "refreshToken", "isAuthenticated"])
    Cookies.remove(name);
  vi.unstubAllGlobals();
});

describe("apiClient token expiry", () => {
  it("refreshes once and retries with the new token on a token failure", async () => {
    refreshAccessToken.mockResolvedValue("fresh-token");
    fetchMock
      .mockResolvedValueOnce(
        json(401, {
          hasError: true,
          message: { general: ["Token Expired or Invalid"] },
          statusCode: 1000,
        }),
      )
      .mockResolvedValueOnce(
        json(200, {
          hasError: false,
          statusCode: 200,
          code: "ok",
          message: { general: [] },
          response: { name: "Asha" },
          requestId: RID,
        }),
      );

    // Without a schema, get() unwraps the envelope's response.
    const data = await apiClient.get<{ name: string }>(
      "/api/v1/dashboard/user/info/",
    );

    expect(data).toEqual({ name: "Asha" });
    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const retry = fetchMock.mock.calls[1][1] as RequestInit;
    expect((retry.headers as Record<string, string>).Authorization).toBe(
      "Bearer fresh-token",
    );
  });

  it("treats statusCode 1000 on a 403 as a token failure, as before", async () => {
    refreshAccessToken.mockResolvedValue("fresh-token");
    fetchMock
      .mockResolvedValueOnce(
        json(403, {
          hasError: true,
          message: { general: ["Invalid token header"] },
          statusCode: 1000,
        }),
      )
      .mockResolvedValueOnce(
        json(200, {
          hasError: false,
          statusCode: 200,
          message: { general: [] },
          response: {},
        }),
      );

    await apiClient.get("/api/v1/dashboard/profile/user-profile/");

    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
  });
});

describe("apiClient errors", () => {
  it("throws an ApiError carrying the envelope's code, requestId, endpoint and field errors", async () => {
    fetchMock.mockResolvedValueOnce(
      json(400, {
        hasError: true,
        statusCode: 400,
        code: "validation_error",
        message: {
          general: [],
          fields: { startsAt: ["Must be in the future."] },
        },
        response: {},
        requestId: RID,
      }),
    );

    const error = await apiClient
      .post("/api/v1/events/", { title: "x" })
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    const apiError = error as InstanceType<typeof ApiError>;
    expect(apiError.status).toBe(400);
    expect(apiError.message).toBe("Must be in the future.");
    expect(apiError.code).toBe("validation_error");
    expect(apiError.requestId).toBe(RID);
    expect(apiError.endpoint).toBe("/api/v1/events/");
    expect(apiError.fieldErrors).toEqual({
      startsAt: ["Must be in the future."],
    });
    expect(refreshAccessToken).not.toHaveBeenCalled();
  });

  it("keeps today's message for a legacy failure envelope", async () => {
    fetchMock.mockResolvedValueOnce(
      json(400, {
        hasError: true,
        statusCode: 400,
        message: { general: ["Event not found."] },
        response: {},
      }),
    );

    const error = (await apiClient
      .get("/api/v1/public/events/x/")
      .catch((caught: unknown) => caught)) as InstanceType<typeof ApiError>;

    expect(error.message).toBe("Event not found.");
    expect(error.code).toBeUndefined();
  });
});
