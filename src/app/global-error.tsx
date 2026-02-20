"use client";

import { useEffect } from "react";
import { GlobalErrorFallback } from "@/components/ui/errors/GlobalErrorFallback";
import { errorLogger } from "@/lib/error-handling/error-logging.service";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    errorLogger.logError(error, {
      digest: error.digest,
      context: "GlobalError",
    });
  }, [error]);

  return (
    <html lang="en">
      <body>
        <GlobalErrorFallback error={error} resetErrorBoundary={reset} />
      </body>
    </html>
  );
}
