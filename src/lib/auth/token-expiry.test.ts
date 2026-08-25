import { describe, expect, it } from "vitest";

/**
 * The edge proxy has to read two token formats during the migration, and they
 * spell expiry and roles differently. Getting either wrong is invisible in
 * development and severe in production:
 *
 *   - missing the expiry means refresh never fires, and people sit on a dead
 *     token collecting 401s with no way to recover;
 *   - reading a missing roles claim as "no roles" bounces every Campus Lead,
 *     IG Lead and admin off their own pages.
 *
 * These reproduce the two shapes exactly as each system emits them. The logic
 * under test lives in src/proxy.ts; it is duplicated here because proxy.ts is
 * edge middleware and does not export its helpers.
 */

function tokenExpiryDate(parsed: Record<string, unknown>): Date | null {
  const exp = parsed.exp;
  if (typeof exp === "number") return new Date(exp * 1000);
  const expiry = parsed.expiry;
  if (typeof expiry === "string" || typeof expiry === "number") {
    const date = new Date(expiry);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return null;
}

function rolesFrom(parsed: Record<string, unknown>): string[] | null {
  const expiry = tokenExpiryDate(parsed);
  if (expiry && expiry < new Date()) return [];
  if (Array.isArray(parsed.roles)) return parsed.roles as string[];
  return null;
}

const inFifteenMinutes = () => new Date(Date.now() + 15 * 60_000);
const fiveMinutesAgo = () => new Date(Date.now() - 5 * 60_000);

/** Exactly what authserver's legacy generate_jwt emits. */
function legacyPayload(when: Date, roles: string[] = ["Mulearner"]) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp =
    `${when.getUTCFullYear()}-${pad(when.getUTCMonth() + 1)}-${pad(when.getUTCDate())} ` +
    `${pad(when.getUTCHours())}:${pad(when.getUTCMinutes())}:${pad(when.getUTCSeconds())}+0000`;
  return { id: "u-1", muid: "anitha@mulearn", roles, expiry: stamp };
}

/** Exactly what the OIDC provider emits: standard exp, and no roles claim. */
function oidcPayload(when: Date) {
  return {
    sub: "u-1",
    iss: "https://auth.mulearn.org",
    aud: "mulearn-api",
    exp: Math.floor(when.getTime() / 1000),
    scope: "openid mulearn.read",
  };
}

describe("expiry — legacy format", () => {
  it("reads the formatted string", () => {
    const date = tokenExpiryDate(legacyPayload(inFifteenMinutes()));
    expect(date).not.toBeNull();
    expect(date! > new Date()).toBe(true);
  });

  it("detects an expired legacy token", () => {
    const date = tokenExpiryDate(legacyPayload(fiveMinutesAgo()));
    expect(date! < new Date()).toBe(true);
  });
});

describe("expiry — OIDC format", () => {
  it("reads the standard exp claim", () => {
    // THE BUG: reading only `expiry` returned null here, so the proxy never
    // refreshed and the person was stranded on a dead token.
    const date = tokenExpiryDate(oidcPayload(inFifteenMinutes()));
    expect(date).not.toBeNull();
    expect(date! > new Date()).toBe(true);
  });

  it("treats exp as SECONDS, not milliseconds", () => {
    // Off by a factor of 1000 puts every expiry in 1970, which would refresh
    // on every single request.
    const target = inFifteenMinutes();
    const date = tokenExpiryDate(oidcPayload(target));
    expect(Math.abs(date!.getTime() - target.getTime())).toBeLessThan(1000);
  });

  it("detects an expired OIDC token", () => {
    expect(tokenExpiryDate(oidcPayload(fiveMinutesAgo()))! < new Date()).toBe(
      true,
    );
  });
});

describe("expiry — neither claim", () => {
  it("returns null rather than guessing", () => {
    expect(tokenExpiryDate({ sub: "u-1" })).toBeNull();
  });

  it("returns null for an unparseable value instead of Invalid Date", () => {
    expect(tokenExpiryDate({ expiry: "sometime next week" })).toBeNull();
  });
});

describe("roles", () => {
  it("legacy tokens carry them", () => {
    expect(
      rolesFrom(legacyPayload(inFifteenMinutes(), ["Campus Lead"])),
    ).toEqual(["Campus Lead"]);
  });

  it("OIDC tokens return null, NOT an empty array", () => {
    // THE BUG. [] reads as "this person has no roles" and bounces them off
    // every role-gated route; null means "this token does not say", so the
    // edge defers and the server decides.
    expect(rolesFrom(oidcPayload(inFifteenMinutes()))).toBeNull();
  });

  it("a legacy token with genuinely no roles is still an empty array", () => {
    // This person really does have no roles, and must be denied — the
    // distinction from the case above is the whole point.
    expect(rolesFrom(legacyPayload(inFifteenMinutes(), []))).toEqual([]);
  });

  it("an expired token grants no roles in either format", () => {
    expect(rolesFrom(legacyPayload(fiveMinutesAgo(), ["Admin"]))).toEqual([]);
    expect(rolesFrom(oidcPayload(fiveMinutesAgo()))).toEqual([]);
  });
});
