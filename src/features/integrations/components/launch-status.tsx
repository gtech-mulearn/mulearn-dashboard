"use client";

import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCountdown, useCountdown } from "@/features/email-verification";
import { getApiResponseError } from "@/hooks/use-get-error";
import { cn } from "@/lib/utils";
import type { LaunchState } from "../hooks/use-partner-launch";

interface LaunchStatusProps {
  state: LaunchState;
  partnerName: string;
  onRetry?: () => void;
  /** Called when the ready link is clicked, so the used link can be cleared. */
  onContinue?: () => void;
  /** Smaller type, for the card. */
  compact?: boolean;
  className?: string;
}

/**
 * What a click left to do: a sign-in link to open, or an error. "Pending" is
 * not repeated here; the card row and the consent dialog already say it.
 */
export function LaunchStatus({
  state,
  partnerName,
  onRetry,
  onContinue,
  compact = false,
  className,
}: LaunchStatusProps) {
  const text = compact ? "text-xs" : "text-sm";
  if (state.phase === "ready") {
    return (
      <ReadyLink
        url={state.url}
        expiresIn={state.expiresIn}
        blocked={state.blocked}
        partnerName={partnerName}
        onRetry={onRetry}
        onContinue={onContinue}
        className={cn(text, className)}
      />
    );
  }
  if (state.phase === "error") {
    return (
      <p
        role="alert"
        className={cn(
          "rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive",
          text,
          className,
        )}
      >
        {getApiResponseError(state.error, {
          fallback: "Something went wrong. Please try again.",
        })}
      </p>
    );
  }
  return null;
}

/** The single-use sign-in link, opened by the user's own click so no popup blocker stops it. */
export function ContinueToPartner({
  url,
  partnerName,
  onContinue,
  size = "sm",
}: {
  url: string;
  partnerName: string;
  onContinue?: () => void;
  size?: "sm" | "default";
}) {
  return (
    <Button asChild size={size}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onContinue}
      >
        Continue to {partnerName}
        <ExternalLink className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
      </a>
    </Button>
  );
}

function ReadyLink({
  url,
  expiresIn,
  blocked,
  partnerName,
  onRetry,
  onContinue,
  className,
}: {
  url: string;
  expiresIn: number;
  blocked: boolean;
  partnerName: string;
  onRetry?: () => void;
  onContinue?: () => void;
  className?: string;
}) {
  const { remaining } = useCountdown(expiresIn);
  const expired = remaining === 0;
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3 @md:flex-row @md:items-center",
        className,
      )}
    >
      <p className="min-w-0 flex-1 text-muted-foreground">
        {expired
          ? "The sign-in link expired."
          : `${blocked ? "Your browser blocked the new tab." : `${partnerName} is ready.`} The link works once, for ${formatCountdown(remaining)}.`}
      </p>
      {expired ? (
        onRetry ? (
          <Button type="button" size="sm" variant="outline" onClick={onRetry}>
            Try again
          </Button>
        ) : null
      ) : (
        <ContinueToPartner
          url={url}
          partnerName={partnerName}
          onContinue={onContinue}
        />
      )}
    </div>
  );
}
