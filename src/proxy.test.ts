/**
 * Proxy (middleware) Auth Routing Tests
 *
 * 📍 src/proxy.test.ts
 *
 * Guards against the /dashboard ⇄ /login redirect loop that occurs when the
 * short-lived accessToken + isAuthenticated cookies expire (1 day) while the
 * longer-lived refreshToken survives (7 days). See proxy.ts for details.
 */

import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { proxy } from "./proxy";

function requestFor(
  pathname: string,
  cookies: Record<string, string>,
): NextRequest {
  const req = new NextRequest(new URL(`https://app.test${pathname}`));
  for (const [name, value] of Object.entries(cookies)) {
    req.cookies.set(name, value);
  }
  return req;
}

function locationOf(res: ReturnType<typeof proxy>): string | null {
  const location = res.headers.get("location");
  if (!location) return null;
  return new URL(location).pathname;
}

describe("proxy auth routing", () => {
  describe("returning user: accessToken expired, refreshToken alive", () => {
    it("recovers via /api/auth/refresh on the dashboard home (roles: [])", () => {
      // The exact loop scenario: only the 7-day refreshToken survives.
      const res = proxy(requestFor("/dashboard", { refreshToken: "r.t.k" }));
      // Must NOT just render the page (which leaves the client guard with no
      // isAuthenticated flag → push to /login → bounce back → loop).
      expect(locationOf(res)).toBe("/api/auth/refresh");
    });

    it("recovers via /api/auth/refresh on a role-gated route too", () => {
      const res = proxy(
        requestFor("/dashboard/management", { refreshToken: "r.t.k" }),
      );
      expect(locationOf(res)).toBe("/api/auth/refresh");
    });
  });

  it("does NOT loop /login back to /dashboard once refreshToken is the only cookie and login is reached after refresh failure", () => {
    // After a failed refresh clears refreshToken, /login must render.
    const res = proxy(requestFor("/login", {}));
    expect(locationOf(res)).not.toBe("/dashboard");
  });

  it("redirects unauthenticated users away from protected routes to /login", () => {
    const res = proxy(requestFor("/dashboard", {}));
    expect(locationOf(res)).toBe("/login");
  });

  it("lets a fully-authenticated user render the dashboard", () => {
    // Valid (non-expired) token with a role → header-less passthrough.
    const future = new Date(Date.now() + 60 * 60 * 1000)
      .toISOString()
      .replace("T", " ")
      .slice(0, 19);
    const header = Buffer.from(JSON.stringify({ alg: "HS256" })).toString(
      "base64url",
    );
    const payload = Buffer.from(
      JSON.stringify({ roles: ["Mentor"], expiry: future }),
    ).toString("base64url");
    const token = `${header}.${payload}.sig`;
    const res = proxy(
      requestFor("/dashboard", {
        accessToken: token,
        refreshToken: "r.t.k",
        isAuthenticated: "true",
      }),
    );
    expect(locationOf(res)).toBeNull();
  });
});
