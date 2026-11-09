/**
 * The identity provider's settings, read-only: they're set at deploy time.
 *
 * 📍 src/features/sign-in-security/components/posture-panel.tsx
 */

"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiResponseError } from "@/hooks/use-get-error";
import { useSecurityPosture } from "../hooks";
import { formatDuration } from "../schemas";

const LIFETIMES: [string, string][] = [
  ["authorization_code", "Sign-in code"],
  ["access_token", "Access token"],
  ["id_token", "ID token"],
  ["refresh_token", "Refresh token"],
];

const onOff = (v?: boolean) => (v === undefined ? "—" : v ? "On" : "Off");

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 py-2 sm:grid-cols-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm sm:col-span-2">{children}</dd>
    </div>
  );
}

export function PosturePanel() {
  const { data: p, isLoading, error } = useSecurityPosture();
  return (
    <section className="space-y-2 rounded-xl border bg-card p-6">
      <div>
        <h2 className="text-lg font-semibold">Identity provider settings</h2>
        <p className="text-sm text-muted-foreground">
          Read-only. These are set when the sign-in service is deployed.
        </p>
      </div>
      {isLoading ? (
        <Skeleton className="h-60 w-full" />
      ) : error || !p ? (
        <p className="text-sm text-destructive">
          {getApiResponseError(error, {
            fallback: "Couldn't load the settings.",
          })}
        </p>
      ) : (
        <dl className="divide-y">
          <Row label="Issuer">
            <code className="font-mono">{p.issuer}</code>
          </Row>
          <Row label="PKCE required">{onOff(p.pkce_required)}</Row>
          <Row label="Refresh tokens">
            {p.refresh_token_rotation ? "Replaced on every use" : "Reusable"}
            {p.refresh_token_reuse_protection &&
              ", reuse of an old one signs the person out"}
            {p.refresh_token_grace_period_seconds
              ? ` (${formatDuration(p.refresh_token_grace_period_seconds)} grace)`
              : ""}
          </Row>
          {LIFETIMES.filter(
            ([key]) => p.lifetimes_seconds?.[key] !== undefined,
          ).map(([key, label]) => (
            <Row key={key} label={`${label} lasts`}>
              {formatDuration(p.lifetimes_seconds?.[key] ?? 0)}
            </Row>
          ))}
          <Row label="Sign-out from apps">{onOff(p.rp_initiated_logout)}</Row>
          {p.consent_prompt && (
            <Row label="Consent prompt">{p.consent_prompt}</Row>
          )}
          {p.redirect_uri_schemes && (
            <Row label="Redirect URI schemes">
              <code className="font-mono">
                {p.redirect_uri_schemes.join(", ")}
              </code>
            </Row>
          )}
          {p.localhost_redirects_allowed !== undefined && (
            <Row label="http://localhost redirects">
              {p.localhost_redirects_allowed ? (
                <Badge variant="destructive">
                  Allowed: development only, never in production
                </Badge>
              ) : (
                "Not allowed"
              )}
            </Row>
          )}
          {p.first_party_only_scopes && (
            <Row label="First-party-only scopes">
              <code className="font-mono">
                {p.first_party_only_scopes.join(", ") || "—"}
              </code>
            </Row>
          )}
          {p.signing_keys && (
            <Row label="Signing key">
              <code className="break-all font-mono text-xs">
                {p.signing_keys.active}
              </code>
              {p.signing_keys.inactive.length > 0 && (
                <span className="text-muted-foreground">
                  {" "}
                  + {p.signing_keys.inactive.length} older key
                  {p.signing_keys.inactive.length === 1 ? "" : "s"} still
                  accepted
                </span>
              )}
            </Row>
          )}
        </dl>
      )}
    </section>
  );
}
