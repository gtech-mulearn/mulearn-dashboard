"use client";

import { Upload } from "lucide-react";
import { useRef, useState } from "react";
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

  const { download, isDownloading } = useBaseTemplateDownload();
  const importMutation = useBulkExcelImport();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] ?? null);
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    await importMutation.mutateAsync(selectedFile);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onOpenChange(false);
  };

  const handleClose = (value: boolean) => {
    if (!value) {
      setSelectedFile(null);
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
            Download the template, fill in the MUID and Role columns, then
            upload the completed file.
          </DialogDescription>
        </DialogHeader>

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

        <DialogFooter className="gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleClose(false)}
            className="rounded-2xl border-primary text-primary hover:bg-primary/10"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!selectedFile || importMutation.isPending}
            onClick={handleImport}
            className="rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {importMutation.isPending ? "Uploading…" : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
