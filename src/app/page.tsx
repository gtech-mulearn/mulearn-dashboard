/**
 * Root Page - Login
 *
 * 📍 src/app/page.tsx
 *
 * The root page serves as the login entry point.
 * Authenticated users are redirected to /dashboard by middleware.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function HomePage() {
  // Check if user is authenticated (server-side)
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken");
  const refreshToken = cookieStore.get("refreshToken");

  // If authenticated, redirect to dashboard
  if (accessToken?.value || refreshToken?.value) {
    redirect("/dashboard");
  }

  // Otherwise, redirect to login page
  redirect("/login");
}
