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
