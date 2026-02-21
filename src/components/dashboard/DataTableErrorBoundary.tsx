"use client";

import { AlertCircle, Bug, RotateCcw } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class DataTableErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("DataTable Uncaught Error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const isSchemaError =
        this.state.error?.message.includes("schema mismatch");

      return (
        <div className="p-6">
          <Alert
            variant="destructive"
            className="border-destructive/50 bg-destructive/5"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-lg font-semibold">
              {isSchemaError ? "API Schema Mismatch" : "Something went wrong"}
            </AlertTitle>
            <AlertDescription className="mt-2 text-sm opacity-90">
              {this.state.error?.message ||
                "An unexpected error occurred while rendering the data table."}
            </AlertDescription>

            {isSchemaError && (
              <div className="mt-4 rounded-lg bg-black/5 p-4 font-mono text-xs overflow-auto max-h-60">
                <div className="flex items-center gap-2 mb-2 text-blue-600 font-bold uppercase tracking-wider">
                  <Bug className="h-3 w-3" />
                  Zod Validation Errors
                </div>
                <pre className="whitespace-pre-wrap">
                  {(() => {
                    try {
                      const jsonStr = this.state.error?.message.replace(
                        "API schema mismatch ",
                        "",
                      );
                      return JSON.stringify(
                        JSON.parse(jsonStr || "{}"),
                        null,
                        2,
                      );
                    } catch {
                      return "Could not parse error details.";
                    }
                  })()}
                </pre>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <Button
                onClick={this.handleReset}
                variant="outline"
                className="rounded-xl border-destructive/20 hover:bg-destructive/10"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}
