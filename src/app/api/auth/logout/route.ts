import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { endpoints } from "@/api/endpoints";
import { publicServerClient } from "@/api/server";

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

  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  cookieStore.delete("isAuthenticated");
  cookieStore.delete("tempToken");

  return NextResponse.json({ success: true });
}
