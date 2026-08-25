import { describe, expect, it } from "vitest";
import {
  base64UrlEncode,
  createCodeChallenge,
  createCodeVerifier,
  createState,
  statesMatch,
} from "./pkce";

/**
 * These verify against RFC 7636 rather than against our own implementation.
 * A PKCE bug does not fail loudly — it fails as "invalid_grant" from the
 * provider, which points nowhere useful. The spec's own test vector is the
 * only way to know the encoding is right.
 */

describe("base64url encoding (RFC 7636 §A)", () => {
  it("uses the URL-safe alphabet and drops padding", () => {
    // 0xFF 0xFF 0xFE would be "///+" in standard base64.
    const encoded = base64UrlEncode(new Uint8Array([255, 255, 254]));
    expect(encoded).not.toContain("+");
    expect(encoded).not.toContain("/");
    expect(encoded).not.toContain("=");
  });

  it("drops padding that standard base64 would add", () => {
    // One byte encodes to two chars plus "==" in standard base64.
    expect(base64UrlEncode(new Uint8Array([0]))).toBe("AA");
  });
});

describe("code verifier", () => {
  it("is within the length the RFC allows", () => {
    const verifier = createCodeVerifier();
    expect(verifier.length).toBeGreaterThanOrEqual(43);
    expect(verifier.length).toBeLessThanOrEqual(128);
  });

  it("contains only unreserved characters", () => {
    // A character outside this set is rejected by the provider, and the error
    // does not say which character was the problem.
    for (let i = 0; i < 50; i++) {
      expect(createCodeVerifier()).toMatch(/^[A-Za-z0-9\-._~]+$/);
    }
  });

  it("is different every time", () => {
    const seen = new Set(
      Array.from({ length: 200 }, () => createCodeVerifier()),
    );
    expect(seen.size).toBe(200);
  });
});

describe("code challenge", () => {
  it("matches the RFC 7636 Appendix B test vector", async () => {
    // The spec's own worked example. If this passes, our encoding agrees with
    // every conforming server; if it fails, nothing will interoperate.
    const verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
    const expected = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM";
    await expect(createCodeChallenge(verifier)).resolves.toBe(expected);
  });

  it("is deterministic for a given verifier", async () => {
    const verifier = createCodeVerifier();
    expect(await createCodeChallenge(verifier)).toBe(
      await createCodeChallenge(verifier),
    );
  });

  it("differs for different verifiers", async () => {
    const a = await createCodeChallenge(createCodeVerifier());
    const b = await createCodeChallenge(createCodeVerifier());
    expect(a).not.toBe(b);
  });

  it("is not the verifier itself", async () => {
    // Guards against accidentally shipping `plain`, which defends against
    // nothing: anyone intercepting the request would hold the secret.
    const verifier = createCodeVerifier();
    expect(await createCodeChallenge(verifier)).not.toBe(verifier);
  });

  it("is URL-safe and unpadded", async () => {
    const challenge = await createCodeChallenge(createCodeVerifier());
    expect(challenge).toMatch(/^[A-Za-z0-9\-_]+$/);
  });
});

describe("state", () => {
  it("is unguessable and unique", () => {
    const seen = new Set(Array.from({ length: 200 }, () => createState()));
    expect(seen.size).toBe(200);
    expect(createState().length).toBeGreaterThanOrEqual(40);
  });

  it("matches itself", () => {
    const state = createState();
    expect(statesMatch(state, state)).toBe(true);
  });

  it("rejects a different value", () => {
    expect(statesMatch(createState(), createState())).toBe(false);
  });

  it("rejects missing values rather than treating them as equal", () => {
    // The dangerous case: two absent states must NOT compare equal, or a
    // callback carrying no state at all would pass the check.
    expect(statesMatch(null, null)).toBe(false);
    expect(statesMatch(undefined, undefined)).toBe(false);
    expect(statesMatch("", "")).toBe(false);
    expect(statesMatch("abc", null)).toBe(false);
  });

  it("rejects a prefix of the real state", () => {
    const state = createState();
    expect(statesMatch(state.slice(0, -1), state)).toBe(false);
  });
});
