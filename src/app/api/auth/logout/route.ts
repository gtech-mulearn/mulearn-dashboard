import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { endpoints } from "@/api/endpoints";
import { publicServerClient } from "@/api/server";
import { clearWhatsNewCookie } from "@/app/(dashboard)/whats-new-actions";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (refreshToken) {
    try {
      await publicServerClient.post(
        endpoints.auth.logout,
        { refreshToken },
        z.unknown(),
      );
    } catch (error) {
      console.error("Backend logout request failed:", error);
    }
  }

  const cookieOptions = {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
  };
  cookieStore.delete({ name: "accessToken", ...cookieOptions });
  cookieStore.delete({ name: "refreshToken", ...cookieOptions });
  cookieStore.delete({ name: "isAuthenticated", ...cookieOptions });
  cookieStore.delete({ name: "tempToken", ...cookieOptions });

  await clearWhatsNewCookie();

  return NextResponse.json({ success: true });
}
