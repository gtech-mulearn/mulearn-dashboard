/**
 * Auth Token Store
 *
 * Manages access and refresh tokens using httpOnly cookies via server routes.
 * - Access token: httpOnly cookie (never JS-accessible)
 * - Refresh token: httpOnly cookie via server route handler
 * - isAuthenticated: client-readable flag for UI state
 *
 * Token writes go through /api/auth/set-tokens to set httpOnly cookies.
 * Token clears go through DELETE /api/auth/set-tokens.
 */

import Cookies from "js-cookie";

const IS_AUTHENTICATED_KEY = "isAuthenticated";

export const authStore = {
  setTokens: async (accessToken: string, refreshToken: string) => {
    await fetch("/api/auth/set-tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken, refreshToken }),
    });

    Cookies.set(IS_AUTHENTICATED_KEY, "true", {
      expires: 1,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
  },

  isAuthenticated: () => {
    return Cookies.get(IS_AUTHENTICATED_KEY) === "true";
  },

  clearTokens: async () => {
    await fetch("/api/auth/set-tokens", { method: "DELETE" });
    Cookies.remove(IS_AUTHENTICATED_KEY);
  },
};
