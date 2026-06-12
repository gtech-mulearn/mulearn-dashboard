"use client";

import { AlertCircle, CheckCircle2, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { useDownloadTasksTemplate, useImportTasks } from "../hooks";

type ImportFailure = {
  row?: number;
  errors?: string[];
  data?: unknown;
};

type ImportResult = {
  Success?: unknown[];
  Failed?: ImportFailure[];
};

export default function TaskBulkImportView() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const importMutation = useImportTasks();
  const downloadTemplateMutation = useDownloadTasksTemplate();

  const handleTemplateDownload = async () => {
    try {
      const blob = await downloadTemplateMutation.mutateAsync();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "tasks_template.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Downloaded template successfully");
    } catch {
      toast.error("Failed to download template");
    }
  };

  const handleUpload = () => {
    if (!file) return;

    importMutation.mutate(file, {
      onSuccess: (res: ImportResult) => {
        setImportResult(res);
        toast.success("Bulk import process completed");
      },
      onError: (err: any) => {
        toast.error(err?.message || "Failed to import tasks");
      },
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="border-0 bg-transparent shadow-none rounded-none">
        <CardHeader className="px-0 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Bulk Import Tasks
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Upload an Excel (.xlsx) file to create multiple tasks in bulk
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleTemplateDownload}
            disabled={downloadTemplateMutation.isPending}
            className="w-full sm:w-auto"
          >
            <Download className="mr-2 size-4" />
            Download Excel Template
          </Button>
        </CardHeader>

        <CardContent className="px-0 pt-6 space-y-6">
          <div className="space-y-2">
            <FileUpload
              value={file}
              onChange={(f) => {
                setFile(f);
                setImportResult(null);
              }}
              accept=".xlsx"
              placeholder="Drop .xlsx file here or click to browse"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/management/tasks")}
              disabled={importMutation.isPending}
            >
              Back to Tasks
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || importMutation.isPending}
            >
              {importMutation.isPending ? "Uploading..." : "Upload & Process"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import Results Display */}
      {importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Import Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Success count */}
            {importResult.Success && importResult.Success.length > 0 && (
              <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 rounded-lg">
                <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold">Successfully Imported</h4>
                  <p className="text-sm">
                    {importResult.Success.length} tasks were imported
                    successfully.
                  </p>
                </div>
              </div>
            )}

            {/* Failures list */}
            {importResult.Failed && importResult.Failed.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-destructive/5 text-destructive rounded-lg">
                  <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold">Import Failures</h4>
                    <p className="text-sm text-muted-foreground">
                      {importResult.Failed.length} rows encountered validation
                      errors.
                    </p>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">
                          Row
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">
                          Error Details
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">
                          Data Snippet
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-card">
                      {importResult.Failed.map((failure, index) => (
                        <tr
                          key={failure.row ?? index}
                          className="hover:bg-muted/30"
                        >
                          <td className="px-4 py-3 text-sm font-medium">
                            {failure.row}
                          </td>
                          <td className="px-4 py-3 text-sm text-destructive font-medium">
                            <ul className="list-disc pl-4 space-y-1">
                              {failure.errors?.map((err: string) => (
                                <li key={err}>{err}</li>
                              ))}
                            </ul>
                          </td>
                          <td className="px-4 py-3 text-xs font-mono max-w-xs truncate text-muted-foreground">
                            {JSON.stringify(failure.data)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
