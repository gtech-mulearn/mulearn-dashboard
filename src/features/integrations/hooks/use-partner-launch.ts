"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import {
  isAllowedPartnerUrl,
  navigatePartnerTab,
  openPendingTab,
} from "../lib/open-partner-login";
import type { PartnerAccountType, PartnerProvider } from "../providers/types";
import type { PartnerSession } from "../schemas";
import { partnerKeys } from "./query-keys";

export type LaunchState =
  | { phase: "idle" }
  | { phase: "working" }
  | { phase: "opened" }
  | { phase: "pending"; pendingUrl: string | null }
  /** A sign-in link the user opens with their own click: no tab was opened, or the browser blocked it. */
  | { phase: "ready"; url: string; expiresIn: number; blocked: boolean }
  | { phase: "error"; error: unknown };

function settle(
  result: PartnerSession,
  tab: Window | null,
  preopened: boolean,
  isAllowedHost: (host: string) => boolean,
): LaunchState {
  if (result.status === "login" && result.login_url) {
    if (navigatePartnerTab(tab, result.login_url, isAllowedHost)) {
      return { phase: "opened" };
    }
    tab?.close();
    if (!tab && isAllowedPartnerUrl(result.login_url, isAllowedHost)) {
      return {
        phase: "ready",
        url: result.login_url,
        expiresIn: result.expires_in ?? 120,
        blocked: preopened,
      };
    }
    return {
      phase: "error",
      error: new Error("The sign-in link didn't look right. Please try again."),
    };
  }
  tab?.close();
  const pendingUrl =
    result.pending_url && isAllowedPartnerUrl(result.pending_url, isAllowedHost)
      ? result.pending_url
      : null;
  return { phase: "pending", pendingUrl };
}

/**
 * Sign-in and authorize, without React Query: a login link is a single-use
 * secret and lives only in this component state (spec B §3.9).
 */
export function usePartnerLaunch(
  provider: PartnerProvider,
  type: PartnerAccountType,
  isAllowedHost: (host: string) => boolean,
) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<LaunchState>({ phase: "idle" });

  /**
   * `preopen: false` when the partner is likely to answer "pending": a tab
   * opened now would only flash and close, so a sign-in answer becomes a
   * ready link instead. Resolves to the final state.
   */
  const launch = useCallback(
    async (
      call: () => Promise<PartnerSession>,
      options: { preopen?: boolean } = {},
    ): Promise<LaunchState> => {
      const preopened = options.preopen !== false;
      // Opened before any await, so it counts as part of the click.
      const tab = preopened ? openPendingTab() : null;
      setState({ phase: "working" });
      let next: LaunchState;
      try {
        next = settle(await call(), tab, preopened, isAllowedHost);
      } catch (error) {
        tab?.close();
        next = { phase: "error", error };
      } finally {
        queryClient.invalidateQueries({
          queryKey: partnerKeys.connection(provider, type),
        });
      }
      setState(next);
      return next;
    },
    [isAllowedHost, provider, queryClient, type],
  );

  const reset = useCallback(() => setState({ phase: "idle" }), []);
  return { state, launch, reset };
}
