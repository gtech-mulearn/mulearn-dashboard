"use client";

import { getApiResponseError } from "@/hooks/use-get-error";
import { Button } from "./button";
import { StateDisplay } from "./state-display";

interface QueryErrorStateProps {
  title: string;
  error: unknown;
  onRetry: () => void;
}

/** A failed query: the backend's own message plus a Retry button. */
export function QueryErrorState({
  title,
  error,
  onRetry,
}: QueryErrorStateProps) {
  return (
    <StateDisplay
      variant="no-results"
      title={title}
      description={getApiResponseError(error, {
        fallback: "Something went wrong. Try again.",
      })}
      action={
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      }
    />
  );
}
