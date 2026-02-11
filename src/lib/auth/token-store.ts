/**
 * Auth Token Store
 *
 * 📍 src/lib/auth/token-store.ts
 *
 * Manages access and refresh tokens using cookies.
 * This allows middleware to access tokens for route protection.
 *
 * Previously located at src/lib/auth.ts — moved here to colocate
 * with the rest of the auth library.
 */

import Cookies from "js-cookie";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export const authStore = {
  setTokens: (accessToken: string, refreshToken: string) => {
    Cookies.set(ACCESS_TOKEN_KEY, accessToken, {
      expires: 1, // 1 day
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
  },

  getAccessToken: () => {
    return Cookies.get(ACCESS_TOKEN_KEY);
  },

  getRefreshToken: () => {
    return Cookies.get(REFRESH_TOKEN_KEY);
  },

  clearTokens: () => {
    Cookies.remove(ACCESS_TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
  },
};
