import { beforeEach, describe, expect, it } from "vitest";
import { consumeState, OAuthStateError, rememberState } from "./oauth-state";

/**
 * Stand-in for sessionStorage. The real one exists under jsdom, but injecting
 * keeps these tests independent of global state leaking between cases.
 */
function makeStore(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k: string) => map.get(k) ?? null,
    key: (i: number) => Array.from(map.keys())[i] ?? null,
    removeItem: (k: string) => void map.delete(k),
    setItem: (k: string, v: string) => void map.set(k, v),
  } as Storage;
}

describe("OAuth state — browser half of audit finding F5", () => {
  let store: Storage;

  beforeEach(() => {
    store = makeStore();
  });

  it("accepts a callback whose state matches the one we remembered", () => {
    rememberState("abc123", store);
    expect(() => consumeState("abc123", store)).not.toThrow();
  });

  it("rejects a callback whose state does not match (the login-CSRF case)", () => {
    rememberState("ours", store);
    expect(() => consumeState("attackers", store)).toThrow(OAuthStateError);
  });

  it("rejects a callback that carries no state at all", () => {
    rememberState("ours", store);
    expect(() => consumeState(undefined, store)).toThrow(OAuthStateError);
    expect(() => consumeState(null, store)).toThrow(OAuthStateError);
    expect(() => consumeState("", store)).toThrow(OAuthStateError);
  });

  it("rejects when we never started a flow in this browser", () => {
    expect(() => consumeState("anything", store)).toThrow(OAuthStateError);
  });

  it("is single-use — a replayed callback is rejected the second time", () => {
    rememberState("abc123", store);
    consumeState("abc123", store);
    expect(() => consumeState("abc123", store)).toThrow(OAuthStateError);
  });

  it("clears the remembered state even when verification fails, so a failed attempt cannot be retried", () => {
    rememberState("ours", store);
    expect(() => consumeState("wrong", store)).toThrow();
    expect(() => consumeState("ours", store)).toThrow(OAuthStateError);
  });

  it("replaces a stale state when a new flow starts", () => {
    rememberState("first", store);
    rememberState("second", store);
    expect(() => consumeState("first", store)).toThrow(OAuthStateError);
  });
});
