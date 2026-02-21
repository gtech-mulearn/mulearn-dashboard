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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { downloadBulkTemplate } from "../api";
import { useBulkIssue } from "../hooks/use-achievement-mutations";
import { useAchievements } from "../hooks/use-achievements";

export function BulkIssueDialog() {
  const { data: achievements = [] } = useAchievements();
  const bulkIssueMutation = useBulkIssue();

  const [open, setOpen] = React.useState(false);
  const [achievementId, setAchievementId] = React.useState("");
  const [csvFile, setCsvFile] = React.useState<File | null>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const canSubmit = Boolean(achievementId && csvFile);

  const handleSubmit = () => {
    if (!canSubmit) return;
    const formData = new FormData();
    formData.append("achievement_id", achievementId);
    if (!csvFile) return;
    formData.append("file", csvFile);
    bulkIssueMutation.mutate(formData, {
      onSuccess: () => {
        setOpen(false);
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
      a.download = "bulk-issue-template.csv";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) {
      setAchievementId("");
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
          <DialogTitle>Bulk Issue Achievement</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Achievement Select */}
          <div className="space-y-2">
            <Label>Achievement</Label>
            <Select value={achievementId} onValueChange={setAchievementId}>
              <SelectTrigger data-testid="bulk-achievement-select">
                <SelectValue placeholder="Select an achievement" />
              </SelectTrigger>
              <SelectContent>
                {achievements.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* CSV Upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>CSV File</Label>
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
              accept=".csv"
              placeholder="Upload CSV file with MUIDs"
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
