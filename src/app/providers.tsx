"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

const ReactQueryDevtools =
  process.env.NODE_ENV === "development"
    ? dynamic(() =>
        import("@tanstack/react-query-devtools").then(
          (mod) => mod.ReactQueryDevtools,
        ),
      )
    : () => null;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: (failureCount, error) => {
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
      mutations: {},
    },
  });
}

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(makeQueryClient);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      import("@/lib/error-handling/sentry-adapter").then(
        ({ SentryAdapter }) => {
          import("@/lib/error-handling/error-logging.service").then(
            ({ errorLogger }) => {
              errorLogger.registerAdapter(new SentryAdapter());
            },
          );
        },
      );
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
