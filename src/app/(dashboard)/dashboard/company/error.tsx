"use client";

/**
 * Company Section Error Boundary
 *
 * 📍 src/app/(dashboard)/dashboard/company/error.tsx
 *
 * Catches rendering errors within the company section and shows
 * a recovery UI instead of crashing the entire dashboard.
 */

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CompanyError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[Company Section Error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center gap-6 p-6">
      <div className="rounded-full bg-destructive/10 p-5 border border-destructive/20">
        <AlertTriangle className="h-10 w-10 text-destructive" />
      </div>
      <div className="text-center max-w-md">
        <h2 className="text-xl font-semibold text-foreground">
          Something went wrong
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          An unexpected error occurred in the company dashboard. This has been
          logged for investigation.
        </p>
        {error.message && (
          <p className="mt-3 rounded-md bg-muted px-3 py-2 text-xs font-mono text-muted-foreground">
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
