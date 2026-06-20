import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { getBaseUrl } from "@/api/base-url.server";
import { refreshAccessTokenServer } from "@/api/refresh.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
};

function isTokenExpiredResponse(status: number, data: unknown): boolean {
  if (status === 401) return true;

  if (
    data &&
    typeof data === "object" &&
    "statusCode" in data &&
    (data as { statusCode: number }).statusCode === 1000
  ) {
    return true;
  }

  if (data && typeof data === "object" && "message" in data) {
    const msg = data as { message?: { general?: (string | unknown)[] } };
    return (
      msg.message?.general?.some(
        (m) =>
          typeof m === "string" &&
          (m.toLowerCase().includes("token expired") ||
            m.toLowerCase().includes("token invalid") ||
            m.toLowerCase().includes("invalid token")),
      ) === true
    );
  }

  return false;
}

/** BFF proxy mount point — everything after this is the upstream Django path. */
const PROXY_PREFIX = "/api/backend";

export function buildUpstreamUrl(pathname: string, search: string): string {
  const upstreamPath = pathname.slice(PROXY_PREFIX.length);
  return `${getBaseUrl()}${upstreamPath}${search}`;
}

function buildForwardHeaders(
  request: NextRequest,
  accessToken: string | undefined,
): Headers {
  const headers = new Headers();

  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return headers;
}

function filterResponseHeaders(upstream: Response): Headers {
  const headers = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });
  // Remove set-cookie from upstream — we manage cookies ourselves
  headers.delete("set-cookie");
  return headers;
}

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  // `params.path` is awaited to satisfy the route contract, but the upstream
  // URL is built from the pathname so the trailing slash is preserved.
  await params;
  const search = request.nextUrl.search;
  const url = buildUpstreamUrl(request.nextUrl.pathname, search);
  const method = request.method;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  const hasBody = method !== "GET" && method !== "HEAD";
  const body = hasBody ? await request.arrayBuffer() : undefined;

  const upstreamHeaders = buildForwardHeaders(request, accessToken);

  let upstream = await fetch(url, {
    method,
    headers: upstreamHeaders,
    body: body ? Buffer.from(body) : undefined,
    cache: "no-store",
  });

  // Check if we need to refresh the token
  const contentType = upstream.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  if (upstream.status === 401 || (upstream.status === 403 && isJson)) {
    let responseData: unknown = null;

    if (isJson) {
      responseData = await upstream.json().catch(() => null);
    }

    if (isTokenExpiredResponse(upstream.status, responseData)) {
      if (refreshToken) {
        const newAccessToken = await refreshAccessTokenServer(refreshToken);

        if (newAccessToken) {
          // Set new cookies
          cookieStore.set("accessToken", newAccessToken, {
            ...COOKIE_OPTIONS,
            expires: new Date(Date.now() + 86_400_000),
          });
          cookieStore.set("isAuthenticated", "true", {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            expires: new Date(Date.now() + 86_400_000),
          });

          // Retry with new token
          const retryHeaders = buildForwardHeaders(request, newAccessToken);
          upstream = await fetch(url, {
            method,
            headers: retryHeaders,
            body: body ? Buffer.from(body) : undefined,
            cache: "no-store",
          });
        } else {
          // Refresh failed — clear cookies
          cookieStore.delete("accessToken");
          cookieStore.delete("refreshToken");
          cookieStore.delete("isAuthenticated");
          return NextResponse.json(
            { hasError: true, message: "Session expired" },
            { status: 401 },
          );
        }
      } else {
        // No refresh token — session is dead
        cookieStore.delete("accessToken");
        cookieStore.delete("isAuthenticated");
        return NextResponse.json(
          { hasError: true, message: "Session expired" },
          { status: 401 },
        );
      }
    } else if (responseData !== null) {
      // Permission 403, not token expiry — pass through as-is
      return NextResponse.json(responseData, {
        status: upstream.status,
        headers: filterResponseHeaders(upstream),
      });
    }
  }

  // Stream response back
  const responseHeaders = filterResponseHeaders(upstream);

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const HEAD = handler;
