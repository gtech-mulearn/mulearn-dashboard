/**
 * PKCE — Proof Key for Code Exchange (RFC 7636).
 *
 * What it defends against
 * -----------------------
 * The authorization code comes back through the browser, so it passes through
 * places we do not control: the address bar, browser history, a referrer
 * header, a proxy log. If someone steals it, they can exchange it for tokens.
 *
 * PKCE makes a stolen code useless on its own. We invent a secret (the
 * verifier) and send only its SHA-256 hash (the challenge) when starting the
 * flow. Exchanging the code requires the original secret, which never left our
 * server.
 *
 * Why this runs server-side
 * -------------------------
 * These helpers are used by the BFF route handlers, not by browser code. The
 * verifier is held in an httpOnly cookie, so JavaScript on the page cannot read
 * it — which means an XSS bug cannot complete a code exchange. Audit finding
 * F12 is that tokens were readable by any script on the page; putting the
 * verifier and the refresh token beyond JavaScript's reach is the fix.
 *
 * Uses Web Crypto, available in both Node 18+ and browsers, so there is no
 * dependency and no Node-only import.
 */

/** RFC 7636 §4.1 allows 43–128 characters. 64 bytes gives 86, comfortably inside. */
const VERIFIER_BYTES = 64;

/** RFC 7636 §4.1 unreserved set: ALPHA / DIGIT / "-" / "." / "_" / "~" */
const UNRESERVED =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

/**
 * base64url without padding, per RFC 7636 §A.
 *
 * Standard base64 is NOT interchangeable here: `+` and `/` are not URL-safe and
 * `=` padding is explicitly forbidden. Getting this wrong produces a challenge
 * the server computes differently, and every exchange fails with an error that
 * points nowhere useful.
 */
export function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * A fresh code verifier.
 *
 * Built from the unreserved set directly rather than base64url-encoding random
 * bytes, so every character is unambiguously legal and no encoding step can
 * introduce one that is not.
 */
export function createCodeVerifier(): string {
  const bytes = randomBytes(VERIFIER_BYTES);
  let verifier = "";
  for (const byte of bytes) {
    // Modulo bias here is irrelevant: the set is 66 characters and the result
    // needs unguessability, not a perfectly uniform distribution.
    verifier += UNRESERVED[byte % UNRESERVED.length];
  }
  return verifier;
}

/**
 * The S256 challenge for a verifier.
 *
 * S256 only. The `plain` method sends the verifier itself as the challenge,
 * which defends against nothing — anyone who intercepts the authorization
 * request also has the secret. Our provider advertises only S256, and this
 * mirrors that.
 */
export async function createCodeChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier),
  );
  return base64UrlEncode(new Uint8Array(digest));
}

/**
 * A random value for the `state` parameter.
 *
 * Separate from the verifier and serving a different purpose: `state` ties the
 * callback to the browser that started the flow (CSRF), while PKCE ties the
 * code exchange to the client that requested it. Audit finding F5 was a missing
 * `state`; PKCE does not replace it.
 */
export function createState(): string {
  return base64UrlEncode(randomBytes(32));
}

/**
 * Constant-time-ish comparison for the returned `state`.
 *
 * A plain `===` on strings can leak length and prefix through timing. The
 * exposure over a network is negligible, but the correct comparison costs
 * nothing and removes the question.
 */
export function statesMatch(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
