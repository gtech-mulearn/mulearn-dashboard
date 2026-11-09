import { afterEach, describe, expect, it, vi } from "vitest";
import {
  isAllowedPartnerUrl,
  navigatePartnerTab,
  openPendingTab,
} from "./open-partner-login";

const futuremugHost = (host: string) =>
  host === "futuremug.com" || host.endsWith(".futuremug.com");

describe("isAllowedPartnerUrl", () => {
  it("accepts https links on the partner's hosts only", () => {
    expect(
      isAllowedPartnerUrl(
        "https://newdev.futuremug.com/sso/login/x",
        futuremugHost,
      ),
    ).toBe(true);
    expect(
      isAllowedPartnerUrl(
        "http://newdev.futuremug.com/sso/login/x",
        futuremugHost,
      ),
    ).toBe(false);
    expect(
      isAllowedPartnerUrl("https://futuremug.com.evil.io/x", futuremugHost),
    ).toBe(false);
    expect(isAllowedPartnerUrl("javascript:alert(1)", futuremugHost)).toBe(
      false,
    );
    expect(isAllowedPartnerUrl("not a url", futuremugHost)).toBe(false);
  });
});

describe("tabs", () => {
  afterEach(() => vi.restoreAllMocks());

  it("opens a blank tab synchronously", () => {
    const fake = {} as Window;
    const open = vi.spyOn(window, "open").mockReturnValue(fake);
    expect(openPendingTab()).toBe(fake);
    expect(open).toHaveBeenCalledWith("about:blank", "_blank");
  });

  it("navigates the tab and cuts the opener", () => {
    const tab = { opener: {}, location: { href: "" } } as unknown as Window;
    expect(
      navigatePartnerTab(tab, "https://newdev.futuremug.com/x", futuremugHost),
    ).toBe(true);
    expect(tab.location.href).toBe("https://newdev.futuremug.com/x");
    expect(tab.opener).toBeNull();
  });

  it("refuses foreign links and missing tabs", () => {
    const tab = { opener: {}, location: { href: "" } } as unknown as Window;
    expect(
      navigatePartnerTab(tab, "https://evil.example/x", futuremugHost),
    ).toBe(false);
    expect(tab.location.href).toBe("");
    expect(
      navigatePartnerTab(null, "https://newdev.futuremug.com/x", futuremugHost),
    ).toBe(false);
  });
});
