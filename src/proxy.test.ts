import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { proxy } from "./proxy";

/**
 * Build a fake (unsigned) JWT whose payload carries the given claims. The proxy
 * only base64url-decodes the payload — it never verifies the signature — so a
 * dummy header/signature is fine for these tests.
 */
function makeToken(payload: Record<string, unknown>): string {
  const b64 = (obj: unknown) =>
    Buffer.from(JSON.stringify(obj))
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  return `${b64({ alg: "HS256", typ: "JWT" })}.${b64(payload)}.sig`;
}

function requestFor(
  pathname: string,
  cookies: Record<string, string>,
): NextRequest {
  const url = `https://app.test${pathname}`;
  const cookieHeader = Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
  return new NextRequest(url, { headers: { cookie: cookieHeader } });
}

const FUTURE = "2999-01-01 00:00:00+00:00";
const PAST = "2000-01-01 00:00:00+00:00";

describe("proxy access-token recovery", () => {
  it("redirects to refresh when the accessToken cookie is missing", () => {
    const res = proxy(requestFor("/dashboard", { refreshToken: "r" }));
    expect(res.headers.get("location")).toContain("/api/auth/refresh");
  });

  it("redirects to refresh when the accessToken JWT is expired", () => {
    const res = proxy(
      requestFor("/dashboard", {
        accessToken: makeToken({ expiry: PAST, roles: [] }),
        refreshToken: "r",
      }),
    );
    const location = res.headers.get("location");
    expect(location).toContain("/api/auth/refresh");
    expect(location).toContain("ruri=dashboard");
  });

  it("redirects to refresh when the accessToken is malformed", () => {
    const res = proxy(
      requestFor("/dashboard", {
        accessToken: "not-a-jwt",
        refreshToken: "r",
      }),
    );
    expect(res.headers.get("location")).toContain("/api/auth/refresh");
  });

  it("does NOT redirect when the accessToken JWT is still valid", () => {
    const res = proxy(
      requestFor("/dashboard", {
        accessToken: makeToken({ expiry: FUTURE, roles: [] }),
        refreshToken: "r",
      }),
    );
    // NextResponse.next() carries no Location header.
    expect(res.headers.get("location")).toBeNull();
  });
});

describe("proxy preserves the query string across auth detours", () => {
  // Regression: Discord's OAuth callback returns to
  // /dashboard/connect-discord?code=… . Any redirect that drops `code` breaks
  // the connect flow silently — the page renders idle and nothing happens.
  // Codes are single-use and short-lived, so they cannot be replayed.
  const OAUTH_RETURN = "/dashboard/connect-discord?code=DISCORD_CODE";

  it("carries ?code= into the login ruri when logged out", () => {
    const res = proxy(requestFor(OAUTH_RETURN, {}));
    const ruri = new URL(
      res.headers.get("location") as string,
    ).searchParams.get("ruri");
    expect(ruri).toBe("dashboard/connect-discord?code=DISCORD_CODE");
  });

  it("carries ?code= into the refresh ruri when the access token is stale", () => {
    const res = proxy(requestFor(OAUTH_RETURN, { refreshToken: "r" }));
    const location = res.headers.get("location") as string;
    expect(location).toContain("/api/auth/refresh");
    const ruri = new URL(location).searchParams.get("ruri");
    expect(ruri).toBe("dashboard/connect-discord?code=DISCORD_CODE");
  });

  it("passes the callback straight through when the session is live", () => {
    const res = proxy(
      requestFor(OAUTH_RETURN, {
        accessToken: makeToken({ expiry: FUTURE, roles: [] }),
        refreshToken: "r",
      }),
    );
    expect(res.headers.get("location")).toBeNull();
  });

  it("omits a trailing '?' for routes with no query", () => {
    const res = proxy(requestFor("/dashboard/profile", {}));
    const ruri = new URL(
      res.headers.get("location") as string,
    ).searchParams.get("ruri");
    expect(ruri).toBe("dashboard/profile");
  });
});

