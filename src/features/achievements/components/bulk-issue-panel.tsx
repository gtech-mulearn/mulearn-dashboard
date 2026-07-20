"use client";

import {
  Award,
  Check,
  Copy,
  Download,
  FileSpreadsheet,
  Loader2,
  Search,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getApiResponseError } from "@/hooks/use-get-error";
import { downloadBulkTemplate } from "../api";
import { useBulkIssue } from "../hooks/use-achievement-mutations";
import { useAchievements } from "../hooks/use-achievements";

export function BulkIssuePanel() {
  const bulkIssueMutation = useBulkIssue();
  const { data: achievements = [], isLoading: isAchievementsLoading } =
    useAchievements();

  const [csvFile, setCsvFile] = React.useState<File | null>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [achievementSearch, setAchievementSearch] = React.useState("");
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const canSubmit = Boolean(csvFile);

  const filteredAchievements = React.useMemo(() => {
    const q = achievementSearch.trim().toLowerCase();
    if (!q) return achievements;
    return achievements.filter(
      (a) => a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q),
    );
  }, [achievements, achievementSearch]);

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
    <div className="mx-auto max-w-2xl space-y-6" data-testid="bulk-issue-panel">
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
        <CardContent className="p-6 space-y-6">
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

          {/* Step 2: Achievement ID Lookup Tool */}
          <div className="border-t border-border/40 pt-6 space-y-4">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-blue/10 text-xs font-bold text-brand-blue">
                2
              </span>
              Achievement ID Lookup Tool
            </Label>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                value={achievementSearch}
                onChange={(e) => setAchievementSearch(e.target.value)}
                placeholder="Search achievements by name or ID to copy..."
                className="pl-9 h-10 rounded-xl border-border bg-background text-sm focus-visible:ring-brand-blue/30"
              />
            </div>

            {/* Achievement List */}
            <ScrollArea className="h-[200px] rounded-xl border border-border/50 bg-background/30">
              {isAchievementsLoading ? (
                <div className="flex items-center justify-center h-24 text-sm text-muted-foreground gap-2">
                  <Loader2 className="size-4 animate-spin text-brand-blue" />
                  Loading achievements…
                </div>
              ) : filteredAchievements.length === 0 ? (
                <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
                  No achievements found.
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {filteredAchievements.map((achievement) => {
                    const isCopied = copiedId === achievement.id;
                    return (
                      <button
                        key={achievement.id}
                        type="button"
                        onClick={() =>
                          handleCopyId(achievement.id, achievement.name)
                        }
                        className="group flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:bg-muted/50"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            {achievement.name}
                          </p>
                          <p className="truncate text-[11px] font-mono text-muted-foreground mt-0.5">
                            {achievement.id}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all ${
                            isCopied
                              ? "bg-green-500/10 text-green-600"
                              : "bg-muted text-muted-foreground group-hover:bg-brand-blue/10 group-hover:text-brand-blue"
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="size-3" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="size-3" />
                              Copy ID
                            </>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
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
