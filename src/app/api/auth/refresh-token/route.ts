import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { refreshAccessToken } from "@/features/auth/api/auth.api";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  try {
    const result = await refreshAccessToken(refreshToken);
    const newAccessToken = result.accessToken;

    if (!newAccessToken) {
      return NextResponse.json(
        { error: "Refresh returned no token" },
        { status: 401 },
      );
    }

    const isProduction = process.env.NODE_ENV === "production";

    cookieStore.set("accessToken", newAccessToken, {
      httpOnly: false,
      expires: new Date(Date.now() + 86_400_000),
      secure: isProduction,
      sameSite: "strict",
      path: "/",
    });

    return NextResponse.json({ accessToken: newAccessToken });
  } catch {
    cookieStore.delete("refreshToken");
    cookieStore.delete("accessToken");
    cookieStore.delete("isAuthenticated");
    return NextResponse.json({ error: "Refresh failed" }, { status: 401 });
  }
}
