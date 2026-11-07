"use client";

import {
  AlertCircle,
  Award,
  Check,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApiResponseError } from "@/hooks/use-get-error";
import { downloadBulkTemplate } from "../api";
import { useBulkIssue } from "../hooks/use-achievement-mutations";
import { useAchievements } from "../hooks/use-achievements";
import type { BulkIssueResponseData } from "../schemas";
import { AchievementIcon } from "./achievement-icon";

export function BulkIssuePanel() {
  const bulkIssueMutation = useBulkIssue();
  const { data: achievements = [], isLoading: isAchievementsLoading } =
    useAchievements();

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [csvFile, setCsvFile] = React.useState<File | null>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [selectedAchievementId, setSelectedAchievementId] = React.useState("");
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [lastResult, setLastResult] =
    React.useState<BulkIssueResponseData | null>(null);

  const canSubmit = Boolean(csvFile) && !bulkIssueMutation.isPending;

  const achievementOptions = React.useMemo(
    () => achievements.map((a) => ({ id: a.id, title: a.name })),
    [achievements],
  );

  const selectedAchievement = achievements.find(
    (a) => a.id === selectedAchievementId,
  );

  const handleFileSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit");
      return;
    }
    setCsvFile(file);
    setLastResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleCopyId = async (id: string, name: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      toast.success(`Copied ID for "${name}"`);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleSubmit = () => {
    if (!canSubmit || !csvFile) return;
    const formData = new FormData();
    formData.append("excel_file", csvFile);
    bulkIssueMutation.mutate(formData, {
      onSuccess: (data) => {
        setLastResult(data);
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
    <div className="space-y-6" data-testid="bulk-issue-panel">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Bulk Issue
        </h2>
        <p className="text-sm text-muted-foreground">
          Issue achievements to multiple users in bulk via Excel spreadsheet.
        </p>
      </div>

      <Separator />

      {/* Step 1: Look up Achievement IDs */}
      <div className="space-y-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            1. Look up Achievement IDs
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Search any achievement to find and copy its unique ID for your
            spreadsheet.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="w-full sm:w-80 md:w-96 shrink-0">
            <Combobox
              options={achievementOptions}
              value={selectedAchievementId}
              onValueChange={setSelectedAchievementId}
              placeholder="Search achievements..."
              emptyText="No achievements found."
              loading={isAchievementsLoading}
              className="h-10 rounded-xl bg-background border-border text-sm"
            />
          </div>

          {selectedAchievement && (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3.5 py-1.5 text-xs font-medium text-foreground max-w-full">
                <AchievementIcon
                  imageUrl={
                    selectedAchievement.icon_url || selectedAchievement.icon
                  }
                  name={selectedAchievement.name}
                  size={18}
                />
                <span className="truncate max-w-[180px] sm:max-w-[240px]">
                  {selectedAchievement.name}
                </span>
                <span className="font-mono text-muted-foreground text-[11px] truncate max-w-[140px] sm:max-w-none">
                  (ID: {selectedAchievement.id})
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  handleCopyId(selectedAchievement.id, selectedAchievement.name)
                }
                className="h-8 rounded-lg px-3 gap-1.5 text-xs font-medium"
              >
                {copiedId === selectedAchievement.id ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-success" />
                    <span className="text-success font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy ID</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Step 2: Upload Spreadsheet */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              2. Upload Spreadsheet
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Upload an Excel file (.xlsx or .xls) containing &apos;muid&apos;
              and &apos;achievement_id&apos; columns in Row 1.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTemplateDownload}
            disabled={isDownloading}
            className="rounded-full px-4 h-9 gap-1.5 text-xs sm:text-sm font-medium shrink-0 self-start sm:self-auto"
            data-testid="download-template-btn"
          >
            {isDownloading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            <span>
              {isDownloading ? "Downloading..." : "Download Template"}
            </span>
          </Button>
        </div>

        {/* Dropzone with increased height for this page */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
          disabled={bulkIssueMutation.isPending}
          data-testid="file-upload-input"
        />

        {csvFile ? (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-4">
            <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {csvFile.name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {(csvFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            {!bulkIssueMutation.isPending && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCsvFile(null)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                data-testid="file-upload-remove"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove file</span>
              </Button>
            )}
          </div>
        ) : (
          <button
            type="button"
            tabIndex={0}
            className={`flex h-40 sm:h-44 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border/80 bg-muted/20 hover:border-primary/50 hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            } ${bulkIssueMutation.isPending ? "cursor-not-allowed opacity-50" : ""}`}
            onClick={() =>
              !bulkIssueMutation.isPending && fileInputRef.current?.click()
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (!bulkIssueMutation.isPending) fileInputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            data-testid="file-upload-dropzone"
          >
            <Upload className="h-8 w-8 text-muted-foreground/70" />
            <p className="text-sm font-medium text-foreground">
              Drag and drop your spreadsheet here or browse to upload
            </p>
            <p className="text-xs text-muted-foreground">
              Supports .xlsx and .xls (Max 10MB)
            </p>
          </button>
        )}
      </div>

      <Separator />

      {/* Footer CTA */}
      <div className="flex items-center justify-end gap-3 pt-1">
        <Button
          type="button"
          variant="outline"
          asChild
          className="rounded-full px-5 h-9 text-sm font-medium"
        >
          <Link href="/dashboard/management/manage-achievements">Cancel</Link>
        </Button>

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="rounded-full px-6 h-9 font-semibold gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white"
          data-testid="bulk-issue-submit-btn"
        >
          {bulkIssueMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <span>Issue Achievements</span>
          )}
        </Button>
      </div>

      {/* Import Results Summary Section (only visible when results exist) */}
      {lastResult && (
        <div className="space-y-4 pt-4 border-t border-border/80">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                Import Results Summary
              </h3>
              <p className="text-xs text-muted-foreground">
                Outcome from the last submitted spreadsheet.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLastResult(null)}
              className="text-xs h-7 px-2"
            >
              Dismiss
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="overflow-hidden border-border bg-card shadow-xs">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Successfully Issued
                    </p>
                    <p className="mt-1 text-2xl font-bold tracking-tight text-success">
                      {lastResult.success_count}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-border bg-card shadow-xs">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Eligibility Granted
                    </p>
                    <p className="mt-1 text-2xl font-bold tracking-tight text-brand-blue">
                      {lastResult.eligibility_granted_count}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                    <Award className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-border bg-card shadow-xs">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Failed Rows
                    </p>
                    <p
                      className={`mt-1 text-2xl font-bold tracking-tight ${
                        lastResult.failed_count > 0
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }`}
                    >
                      {lastResult.failed_count}
                    </p>
                  </div>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      lastResult.failed_count > 0
                        ? "bg-destructive/10 text-destructive"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <AlertCircle className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {lastResult.failed_rows && lastResult.failed_rows.length > 0 && (
            <div className="space-y-2 pt-2">
              <Label className="text-xs font-semibold text-destructive flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                Failed Rows Breakdown ({lastResult.failed_rows.length})
              </Label>
              <div className="max-h-60 overflow-y-auto rounded-lg border border-destructive/20 bg-destructive/5">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-destructive/10">
                      <TableHead className="w-16 text-xs font-bold text-destructive">
                        Row
                      </TableHead>
                      <TableHead className="w-36 text-xs font-bold text-destructive">
                        MuID
                      </TableHead>
                      <TableHead className="text-xs font-bold text-destructive">
                        Reason
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lastResult.failed_rows.map((failed) => (
                      <TableRow key={`${failed.row}-${failed.muid}`}>
                        <TableCell className="font-mono text-xs py-2">
                          #{failed.row}
                        </TableCell>
                        <TableCell className="font-mono text-xs py-2 font-medium">
                          {failed.muid}
                        </TableCell>
                        <TableCell className="text-xs py-2 text-destructive/90">
                          {failed.reason}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
