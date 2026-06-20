import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { accessToken, refreshToken } = body as {
    accessToken?: string;
    refreshToken?: string;
  };

  if (!accessToken || !refreshToken) {
    return NextResponse.json({ error: "Missing tokens" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === "production";

  cookieStore.set("accessToken", accessToken, {
    httpOnly: true,
    expires: new Date(Date.now() + 86_400_000), // 1 day
    secure: isProduction,
    sameSite: "strict",
    path: "/",
  });

  cookieStore.set("refreshToken", refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + 7 * 86_400_000), // 7 days
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

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  cookieStore.delete("isAuthenticated");
  return NextResponse.json({ success: true });
}
