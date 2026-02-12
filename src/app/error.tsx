"use client";

import { useEffect } from "react";
import { GlobalErrorFallback } from "@/components/ui/errors/GlobalErrorFallback";
import { errorLogger } from "@/lib/error-handling/error-logging.service";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    errorLogger.logError(error, {
      digest: error.digest,
      context: "RootErrorBoundary",
    });
  }, [error]);

  return <GlobalErrorFallback error={error} resetErrorBoundary={reset} />;
}
