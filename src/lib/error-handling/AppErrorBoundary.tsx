"use client";

import type React from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { GlobalErrorFallback } from "@/components/ui/errors/GlobalErrorFallback";
import { errorLogger } from "./error-logging.service";

interface AppErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<FallbackProps>;
  onReset?: () => void;
  context?: Record<string, unknown>;
}

export function AppErrorBoundary({
  children,
  fallback = GlobalErrorFallback,
  onReset,
  context = {},
}: AppErrorBoundaryProps) {
  const logError = (
    error: unknown,
    info: { componentStack?: string | null },
  ) => {
    const err = error instanceof Error ? error : new Error(String(error));
    errorLogger.logError(err, {
      componentStack: info.componentStack || undefined,
      ...context,
    });
  };

  return (
    <ErrorBoundary
      FallbackComponent={fallback as React.ComponentType<FallbackProps>}
      onError={logError}
      onReset={onReset}
    >
      {children}
    </ErrorBoundary>
  );
}
