"use client";

import { Download } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileUpload } from "@/components/ui/file-upload";
import { Label } from "@/components/ui/label";
import { downloadBulkTemplate } from "../api";
import { useBulkIssue } from "../hooks/use-achievement-mutations";

export function BulkIssueDialog() {
  const bulkIssueMutation = useBulkIssue();

  const [open, setOpen] = React.useState(false);
  const [csvFile, setCsvFile] = React.useState<File | null>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const canSubmit = Boolean(csvFile);

  const handleSubmit = () => {
    if (!canSubmit || !csvFile) return;
    const formData = new FormData();
    formData.append("excel_file", csvFile);
    bulkIssueMutation.mutate(formData, {
      onSuccess: () => {
        setOpen(false);
        setCsvFile(null);
      },
    });
  };

  const handleTemplateDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await downloadBulkTemplate();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "achievement_bulk_import_template.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) {
      setCsvFile(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button data-testid="bulk-issue-open-btn">Bulk Issue</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" data-testid="bulk-issue-dialog">
        <DialogHeader>
          <DialogTitle>Bulk Issue Achievements</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Excel Upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Excel File</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto gap-1.5 py-1 text-xs text-muted-foreground"
                onClick={handleTemplateDownload}
                disabled={isDownloading}
                data-testid="download-template-btn"
              >
                <Download className="h-3.5 w-3.5" />
                {isDownloading ? "Downloading..." : "Download template"}
              </Button>
            </div>
            <FileUpload
              value={csvFile}
              onChange={setCsvFile}
              accept=".xlsx,.xls"
              placeholder="Upload Excel file with muid and achievement_id columns"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={bulkIssueMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || bulkIssueMutation.isPending}
            data-testid="bulk-issue-submit-btn"
          >
            {bulkIssueMutation.isPending ? "Processing..." : "Issue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
