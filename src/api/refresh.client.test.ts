import Cookies from "js-cookie";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// jsdom has neither Web Locks nor BroadcastChannel, so these small fakes stand in for them.
// Each "tab" is a fresh copy of the modules (vi.resetModules), sharing the cookies, the lock
// manager and the channels, as real tabs of one site do.

class FakeLocks {
  private tails = new Map<string, Promise<unknown>>();
  request<T>(name: string, callback: () => Promise<T>): Promise<T> {
    const previous = this.tails.get(name) ?? Promise.resolve();
    const run = previous.then(() => callback());
    this.tails.set(
      name,
      run.catch(() => undefined),
    );
    return run;
  }
}

const openChannels = new Set<FakeBroadcastChannel>();
class FakeBroadcastChannel {
  onmessage: ((event: MessageEvent) => void) | null = null;
  constructor(readonly name: string) {
    openChannels.add(this);
  }
  postMessage(data: unknown) {
    for (const channel of openChannels) {
      if (channel !== this && channel.name === this.name) {
        queueMicrotask(() => channel.onmessage?.({ data } as MessageEvent));
      }
    }
  }
  close() {
    openChannels.delete(this);
  }
}

type Tab = {
  refresh: typeof import("./refresh.client");
  channel: typeof import("@/lib/auth/auth-channel");
};

async function openTab(): Promise<Tab> {
  vi.resetModules();
  const refresh = await import("./refresh.client");
  const channel = await import("@/lib/auth/auth-channel");
  return { refresh, channel };
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

function tokenResponse(token: string) {
  return new Response(JSON.stringify({ response: { accessToken: token } }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  Cookies.set("accessToken", "expired-token");
  Cookies.set("refreshToken", "refresh-token");
  fetchMock = vi.fn(async () => tokenResponse("fresh-token"));
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("BroadcastChannel", FakeBroadcastChannel);
  Object.defineProperty(navigator, "locks", {
    value: new FakeLocks(),
    configurable: true,
  });
});

afterEach(() => {
  for (const name of ["accessToken", "refreshToken", "isAuthenticated"])
    Cookies.remove(name);
  for (const channel of [...openChannels]) channel.close();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  Reflect.deleteProperty(navigator, "locks");
});

describe("refreshAccessToken across tabs", () => {
  it("makes one network call when two tabs refresh at once", async () => {
    const first = await openTab();
    const second = await openTab();

    const tokens = await Promise.all([
      first.refresh.refreshAccessToken(),
      second.refresh.refreshAccessToken(),
    ]);

    expect(tokens).toEqual(["fresh-token", "fresh-token"]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(Cookies.get("accessToken")).toBe("fresh-token");
  });

  it("still shares one call between concurrent refreshes in one tab", async () => {
    const tab = await openTab();

    await Promise.all([
      tab.refresh.refreshAccessToken(),
      tab.refresh.refreshAccessToken(),
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("tells the other tabs after a refresh", async () => {
    const first = await openTab();
    const second = await openTab();
    const heard = vi.fn();
    const channel = new BroadcastChannel(second.channel.AUTH_CHANNEL);
    channel.onmessage = (event) => heard(event.data.type);

    await first.refresh.refreshAccessToken();
    await settle();

    expect(heard).toHaveBeenCalledWith("refreshed");
  });

  it("signs out every other tab when the refresh is refused", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));
    const first = await openTab();
    const second = await openTab();
    const firstSignedOut = vi.fn();
    const secondSignedOut = vi.fn();
    first.channel.listenForSignOut(firstSignedOut);
    second.channel.listenForSignOut(secondSignedOut);

    const token = await first.refresh.refreshAccessToken();
    await settle();

    expect(token).toBeNull();
    expect(secondSignedOut).toHaveBeenCalledTimes(1);
    // The tab whose refresh failed signs itself out through the API client, as it does today.
    expect(firstSignedOut).not.toHaveBeenCalled();
  });

  it("makes one call when the refresh is refused and another tab is waiting", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));
    const first = await openTab();
    const second = await openTab();

    const tokens = await Promise.all([
      first.refresh.refreshAccessToken(),
      second.refresh.refreshAccessToken(),
    ]);

    expect(tokens).toEqual([null, null]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(Cookies.get("refreshToken")).toBeUndefined();
  });

  it("doesn't call again when the session ended while this tab waited", async () => {
    fetchMock.mockImplementation(async () => {
      Cookies.remove("refreshToken"); // the first tab's refresh ends the session
      return new Response(null, { status: 401 });
    });
    const first = await openTab();
    const second = await openTab();

    const tokens = await Promise.all([
      first.refresh.refreshAccessToken(),
      second.refresh.refreshAccessToken(),
    ]);

    expect(tokens).toEqual([null, null]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("releases the lock when a refresh hangs, so other tabs can still refresh", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout"] });
    fetchMock.mockImplementationOnce(() => new Promise<Response>(() => {}));
    const first = await openTab();
    const second = await openTab();

    void first.refresh.refreshAccessToken();
    const secondToken = second.refresh.refreshAccessToken();
    await vi.advanceTimersByTimeAsync(first.refresh.LOCK_HOLD_LIMIT_MS);

    await expect(secondToken).resolves.toBe("fresh-token");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe("refreshAccessToken without Web Locks", () => {
  beforeEach(() => {
    Reflect.deleteProperty(navigator, "locks");
  });

  it("behaves as today: one call per tab, shared inside a tab, no message", async () => {
    const first = await openTab();
    const second = await openTab();
    const heard = vi.fn();
    const channel = new BroadcastChannel(first.channel.AUTH_CHANNEL);
    channel.onmessage = heard;

    const tokens = await Promise.all([
      first.refresh.refreshAccessToken(),
      first.refresh.refreshAccessToken(),
      second.refresh.refreshAccessToken(),
    ]);
    await settle();

    expect(tokens).toEqual(["fresh-token", "fresh-token", "fresh-token"]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(heard).not.toHaveBeenCalled();
  });
});

describe("announceSignedOut", () => {
  it("signs out the other tabs, not the one that signed out", async () => {
    const first = await openTab();
    const second = await openTab();
    const firstSignedOut = vi.fn();
    const secondSignedOut = vi.fn();
    first.channel.listenForSignOut(firstSignedOut);
    second.channel.listenForSignOut(secondSignedOut);

    first.channel.announceSignedOut();
    await settle();

    expect(secondSignedOut).toHaveBeenCalledTimes(1);
    expect(firstSignedOut).not.toHaveBeenCalled();
  });

  it("does nothing where BroadcastChannel doesn't exist", async () => {
    vi.stubGlobal("BroadcastChannel", undefined);
    const tab = await openTab();

    expect(() => tab.channel.announceSignedOut()).not.toThrow();
    expect(tab.channel.listenForSignOut(vi.fn())).toBeTypeOf("function");
  });
});

describe("goToSignIn", () => {
  it("stays put on a signed-out page, such as sign-in or register", async () => {
    const { channel } = await openTab();

    expect(channel.isSignedOutPage("/login")).toBe(true);
    expect(channel.isSignedOutPage("/register")).toBe(true);
    expect(channel.isSignedOutPage("/reset-password/abc")).toBe(true);
    expect(channel.isSignedOutPage("/")).toBe(true);
    expect(channel.isSignedOutPage("/dashboard")).toBe(false);
    expect(channel.isSignedOutPage("/onboarding/interests")).toBe(false);
  });
});
