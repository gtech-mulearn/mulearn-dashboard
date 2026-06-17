"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { errorLogger } from "@/lib/error-handling/error-logging.service";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    errorLogger.logError(error, { digest: error.digest });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="mx-auto max-w-md space-y-4 text-center">
        <h2 className="text-2xl font-bold">Something went wrong</h2>
        <p className="text-muted-foreground">
          We encountered an error. Please try again.
        </p>
        {process.env.NODE_ENV === "development" && (
          <p className="text-sm text-destructive">{error.message}</p>
        )}
        <div className="flex justify-center gap-3">
          <Button onClick={reset} variant="outline">
            Try Again
          </Button>
          <Button asChild>
            <Link href="/login">Back to Login</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
