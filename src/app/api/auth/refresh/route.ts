/**
 * Token Refresh Route Handler
 *
 * 📍 src/app/api/auth/refresh/route.ts
 *
 * Called by middleware when a role-protected route is accessed but the
 * accessToken cookie is absent (expired) while a refreshToken is still present.
 *
 * Flow:
 *   1. Read refreshToken from cookies.
 *   2. Exchange it for a new accessToken via the backend.
 *   3. Set the new accessToken as a server-side cookie.
 *   4. Redirect the user back to the originally requested route (ruri param).
 *
 * If refresh fails, redirect to /login.
 */

import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { refreshAccessToken } from "@/features/auth/api/auth.api";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const rawPath = searchParams.get("ruri") ?? "dashboard";
  const returnPath = rawPath
    .replace(/^[/\\]+/, "")
    .replace(/\\/g, "/")
    .split("?")[0];

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("ruri", returnPath);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const result = await refreshAccessToken(refreshToken);
    const newAccessToken = result.accessToken;

    if (!newAccessToken) {
      throw new Error("No access token in refresh response");
    }

    cookieStore.set("accessToken", newAccessToken, {
      httpOnly: true,
      expires: new Date(Date.now() + 86_400_000), // 1 day
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return NextResponse.redirect(new URL(`/${returnPath}`, request.url));
  } catch {
    cookieStore.delete("refreshToken");
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("ruri", returnPath);
    return NextResponse.redirect(loginUrl);
  }
}
