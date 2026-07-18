"use client";

import { Award, Download, FileSpreadsheet, Loader2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { Label } from "@/components/ui/label";
import { getApiResponseError } from "@/hooks/use-get-error";
import { downloadBulkTemplate } from "../api";
import { useBulkIssue } from "../hooks/use-achievement-mutations";

export function BulkIssuePanel() {
  const bulkIssueMutation = useBulkIssue();

  const [csvFile, setCsvFile] = React.useState<File | null>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const canSubmit = Boolean(csvFile);

  const handleSubmit = () => {
    if (!canSubmit || !csvFile) return;
    const formData = new FormData();
    formData.append("excel_file", csvFile);
    bulkIssueMutation.mutate(formData, {
      onSuccess: () => {
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
    } catch (error) {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to download template",
        }),
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6" data-testid="bulk-issue-panel">
      {/* Page Header */}
      <div className="flex flex-col gap-1 text-center sm:text-left">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Bulk Operations
        </h1>
        <p className="text-sm text-muted-foreground">
          Issue achievements to multiple users simultaneously via spreadsheets.
        </p>
      </div>

      <Card className="border-border/60 shadow-md rounded-2xl overflow-hidden bg-card/60 backdrop-blur-xs">
        <CardHeader className="border-b border-border/40 bg-muted/20 px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2 font-bold">
                <FileSpreadsheet className="size-5 text-brand-blue" />
                Bulk Issue Achievements
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Upload an Excel file containing user MUIDs and Achievement IDs.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          {/* Step 1: Excel Upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-blue/10 text-xs font-bold text-brand-blue">
                  1
                </span>
                Upload Spreadsheet File
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto gap-1.5 py-1 px-2.5 text-xs text-brand-blue hover:text-brand-blue/90 hover:bg-brand-blue/5 rounded-lg transition-all"
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
              placeholder="Upload Excel file with muid and achievement_id columns (.xlsx, .xls)"
            />
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-4 border-t border-border/40">
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || bulkIssueMutation.isPending}
              className="w-full sm:w-auto h-10 px-6 bg-brand-blue hover:bg-brand-blue/90 rounded-full font-bold text-sm shadow-[inset_0px_6px_11px_0px_rgba(255,255,255,0.33),inset_0px_-6px_17px_0px_rgba(0,0,0,0.18),0px_4px_7px_0px_rgba(0,0,0,0.18)] transition-all flex items-center justify-center gap-2"
              data-testid="bulk-issue-submit-btn"
            >
              {bulkIssueMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Award className="size-4" />
                  Issue Achievements
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
