import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SectionErrorFallbackProps {
  error: unknown;
  resetErrorBoundary: () => void;
}

export function SectionErrorFallback({
  error,
  resetErrorBoundary,
}: SectionErrorFallbackProps) {
  const err = error instanceof Error ? error : new Error(String(error));

  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-border bg-card/50 text-card-foreground min-h-[300px]">
      <div className="bg-amber-500/10 p-4 rounded-full mb-4">
        <AlertTriangle className="w-8 h-8 text-amber-500" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Section Failed to Load</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
        We couldn't load this part of the application. It might be a temporary
        issue.
      </p>

      {process.env.NODE_ENV === "development" && (
        <div className="w-full max-w-lg mb-6 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
          <code className="text-destructive break-all">{err.message}</code>
        </div>
      )}

      <Button onClick={resetErrorBoundary} variant="secondary" size="sm">
        <RotateCcw className="mr-2 h-4 w-4" />
        Retry Loading
      </Button>
    </div>
  );
}
