import Cookies from "js-cookie";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const IS_AUTHENTICATED_KEY = "isAuthenticated";
const TEMP_TOKEN_KEY = "tempToken";

/**
 * `sameSite: "lax"` is deliberate — do NOT "harden" this back to "strict".
 *
 * Strict cookies are withheld on cross-site top-level navigations, which is
 * exactly what an OAuth callback is. Under Strict, Discord's redirect back to
 * /dashboard/connect-discord?code=… arrived with no accessToken AND no
 * refreshToken, so the edge proxy read a logged-in user as logged out and
 * bounced them to /login — the Connect Discord flow could never complete.
 *
 * Lax still blocks the cases that matter for CSRF (cross-site POSTs, iframes,
 * subresource requests) and only relaxes top-level GET navigations. Any inbound
 * redirect — payment callbacks, SSO, magic links — depends on this.
 */
const baseCookieOptions = {
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export const authStore = {
  setTokens: (accessToken: string, refreshToken: string) => {
    Cookies.set(ACCESS_TOKEN_KEY, accessToken, {
      ...baseCookieOptions,
      expires: 15 / (24 * 60), // 15 minutes (JWT lifetime)
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

  clearTokens: () => {
    Cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });
    Cookies.remove(REFRESH_TOKEN_KEY, { path: "/" });
    Cookies.remove(IS_AUTHENTICATED_KEY, { path: "/" });
    Cookies.remove(TEMP_TOKEN_KEY, { path: "/" });

    // Wipe form drafts that are persisted to localStorage so they don't bleed
    // over to the next user who logs in on the same browser.
    if (typeof window !== "undefined") {
      localStorage.removeItem("mentor-onboarding-draft");
    }
  },

  clearTempToken: async () => {
    Cookies.remove(TEMP_TOKEN_KEY, { path: "/" });
  },
};
