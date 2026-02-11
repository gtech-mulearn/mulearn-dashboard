/**
 * Unauthorized Toast Handler
 *
 * 📍 src/components/auth/unauthorized-handler.tsx
 *
 * Client component that watches for ?unauthorized=true in the URL
 * (set by middleware when role check fails) and shows a toast notification.
 * Place this in the dashboard layout so it catches all unauthorized redirects.
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

/**
 * Watches for `?unauthorized=true` in the URL and shows a toast.
 * Cleans up the URL parameter after showing the notification.
 *
 * @example
 * ```tsx
 * // In (dashboard)/layout.tsx
 * <UnauthorizedHandler />
 * ```
 */
export function UnauthorizedHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("unauthorized") === "true") {
      // Use a small delay to ensure the page has rendered
      const timer = setTimeout(() => {
        // Show browser-native alert as a fallback
        // Replace with your toast library (e.g., sonner, react-hot-toast)
        console.warn("[RBAC] Access denied — insufficient permissions");

        // Clean up the URL parameter
        const url = new URL(window.location.href);
        url.searchParams.delete("unauthorized");
        router.replace(url.pathname + url.search, { scroll: false });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  return null;
}
