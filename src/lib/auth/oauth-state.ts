/**
 * Browser-side OAuth `state` memory — the half of audit finding F5 that
 * actually closes login CSRF.
 *
 * The server (authserver/muauth/oauth_state.py) issues a single-use state and
 * consumes it on the callback. That alone is not sufficient: an attacker can
 * start their own sign-in, obtain a legitimately-issued state alongside their
 * code, and deliver the whole callback URL to a victim. The server would
 * happily consume a state it really did issue.
 *
 * What defeats that is the *initiating browser* remembering which state it
 * started with and refusing any callback that does not match. That is this
 * module. Both halves are required; neither works alone.
 *
 * sessionStorage, not localStorage: the value must survive the top-level
 * cross-site redirect back from Google (it does — same tab, same origin) but
 * must not outlive the tab or leak to other tabs mid-flow.
 *
 * Storage is injectable so this is unit-testable without touching globals,
 * mirroring the Django-free module pattern used on the server side.
 */

const STATE_KEY = "google_oauth_state";

export class OAuthStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OAuthStateError";
  }
}

function defaultStore(): Storage {
  if (typeof window === "undefined") {
    throw new OAuthStateError("OAuth state is only available in the browser");
  }
  return window.sessionStorage;
}

/**
 * Record the state we are about to send to the provider.
 * Overwrites any previous value — starting a new flow abandons the old one.
 */
export function rememberState(state: string, store?: Storage): void {
  (store ?? defaultStore()).setItem(STATE_KEY, state);
}

/**
 * Verify a returned state against the remembered one, then forget it.
 *
 * Always clears, including on failure: a rejected callback must not leave a
 * live state behind for a second attempt.
 *
 * @throws OAuthStateError when the state is missing, unknown, or mismatched.
 */
export function consumeState(
  returned: string | null | undefined,
  store?: Storage,
): void {
  const target = store ?? defaultStore();
  const remembered = target.getItem(STATE_KEY);
  target.removeItem(STATE_KEY);

  if (!returned) {
    throw new OAuthStateError("Missing state parameter");
  }
  if (!remembered) {
    throw new OAuthStateError("No sign-in was started in this browser");
  }
  if (remembered !== returned) {
    throw new OAuthStateError("Invalid or expired sign-in request");
  }
}
