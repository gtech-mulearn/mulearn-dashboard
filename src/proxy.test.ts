import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { proxy } from "./proxy";

/**
 * The FIFA break gate (see proxy.ts) short-circuits every request while it is
 * active, so the auth/RBAC suites below must run on a clock past its end. Each
 * test therefore starts at a fixed instant AFTER the break; the break's own
 * suite moves the clock back inside the window explicitly.
 * TEMPORARY: drop this stub when the break block is deleted.
 */
const AFTER_BREAK = new Date("2026-07-21T05:00:00Z"); // 10:30 IST, block lifted
const DURING_BREAK = new Date("2026-07-21T02:00:00Z"); // 07:30 IST, still dark

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(AFTER_BREAK);
});

afterEach(() => {
  vi.useRealTimers();
});

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

function requestFor(pathname: string, cookies: Record<string, string>) {
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

/** TEMPORARY: delete alongside the break gate in proxy.ts. */
describe("proxy FIFA break block", () => {
  const rewriteTarget = (res: Response) =>
    res.headers.get("x-middleware-rewrite");

  beforeEach(() => {
    vi.setSystemTime(DURING_BREAK);
  });

  it("ends at Tue 21 Jul 2026, 10:00 IST", () => {
    // 04:29 UTC is 09:59 IST — still blocked. 04:30 UTC is 10:00 — open.
    vi.setSystemTime(new Date("2026-07-21T04:29:59Z"));
    expect(rewriteTarget(proxy(requestFor("/dashboard", {})))).toContain(
      "/break",
    );

    vi.setSystemTime(new Date("2026-07-21T04:30:00Z"));
    expect(rewriteTarget(proxy(requestFor("/dashboard", {})))).toBeNull();
  });

  it("rewrites every page to /break, logged in or not", () => {
    const paths = [
      "/",
      "/login",
      "/register",
      "/dashboard",
      "/dashboard/jobs",
      "/dashboard/mujourney/abc",
      "/profile/some-company",
      "/onboarding/interests",
    ];
    for (const path of paths) {
      const res = proxy(
        requestFor(path, {
          accessToken: makeToken({ expiry: FUTURE, roles: [ROLES.ADMIN] }),
          refreshToken: "r",
        }),
      );
      expect(rewriteTarget(res), path).toContain("/break");
      // Rewrite, not redirect — the visited URL must survive the block.
      expect(res.headers.get("location"), path).toBeNull();
    }
  });

  it("answers /api with a JSON 503 instead of the page's HTML", () => {
    const res = proxy(requestFor("/api/auth/refresh", {}));
    expect(res.status).toBe(503);
    expect(res.headers.get("content-type")).toContain("application/json");
    expect(Number(res.headers.get("retry-after"))).toBeGreaterThan(0);
  });

  it("never lets a blocked response be cached", () => {
    expect(
      proxy(requestFor("/dashboard", {})).headers.get("cache-control"),
    ).toContain("no-store");
    expect(
      proxy(requestFor("/api/me", {})).headers.get("cache-control"),
    ).toContain("no-store");
  });

  it("lets the break page's own assets through", () => {
    for (const path of ["/_next/static/chunk.js", "/images/illustrations/x"]) {
      const res = proxy(requestFor(path, {}));
      expect(rewriteTarget(res), path).toBeNull();
      expect(res.headers.get("location"), path).toBeNull();
    }
  });
});

import { ROLES } from "./lib/auth/roles";

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
