import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * These tests pin ONE property: this handler must never emit an absolute
 * `Location`.
 *
 * On Netlify's Next runtime, `request.url` inside a route handler is rebuilt
 * from the deploy's own URL (the immutable `<deploy-id>--<site>.netlify.app`
 * permalink), NOT the custom domain the browser asked for. Resolving a redirect
 * against it — `new URL("/login", request.url)` — produced an absolute,
 * cross-origin Location that silently moved users off app.mulearn.org onto the
 * deploy permalink, stranding their session's cookies on the wrong origin and
 * pinning them to one frozen build.
 *
 * So every request below is built with a deploy-permalink origin, mimicking
 * what the runtime actually hands the handler in production.
 */

const DEPLOY_ORIGIN = "https://6a6cc2e0f109fa00089ea274--site-name.netlify.app";

const cookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: () => Promise.resolve(cookieStore),
}));

const refreshAccessTokenServer = vi.fn();
vi.mock("@/api/refresh.server", () => ({
  refreshAccessTokenServer: (token: string) => refreshAccessTokenServer(token),
}));

const { GET } = await import("./route");

function requestFor(ruri: string): NextRequest {
  return new NextRequest(
    `${DEPLOY_ORIGIN}/api/auth/refresh?ruri=${encodeURIComponent(ruri)}`,
  );
}

/** A Location the browser will resolve against whatever origin it is already on. */
function expectSameOriginRedirect(location: string | null) {
  expect(location).toBeTruthy();
  expect(location).not.toContain("netlify.app");
  expect(location?.startsWith("/")).toBe(true);
  // "//host" is protocol-relative — off-origin despite the leading slash.
  expect(location?.startsWith("//")).toBe(false);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("refresh route — redirects stay on the caller's origin", () => {
  it("returns a relative Location after a successful refresh", async () => {
    cookieStore.get.mockReturnValue({ value: "refresh-token" });
    refreshAccessTokenServer.mockResolvedValue("new-access-token");

    const res = await GET(requestFor("dashboard/connect-discord?code=ABC123"));

    expect(res.status).toBe(307);
    expectSameOriginRedirect(res.headers.get("location"));
    expect(res.headers.get("location")).toBe(
      "/dashboard/connect-discord?code=ABC123",
    );
  });

  it("returns a relative Location when the refreshToken is missing", async () => {
    cookieStore.get.mockReturnValue(undefined);

    const res = await GET(requestFor("dashboard/connect-discord?code=ABC123"));

    expectSameOriginRedirect(res.headers.get("location"));
    expect(res.headers.get("location")).toBe(
      "/login?ruri=dashboard%2Fconnect-discord%3Fcode%3DABC123",
    );
  });

  it("returns a relative Location when the refresh call fails", async () => {
    cookieStore.get.mockReturnValue({ value: "refresh-token" });
    refreshAccessTokenServer.mockRejectedValue(new Error("backend down"));

    const res = await GET(requestFor("dashboard"));

    expectSameOriginRedirect(res.headers.get("location"));
    expect(res.headers.get("location")).toBe("/login?ruri=dashboard");
  });

  it("still falls back to /dashboard for a hostile ruri", async () => {
    cookieStore.get.mockReturnValue({ value: "refresh-token" });
    refreshAccessTokenServer.mockResolvedValue("new-access-token");

    const res = await GET(requestFor("https://evil.com"));

    expectSameOriginRedirect(res.headers.get("location"));
    expect(res.headers.get("location")).toBe("/dashboard");
  });
});
