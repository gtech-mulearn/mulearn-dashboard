"use client";

import type React from "react";
import type { FallbackProps } from "react-error-boundary";
import { AppErrorBoundary } from "./AppErrorBoundary";

interface WithErrorBoundaryOptions {
  fallback?: React.ComponentType<FallbackProps>;
  context?: Record<string, unknown>;
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: WithErrorBoundaryOptions = {},
) {
  const WrappedComponent = (props: P) => {
    return (
      <AppErrorBoundary fallback={options.fallback} context={options.context}>
        <Component {...props} />
      </AppErrorBoundary>
    );
  };

  const name = Component.displayName || Component.name || "Component";
  WrappedComponent.displayName = `withErrorBoundary(${name})`;

  return WrappedComponent;
}
