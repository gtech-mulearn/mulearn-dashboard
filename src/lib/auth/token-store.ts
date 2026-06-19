/**
 * Auth Token Store
 *
 * Manages access and refresh tokens using a hybrid approach:
 * - Access token: client-readable cookie (needed for Authorization header)
 * - Refresh token: httpOnly cookie via server route handler (not JS-accessible)
 * - isAuthenticated: client-readable flag for UI state
 *
 * Token writes go through /api/auth/set-tokens to set httpOnly refresh token.
 * Token clears go through DELETE /api/auth/set-tokens.
 */

import Cookies from "js-cookie";

const ACCESS_TOKEN_KEY = "accessToken";
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

  getAccessToken: () => {
    return Cookies.get(ACCESS_TOKEN_KEY);
  },

  /**
   * Client-readable session flag. Stays set across short-lived access-token
   * expiry (the refresh token is httpOnly and not visible to JS), so this is
   * the signal for "the user has a session" even when the access-token cookie
   * has already expired and needs a refresh.
   */
  isAuthenticated: () => {
    return Cookies.get(IS_AUTHENTICATED_KEY) === "true";
  },

  clearTokens: async () => {
    await fetch("/api/auth/set-tokens", { method: "DELETE" });
    Cookies.remove(IS_AUTHENTICATED_KEY);
  },
};
