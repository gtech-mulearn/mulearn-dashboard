import { AlertCircle, Home, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface GlobalErrorFallbackProps {
  error: unknown;
  resetErrorBoundary: () => void;
}

export function GlobalErrorFallback({
  error,
  resetErrorBoundary,
}: GlobalErrorFallbackProps) {
  const err = error instanceof Error ? error : new Error(String(error));

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-destructive/50 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit mb-4">
            <AlertCircle className="w-12 h-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Something went wrong
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            We encountered an critical error that prevented the application from
            loading.
          </p>
          {process.env.NODE_ENV === "development" && (
            <div className="bg-muted p-4 rounded-md text-left overflow-auto max-h-40 text-xs font-mono">
              <p className="font-bold text-destructive mb-2">{err.name}</p>
              <p>{err.message}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row justify-center">
          <Button
            onClick={resetErrorBoundary}
            variant="default"
            className="w-full sm:w-auto"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
