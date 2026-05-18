/**
 * App Providers
 *
 * 📍 src/app/providers.tsx
 *
 * Client-side providers for the application.
 * Includes TanStack Query, etc.
 */

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";
import { useState } from "react";
import { toast } from "sonner";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // SSR: prevent re-fetching immediately on the client
        staleTime: 60 * 1000,
        // Don't retry on 4xx errors
        retry: (failureCount, error) => {
          // Check for HTTP 4xx errors from ApiError
          const status =
            error && typeof error === "object" && "status" in error
              ? (error as { status: number }).status
              : undefined;
          if (status && status >= 400 && status < 500) {
            return false;
          }
          return failureCount < 3;
        },
      },
      mutations: {
        onError: (error) => {
          // Global fallback for mutations without their own onError handler.
          // Individual mutations can override this by providing their own onError.
          const message =
            error instanceof Error ? error.message : "Something went wrong";
          toast.error(message);
        },
      },
    },
  });
}

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // useState ensures a stable client instance across React strict-mode double
  // invocations and HMR cycles, avoiding a stale module-level singleton.
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
