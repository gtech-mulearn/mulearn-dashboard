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
import {
  useBaseTemplateDownload,
  useBulkExcelImport,
} from "../hooks/use-role-users";
import type { BulkImportResult } from "../schemas";

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BulkImportDialog({
  open,
  onOpenChange,
}: BulkImportDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<BulkImportResult | null>(
    null,
  );
  const [showResults, setShowResults] = useState(false);

  const { download, isDownloading } = useBaseTemplateDownload();
  const importMutation = useBulkExcelImport();

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

      // Show toast notification
      if (result.error_count === 0) {
        toast.success(
          `Successfully imported ${result.success_count} role assignment(s)`,
        );
      } else if (result.success_count > 0) {
        toast.warning(
          `Imported ${result.success_count} role(s), but ${result.error_count} failed`,
        );
      } else {
        toast.error(`Import failed: ${result.error_count} error(s)`);
      }

      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import failed");
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
          <DialogTitle>Bulk Import via Excel</DialogTitle>
          <DialogDescription>
            {showResults
              ? "Import results summary"
              : "Download the template, fill in the MUID and Role columns, then upload the completed file."}
          </DialogDescription>
        </DialogHeader>

        {!showResults ? (
          <div className="space-y-4 py-2">
            {/* Template download */}
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Step 1: Download Template
                </p>
                <p className="text-xs text-muted-foreground">
                  XLSX with columns: muid, role
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={isDownloading}
                onClick={download}
                className="rounded-xl"
              >
                {isDownloading ? "Downloading…" : "Download"}
              </Button>
            </div>

            {/* File upload */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Step 2: Upload Completed File
              </p>
              <label
                htmlFor="bulk-excel-upload"
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 px-4 py-6 transition-colors hover:border-primary/50 hover:bg-primary/5"
              >
                <Upload className="mb-2 size-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {selectedFile
                    ? selectedFile.name
                    : "Click to select .xlsx file"}
                </span>
                <input
                  id="bulk-excel-upload"
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx"
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {/* Result feedback */}
            {importMutation.isError && (
              <p className="text-sm text-destructive">
                {importMutation.error?.message ?? "Import failed"}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Success Summary */}
            {importResult && importResult.success_count > 0 && (
              <div className="flex items-start gap-3 rounded-xl border border-success/30 bg-success/10 p-4">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Success</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {importResult.success_count} role assignment(s) imported
                    successfully
                  </p>
                </div>
              </div>
            )}

            {/* Error Summary */}
            {importResult && importResult.error_count > 0 && (
              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
                  <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {importResult.error_count} Error(s)
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      The following entries failed to import:
                    </p>
                  </div>
                </div>

                {/* Error Details */}
                <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-border bg-muted/30 p-3">
                  {importResult.errors?.map((err, idx) => (
                    <div
                      key={`${err.muid}-${err.role}-${idx}`}
                      className="rounded-lg border border-border bg-card p-3 text-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          {err.muid && (
                            <p className="font-medium text-foreground">
                              MUID: {err.muid}
                            </p>
                          )}
                          {err.role && (
                            <p className="text-xs text-muted-foreground">
                              Role: {err.role}
                            </p>
                          )}
                          <p className="text-xs text-destructive">
                            {err.error}
                          </p>
                        </div>
                      </div>
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
            className="rounded-2xl border-primary text-primary hover:bg-primary/10"
          >
            {showResults ? "Close" : "Cancel"}
          </Button>
          {!showResults && (
            <Button
              type="button"
              disabled={!selectedFile || importMutation.isPending}
              onClick={handleImport}
              className="rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {importMutation.isPending ? "Uploading…" : "Import"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
