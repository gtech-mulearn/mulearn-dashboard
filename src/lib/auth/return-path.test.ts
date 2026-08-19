import { describe, expect, it } from "vitest";
import { sanitizeReturnPath } from "./return-path";

describe("sanitizeReturnPath — query preservation", () => {
  it("keeps the query string on an allowed path (the Discord ?code= case)", () => {
    expect(sanitizeReturnPath("dashboard/connect-discord?code=ABC123")).toBe(
      "dashboard/connect-discord?code=ABC123",
    );
  });

  it("keeps multiple query params", () => {
    expect(sanitizeReturnPath("dashboard/connect-discord?code=A&state=B")).toBe(
      "dashboard/connect-discord?code=A&state=B",
    );
  });

  it("returns a bare path unchanged when there is no query", () => {
    expect(sanitizeReturnPath("dashboard/profile")).toBe("dashboard/profile");
  });

  it("tolerates a leading slash", () => {
    expect(sanitizeReturnPath("/dashboard/connect-discord?code=X")).toBe(
      "dashboard/connect-discord?code=X",
    );
  });

  it("does not let an '@' inside a query value trip the path guard", () => {
    expect(sanitizeReturnPath("dashboard/profile?email=a@b.com")).toBe(
      "dashboard/profile?email=a%40b.com",
    );
  });
});

describe("sanitizeReturnPath — open-redirect protection", () => {
  it.each([
    ["//evil.com", "protocol-relative host"],
    ["https://evil.com", "absolute URL"],
    ["http://evil.com/dashboard", "absolute URL with allowed-looking path"],
    ["dashboard@evil.com", "userinfo trick"],
    ["\\\\evil.com", "backslash host"],
    ["../../etc/passwd", "traversal"],
    ["admin/secret", "path outside the allowlist"],
  ])("falls back to dashboard for %s (%s)", (input) => {
    expect(sanitizeReturnPath(input)).toBe("dashboard");
  });

  it("drops a query that came with a rejected path", () => {
    expect(sanitizeReturnPath("https://evil.com?code=X")).toBe("dashboard");
  });

  it("strips control characters from the query", () => {
    expect(
      sanitizeReturnPath("dashboard?a=b\r\nSet-Cookie:%20x"),
    ).not.toContain("\n");
  });
});