describe("proxy public routes", () => {
  it("allows unauthenticated requests to public profiles (/profile/<slug>)", () => {
    const res = proxy(requestFor("/profile/some-company", {}));
    // Unauthenticated request should NOT redirect (allowed through)
    expect(res.headers.get("location")).toBeNull();
  });

  it("protects /profile without a slug", () => {
    const res = proxy(requestFor("/profile", {}));
    // Should redirect to login since it is protected
    expect(res.headers.get("location")).toContain("/login");
  });

  it("protects the user's own profile (/dashboard/profile)", () => {
    const res = proxy(requestFor("/dashboard/profile", {}));
    // Should redirect to login since it is protected
    expect(res.headers.get("location")).toContain("/login");
  });
});

import { igLeadRole, ROLES } from "./lib/auth/roles";

describe("proxy jobs route policy", () => {
  it("grants access to ADMIN and STUDENT", () => {
    [ROLES.ADMIN, ROLES.STUDENT].forEach((role) => {
      const res = proxy(
        requestFor("/dashboard/jobs", {
          accessToken: makeToken({ expiry: FUTURE, roles: [role] }),
          refreshToken: "r",
        }),
      );
      // Allowed through
      expect(res.headers.get("location")).toBeNull();
    });
  });

  it("grants access to community roles like ENABLER", () => {
    const res = proxy(
      requestFor("/dashboard/jobs", {
        accessToken: makeToken({ expiry: FUTURE, roles: [ROLES.ENABLER] }),
        refreshToken: "r",
      }),
    );
    expect(res.headers.get("location")).toBeNull();
  });

  it("blocks MENTOR and COMPANY", () => {
    [ROLES.MENTOR, ROLES.COMPANY].forEach((role) => {
      const res = proxy(
        requestFor("/dashboard/jobs", {
          accessToken: makeToken({ expiry: FUTURE, roles: [role] }),
          refreshToken: "r",
        }),
      );
      const location = res.headers.get("location");
      expect(location).toContain("/dashboard");
      expect(location).toContain("unauthorized=true");
    });
  });
});

// Users hold several roles at once (a student who is also a mentor and a campus
// lead): a page opens if ANY role the user holds allows it.
describe("proxy: users who hold several roles", () => {
  const visit = (pathname: string, roles: string[]) =>
    proxy(
      requestFor(pathname, {
        accessToken: makeToken({ expiry: FUTURE, roles }),
        refreshToken: "r",
      }),
    ).headers.get("location");

  it("opens a route when any one of the user's roles allows it", () => {
    expect(
      visit("/dashboard/mentor", [ROLES.STUDENT, ROLES.MENTOR]),
    ).toBeNull();
    expect(
      visit("/dashboard/collaborations", [
        ROLES.STUDENT,
        ROLES.MENTOR,
        ROLES.CAMPUS_LEAD,
      ]),
    ).toBeNull();
    // The route allows Admin or IG Lead; holding just one of them is enough.
    expect(
      visit("/dashboard/edit-ig", [ROLES.STUDENT, ROLES.IG_LEAD]),
    ).toBeNull();
  });

  it("redirects when none of the user's roles allows it", () => {
    for (const [path, roles] of [
      ["/dashboard/mentor", [ROLES.STUDENT, ROLES.COMPANY]],
      ["/dashboard/collaborations", [ROLES.STUDENT, ROLES.MENTOR]],
    ] as const) {
      const location = visit(path, [...roles]);
      expect(location).toContain("/dashboard");
      expect(location).toContain("unauthorized=true");
    }
  });

  it("combines per-interest-group lead roles with ordinary roles", () => {
    expect(
      visit("/dashboard/collaborations", [ROLES.STUDENT, igLeadRole("WEB")]),
    ).toBeNull();
    expect(
      visit("/dashboard/edit-ig", [ROLES.MENTOR, igLeadRole("AI")]),
    ).toBeNull();
    expect(
      visit("/dashboard/edit-ig", [ROLES.MENTOR, ROLES.STUDENT]),
    ).toContain("unauthorized=true");
  });

  // Known gap: /dashboard/jobs excludes every Mentor and Company instead of
  // allowing roles, so a Student who is also a Mentor is turned away. This test
  // documents the intended rule and is expected to fail until the route is fixed;
  // when it starts passing, drop the .fails.
  it.fails("opens /dashboard/jobs for a Student who is also a Mentor", () => {
    expect(visit("/dashboard/jobs", [ROLES.STUDENT, ROLES.MENTOR])).toBeNull();
  });
});
