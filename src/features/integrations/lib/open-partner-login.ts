/**
 * Spec B §3.9: open the partner without popup blocks and without ever
 * leaving a login link anywhere but this tab.
 */

export function isAllowedPartnerUrl(
  url: string,
  isAllowedHost: (host: string) => boolean,
): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && isAllowedHost(parsed.hostname);
  } catch {
    return false;
  }
}

/** Call synchronously in a click handler, so popup blockers allow it. */
export function openPendingTab(): Window | null {
  if (typeof window === "undefined") return null;
  return window.open("about:blank", "_blank");
}

export function navigatePartnerTab(
  tab: Window | null,
  url: string,
  isAllowedHost: (host: string) => boolean,
): boolean {
  if (!tab || !isAllowedPartnerUrl(url, isAllowedHost)) return false;
  tab.opener = null;
  tab.location.href = url;
  return true;
}
