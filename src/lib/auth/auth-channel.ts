/**
 * Auth messages between this site's open tabs, on a BroadcastChannel (ADR-010, issue 0023).
 *
 * 📍 src/lib/auth/auth-channel.ts
 *
 * - After a token refresh, the refreshing tab posts { type: "refreshed" }.
 * - After a refused refresh or an explicit sign-out, it posts { type: "signed-out" }, and every
 *   other tab clears its tokens and goes to sign-in (listenForSignOut, mounted in Providers).
 *
 * A tab ignores its own messages: it signs itself out through the API client or the logout
 * handler. Where BroadcastChannel doesn't exist, posting and listening do nothing.
 */

import { authStore } from "./token-store";

export const AUTH_CHANNEL = "mulearn-auth";

export type AuthMessage = {
  type: "refreshed" | "signed-out";
  /** The posting tab, so it can ignore its own messages. */
  from: string;
};

const TAB_ID =
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

// The pages for signed-out users: the proxy's AUTH_ROUTES (src/proxy.ts) and the OAuth callback,
// which is a sign-in in progress. A tab on one of them stays where it is.
const SIGNED_OUT_PAGES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/callback",
];

export function isSignedOutPage(pathname: string): boolean {
  return (
    pathname === "/" ||
    SIGNED_OUT_PAGES.some(
      (page) => pathname === page || pathname.startsWith(`${page}/`),
    )
  );
}

export function postAuthMessage(type: AuthMessage["type"]): void {
  if (typeof BroadcastChannel === "undefined") return;
  const channel = new BroadcastChannel(AUTH_CHANNEL);
  channel.postMessage({ type, from: TAB_ID } satisfies AuthMessage);
  channel.close();
}

/** Tell the other tabs this one signed out. Call it after clearing the tokens. */
export function announceSignedOut(): void {
  postAuthMessage("signed-out");
}

function goToSignIn(): void {
  authStore.clearTokens();
  if (!isSignedOutPage(window.location.pathname)) {
    window.location.href = "/login";
  }
}

/**
 * Sign this tab out when another tab signs out or its refresh is refused. Returns a function
 * that stops listening.
 */
export function listenForSignOut(onSignedOut: () => void = goToSignIn) {
  if (typeof BroadcastChannel === "undefined") return () => {};
  const channel = new BroadcastChannel(AUTH_CHANNEL);
  channel.onmessage = (event: MessageEvent<AuthMessage>) => {
    if (event.data?.type === "signed-out" && event.data.from !== TAB_ID) {
      onSignedOut();
    }
  };
  return () => channel.close();
}
