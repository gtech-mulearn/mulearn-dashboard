"use client";

import {
  Award,
  Check,
  Copy,
  Download,
  FileSpreadsheet,
  Loader2,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getApiResponseError } from "@/hooks/use-get-error";
import { downloadBulkTemplate } from "../api";
import { useBulkIssue } from "../hooks/use-achievement-mutations";
import { useAchievements } from "../hooks/use-achievements";

function AchievementIdBox({ id }: { id: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(id);
    setCopied(true);
    toast.success("Achievement ID copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-2 flex items-center gap-3 rounded-xl border border-border/50 bg-muted/30 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-0.5">
          Achievement ID
        </p>
        <p className="font-mono text-xs text-foreground select-all truncate">
          {id}
        </p>
        <p className="text-[10px] text-muted-foreground mt-1">
          Copy and paste this ID into the{" "}
          <code className="text-xs bg-muted rounded px-1">achievement_id</code>{" "}
          column of your spreadsheet.
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="shrink-0 h-8 gap-1.5 rounded-lg text-xs transition-all"
        onClick={handleCopy}
        data-testid="copy-achievement-id-btn"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-success" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            Copy ID
          </>
        )}
      </Button>
    </div>
  );
}

export function BulkIssuePanel() {
  const { data: achievements = [] } = useAchievements();
  const bulkIssueMutation = useBulkIssue();

  const [achievementId, setAchievementId] = React.useState("");
  const [csvFile, setCsvFile] = React.useState<File | null>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const canSubmit = Boolean(achievementId && csvFile);

  const handleSubmit = () => {
    if (!canSubmit) return;
    const formData = new FormData();
    formData.append("achievement_id", achievementId);
    if (!csvFile) return;
    formData.append("excel_file", csvFile);
    bulkIssueMutation.mutate(formData, {
      onSuccess: () => {
        setAchievementId("");
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

  const selectedAchievement = React.useMemo(() => {
    return achievements.find((a) => a.id === achievementId);
  }, [achievements, achievementId]);

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
                Configure the target achievement and upload an Excel file
                containing user MUIDs.
              </CardDescription>
            </div>
            {selectedAchievement && (
              <Badge
                variant="outline"
                className="bg-success/10 text-success border-success/20 text-[10px] font-semibold px-2 py-0.5 self-start sm:self-center"
              >
                {selectedAchievement.type || "Standard"}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          {/* Step 1: Select Achievement */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-blue/10 text-xs font-bold text-brand-blue">
                1
              </span>
              Target Achievement
            </Label>
            <Select value={achievementId} onValueChange={setAchievementId}>
              <SelectTrigger
                className="w-full h-10 bg-background/50 border-border/60 rounded-xl px-3 text-sm"
                data-testid="bulk-achievement-select"
              >
                <SelectValue placeholder="Select an achievement..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {achievements.map((a) => (
                  <SelectItem
                    key={a.id}
                    value={a.id}
                    className="rounded-lg text-sm"
                  >
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedAchievement?.description && (
              <p className="text-xs text-muted-foreground italic pl-7">
                "{selectedAchievement.description}"
              </p>
            )}
            {achievementId && <AchievementIdBox id={achievementId} />}
          </div>

          {/* Step 2: Excel Upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-blue/10 text-xs font-bold text-brand-blue">
                  2
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
              placeholder="Upload Excel file with MUIDs (.xlsx, .xls)"
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
