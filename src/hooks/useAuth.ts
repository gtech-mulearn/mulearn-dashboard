/**
 * Auth Hook
 *
 * 📍 src/hooks/useAuth.ts
 *
 * Reactive authentication state.
 * Currently uses a simple interval check as a fallback since cookies don't emit events,
 * and relies on window focus/visibility to re-validate.
 */

import { useEffect, useState } from "react";
import { authStore } from "@/lib/auth";

export function useAuth() {
  // Initialize state based on current cookie existence
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => !!authStore.getAccessToken(),
  );

  useEffect(() => {
    // Function to check auth state
    const checkAuth = () => {
      const hasToken = !!authStore.getAccessToken();
      setIsAuthenticated((prev) => {
        if (prev !== hasToken) return hasToken;
        return prev;
      });
    };

    // Check on specific events
    window.addEventListener("focus", checkAuth);
    window.addEventListener("storage", checkAuth); // Cross-tab sync

    // Optional: Regular interval check (e.g., every 5 seconds) to catch cookie expiry
    const interval = setInterval(checkAuth, 5000);

    return () => {
      window.removeEventListener("focus", checkAuth);
      window.removeEventListener("storage", checkAuth);
      clearInterval(interval);
    };
  }, []);

  return { isAuthenticated };
}
