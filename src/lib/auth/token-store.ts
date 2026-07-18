import Cookies from "js-cookie";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const IS_AUTHENTICATED_KEY = "isAuthenticated";
const TEMP_TOKEN_KEY = "tempToken";

const baseCookieOptions = {
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
};

export const authStore = {
  setTokens: async (accessToken: string, refreshToken: string) => {
    Cookies.set(ACCESS_TOKEN_KEY, accessToken, {
      ...baseCookieOptions,
      expires: 1,
    });
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
      ...baseCookieOptions,
      expires: 7,
    });
    Cookies.set(IS_AUTHENTICATED_KEY, "true", {
      ...baseCookieOptions,
      expires: 1,
    });
  },

  setTempToken: async (tempToken: string) => {
    Cookies.set(TEMP_TOKEN_KEY, tempToken, {
      ...baseCookieOptions,
      expires: 15 / (24 * 60), // 15 minutes (token lifetime)
    });
  },

  /** Access token for the Authorization header. undefined when logged out. */
  getAccessToken: () => Cookies.get(ACCESS_TOKEN_KEY),

  /** Refresh token used by the client-side refresh flow. */
  getRefreshToken: () => Cookies.get(REFRESH_TOKEN_KEY),

  getTempToken: () => Cookies.get(TEMP_TOKEN_KEY),

  /**
   * Client-readable session flag. Stays set across short-lived access-token
   * expiry so guards can tell "the user has a session" and let the client
   * refresh flow run.
   */
  isAuthenticated: () => Cookies.get(IS_AUTHENTICATED_KEY) === "true",

  clearTokens: async () => {
    Cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });
    Cookies.remove(REFRESH_TOKEN_KEY, { path: "/" });
    Cookies.remove(IS_AUTHENTICATED_KEY, { path: "/" });
    Cookies.remove(TEMP_TOKEN_KEY, { path: "/" });
  },

  clearTempToken: async () => {
    Cookies.remove(TEMP_TOKEN_KEY, { path: "/" });
  },
};
