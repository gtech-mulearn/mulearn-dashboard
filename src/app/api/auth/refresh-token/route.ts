import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { refreshAccessTokenServer } from "@/api/refresh.server";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  try {
    const newAccessToken = await refreshAccessTokenServer(refreshToken);

    if (!newAccessToken) {
      return NextResponse.json(
        { error: "Refresh returned no token" },
        { status: 401 },
      );
    }

    const isProduction = process.env.NODE_ENV === "production";

    cookieStore.set("accessToken", newAccessToken, {
      httpOnly: true,
      expires: new Date(Date.now() + 86_400_000),
      secure: isProduction,
      sameSite: "strict",
      path: "/",
    });

    cookieStore.set("isAuthenticated", "true", {
      expires: new Date(Date.now() + 86_400_000),
      secure: isProduction,
      sameSite: "strict",
      path: "/",
    });

    // Keep the client-readable session flag alive in step with the access
    // token so a still-valid refresh session isn't mistaken for "logged out"
    // by client guards once the original flag expires.
    cookieStore.set("isAuthenticated", "true", {
      httpOnly: true,
      expires: new Date(Date.now() + 86_400_000),
      secure: isProduction,
      sameSite: "strict",
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch {
    cookieStore.delete("refreshToken");
    cookieStore.delete("accessToken");
    cookieStore.delete("isAuthenticated");
    return NextResponse.json({ error: "Refresh failed" }, { status: 401 });
  }
}
