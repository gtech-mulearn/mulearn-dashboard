// @vitest-environment node

/**
 * BFF Proxy URL-building Tests
 *
 * 📍 src/app/api/backend/[...path]/route.test.ts
 *
 * Guards against the trailing-slash loss that triggers Django's APPEND_SLASH
 * RuntimeError on POST/PUT/PATCH. The upstream URL is rebuilt from the request
 * pathname (not the catch-all segments) so the exact trailing-slash the client
 * requested is preserved. Requires `skipTrailingSlashRedirect` in next.config
 * so Next.js does not 308-strip the slash before this handler runs. See
 * route.ts for details.
 */

import { describe, expect, it } from "vitest";
import { buildUpstreamUrl } from "./route";

describe("buildUpstreamUrl", () => {
  it("preserves a trailing slash on the forwarded URL", () => {
    const url = buildUpstreamUrl(
      "/api/backend/api/v1/auth/user-authentication/",
      "",
    );
    expect(url).toBe("http://localhost:8000/api/v1/auth/user-authentication/");
  });

  it("does not add a trailing slash when the request had none", () => {
    const url = buildUpstreamUrl(
      "/api/backend/api/v1/dashboard/profile/badges/MUID123",
      "",
    );
    expect(url).toBe(
      "http://localhost:8000/api/v1/dashboard/profile/badges/MUID123",
    );
  });

  it("keeps the query string after the trailing slash", () => {
    const url = buildUpstreamUrl(
      "/api/backend/api/v1/dashboard/user/search/",
      "?search=foo&perPage=10",
    );
    expect(url).toBe(
      "http://localhost:8000/api/v1/dashboard/user/search/?search=foo&perPage=10",
    );
  });
});
