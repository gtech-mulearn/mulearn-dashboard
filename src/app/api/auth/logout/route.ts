import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  // TODO(backend): the Django API exposes no logout/revoke endpoint, so the
  // refreshToken JWT stays valid server-side until it naturally expires. When a
  // revoke endpoint exists, POST the refreshToken to it here BEFORE deleting the
  // cookies for true server-side invalidation.
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  cookieStore.delete("isAuthenticated");
  return NextResponse.json({ success: true });
}
