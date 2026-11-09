/**
 * Small pieces shared by the connected-apps screens.
 *
 * 📍 src/features/connected-apps/components/app-parts.tsx
 */

"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/api/errors";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ConnectedApp } from "../schemas";

export const APPS_BASE = "/dashboard/management/system/applications";

export function KindBadge({ app }: { app: ConnectedApp }) {
  return app.skip_authorization ? (
    <Badge className="border-brand-blue/30 bg-brand-blue/15 text-brand-blue hover:bg-brand-blue/20">
      First-party
    </Badge>
  ) : (
    <Badge variant="secondary">Partner</Badge>
  );
}

export function StatusBadge({ app }: { app: ConnectedApp }) {
  return app.disabled_at ? (
    <Badge variant="destructive">Disabled</Badge>
  ) : (
    <Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400">
      Active
    </Badge>
  );
}

export const formatDate = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={`Copy ${label}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          toast.success(`${label} copied.`);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          toast.error("Couldn't copy. Select the text and copy it yourself.");
        }
      }}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
}

/** The authserver's per-field reasons, relayed by the backend in `response.fields`. */
export function serverFieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError)) return {};
  const fields = (error.data as { response?: { fields?: unknown } } | undefined)
    ?.response?.fields;
  if (!fields || typeof fields !== "object") return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(
    fields as Record<string, unknown>,
  )) {
    out[key] = Array.isArray(value)
      ? value.map(String).join(" ")
      : String(value);
  }
  return out;
}

export const isNotFound = (error: unknown) =>
  error instanceof ApiError && error.status === 404;
