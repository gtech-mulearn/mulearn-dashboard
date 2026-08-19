"use client";

import { AlertCircle, CheckCircle2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getApiResponseError } from "@/hooks/use-get-error";
import { useHiringCsvImport } from "../hooks";
import type { HiringImportResult } from "../schemas";

interface HiringCsvImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HiringCsvImportDialog({
  open,
  onOpenChange,
}: HiringCsvImportDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<HiringImportResult | null>(
    null,
  );
  const [showResults, setShowResults] = useState(false);

  const importMutation = useHiringCsvImport();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] ?? null);
    setShowResults(false);
    setImportResult(null);
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    try {
      const result = await importMutation.mutateAsync(selectedFile);
      setImportResult(result);
      setShowResults(true);

      if (result.errors.length === 0) {
        toast.success(`Imported ${result.created} hiring posting(s)`);
      } else if (result.created > 0) {
        toast.warning(
          `Imported ${result.created} posting(s), but ${result.errors.length} row(s) failed`,
        );
      } else {
        toast.error(`Import failed: ${result.errors.length} error(s)`);
      }

      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      toast.error(getApiResponseError(error, { fallback: "Import failed" }));
      setShowResults(false);
    }
  };

  const handleClose = (value: boolean) => {
    if (!value) {
      setSelectedFile(null);
      setImportResult(null);
      setShowResults(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md rounded-3xl border border-border bg-card">
        <DialogHeader>
          <DialogTitle>Bulk Import via CSV</DialogTitle>
          <DialogDescription>
            {showResults
              ? "Import results summary"
              : "Upload a CSV with columns: posted_date, role, organization, title, location, lastdate, applylink, jdlink, duration, remuneration, vacancies, extracontent."}
          </DialogDescription>
        </DialogHeader>

        {!showResults ? (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Upload CSV File
              </p>
              <label
                htmlFor="hiring-csv-upload"
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 px-4 py-6 transition-colors hover:border-primary/50 hover:bg-primary/5"
              >
                <Upload className="mb-2 size-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {selectedFile
                    ? selectedFile.name
                    : "Click to select .csv file"}
                </span>
                <input
                  id="hiring-csv-upload"
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {importMutation.isError && (
              <p className="text-sm text-destructive">
                {importMutation.error?.message ?? "Import failed"}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {importResult && importResult.created > 0 && (
              <div className="flex items-start gap-3 rounded-xl border border-success/30 bg-success/10 p-4">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Success</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {importResult.created} hiring posting(s) imported
                    successfully
                  </p>
                </div>
              </div>
            )}

            {importResult && importResult.errors.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
                  <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {importResult.errors.length} Error(s)
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      The following rows failed to import:
                    </p>
                  </div>
                </div>

                <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-border bg-muted/30 p-3">
                  {importResult.errors.map((err) => (
                    <div
                      key={err.row}
                      className="rounded-lg border border-border bg-card p-3 text-sm"
                    >
                      <p className="font-medium text-foreground">
                        Row {err.row}
                      </p>
                      {err.errors &&
                        Object.entries(err.errors).map(([field, msgs]) => (
                          <p key={field} className="text-xs text-destructive">
                            {field}: {msgs.join(", ")}
                          </p>
                        ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleClose(false)}
            aria-label="Cancel bulk import"
          >
            {showResults ? "Close" : "Cancel"}
          </Button>
          {!showResults && (
            <Button
              type="button"
              variant="default"
              disabled={!selectedFile || importMutation.isPending}
              onClick={handleImport}
              aria-label="Import CSV"
            >
              {importMutation.isPending ? "Uploading…" : "Import"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
