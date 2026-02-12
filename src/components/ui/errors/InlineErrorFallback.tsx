import { AlertCircle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InlineErrorFallbackProps {
  error: unknown;
  resetErrorBoundary: () => void;
}

export function InlineErrorFallback({
  error,
  resetErrorBoundary,
}: InlineErrorFallbackProps) {
  const err = error instanceof Error ? error : new Error(String(error));

  return (
    <div className="inline-flex items-center gap-2 p-2 rounded bg-destructive/10 text-destructive border border-destructive/20 text-sm">
      <AlertCircle className="w-4 h-4" />
      <span>Error</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-help underline decoration-dotted text-xs ml-1 opacity-80">
              (details)
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{err.message}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Button
        onClick={resetErrorBoundary}
        variant="ghost"
        size="icon"
        className="h-6 w-6 ml-1 hover:bg-destructive/20"
      >
        <RotateCw className="w-3 h-3" />
        <span className="sr-only">Retry</span>
      </Button>
    </div>
  );
}
