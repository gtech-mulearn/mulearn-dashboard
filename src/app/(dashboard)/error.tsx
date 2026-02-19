"use client";

import { useEffect } from "react";
import { SectionErrorFallback } from "@/components/ui/errors/SectionErrorFallback";
import { errorLogger } from "@/lib/error-handling/error-logging.service";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    errorLogger.logError(error, {
      digest: error.digest,
      context: "DashboardErrorBoundary",
    });
  }, [error]);

  return (
    <div className="h-full flex items-center justify-center p-6">
      <SectionErrorFallback error={error} resetErrorBoundary={reset} />
    </div>
  );
}
