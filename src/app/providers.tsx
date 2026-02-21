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

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  }
  // Browser: make a new query client if we don't already have one
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
