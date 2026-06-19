"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { errorLogger } from "@/lib/error-handling/error-logging.service";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LearningCircleError({ error, reset }: ErrorProps) {
  useEffect(() => {
    errorLogger.logError(error, { digest: error.digest });
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-6 p-6">
      <div className="rounded-full border border-destructive/20 bg-destructive/10 p-5">
        <AlertTriangle className="h-10 w-10 text-destructive" />
      </div>
      <div className="max-w-md text-center">
        <h2 className="text-xl font-semibold text-foreground">
          Something went wrong
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          An error occurred in the Learning Circles section.
        </p>
        {process.env.NODE_ENV === "development" && error.message && (
          <p className="mt-3 rounded-md bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
            {error.message}
          </p>
        )}
      </div>
      <Button onClick={reset} variant="outline" className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
}
