"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowRightLeft, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useExecuteMerge,
  useMergePreview,
  useTransferOrganization,
} from "../../hooks/use-transfer";
import {
  TransferOrgFormSchema,
  type TransferOrgFormValues,
} from "../../schemas/transfer.schema";

export default function TransferView() {
  const [activeTab, setActiveTab] = useState<"transfer" | "merge">("transfer");

  return (
    <Card className="border-0 bg-transparent shadow-none rounded-none max-w-4xl mx-auto">
      <CardHeader className="px-0 pt-0 pb-6">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold text-foreground sm:text-3xl">
            Organization Transfer & Merge
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Move user links from one organization to another, or perform a full
            data merge.
          </p>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="transfer">Simple Transfer</TabsTrigger>
            <TabsTrigger value="merge">Full Merge</TabsTrigger>
          </TabsList>

          <TabsContent value="transfer" className="outline-none">
            <SimpleTransferForm />
          </TabsContent>

          <TabsContent value="merge" className="outline-none">
            <FullMergeFlow />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// ─── Simple Transfer Component ──────────────────────────────────────────────
function SimpleTransferForm() {
  const transferMutation = useTransferOrganization();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransferOrgFormValues>({
    resolver: zodResolver(TransferOrgFormSchema),
    defaultValues: {
      from_id: "",
      to_id: "",
    },
  });

  const onSubmit = async (data: TransferOrgFormValues) => {
    try {
      await transferMutation.mutateAsync(data);
      toast.success("Organizations transferred successfully");
      reset();
    } catch {
      // Handled by mutation hook's onError toast
    }
  };

  return (
    <Card className="border border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Transfer Organization Link
        </CardTitle>
        <CardDescription>
          Transfers all UserOrganizationLink records from the source
          organization to the destination organization.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          <ShieldAlert className="size-5 shrink-0" />
          <div className="space-y-1">
            <p className="font-semibold">Destructive Operation</p>
            <p className="text-muted-foreground text-destructive/90">
              The source organization (From Code) will be **permanently
              deleted** once the links are transferred. This action cannot be
              undone.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="from-id">Source Organization Code (From)</Label>
              <Input
                id="from-id"
                placeholder="e.g. MITS-KL"
                {...register("from_id")}
              />
              {errors.from_id && (
                <p className="text-xs text-destructive">
                  {errors.from_id.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="to-id">Destination Organization Code (To)</Label>
              <Input
                id="to-id"
                placeholder="e.g. MITS-TVM"
                {...register("to_id")}
              />
              {errors.to_id && (
                <p className="text-xs text-destructive">
                  {errors.to_id.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <ArrowRightLeft className="size-4" />
              {isSubmitting ? "Transferring..." : "Transfer & Delete Source"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Full Merge Component ───────────────────────────────────────────────────
function FullMergeFlow() {
  const [step, setStep] = useState<1 | 2>(1);
  const [sourceCode, setSourceCode] = useState("");
  const [destId, setDestId] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  // Merge Preview Query
  const {
    data: previewData,
    isLoading: isPreviewLoading,
    isError: isPreviewError,
    refetch: triggerPreview,
  } = useMergePreview(destId, sourceCode, { enabled: false });

  // Merge execution mutation
  const mergeMutation = useExecuteMerge();

  const handlePreviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceCode.trim()) {
      toast.error("Source organization code is required");
      return;
    }
    if (!destId.trim()) {
      toast.error("Destination organization UUID is required");
      return;
    }
    const result = await triggerPreview();
    if (result.isSuccess && result.data) {
      setStep(2);
    }
  };

  const handleExecuteMerge = async () => {
    if (!confirmed) {
      toast.error(
        "Please confirm that you understand this action is irreversible",
      );
      return;
    }

    try {
      await mergeMutation.mutateAsync({
        orgId: destId,
        source_org: sourceCode,
      });
      toast.success("Organizations merged successfully");
      handleReset();
    } catch {
      // Hook handles showing specific errors
    }
  };

  const handleReset = () => {
    setStep(1);
    setConfirmed(false);
  };

  if (step === 2 && previewData) {
    const summary = previewData.update_summary || [];

    return (
      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Merge Preview Impact Summary
          </CardTitle>
          <CardDescription>
            Previewing merging **{previewData.source_org}** into the destination
            organization. Review affected records below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {summary.length === 0 ? (
            <div className="flex gap-3 rounded-lg border border-border p-4 text-sm text-muted-foreground bg-muted/20">
              <AlertCircle className="size-5 shrink-0" />
              <p>No records or dependencies will be affected by this merge.</p>
            </div>
          ) : (
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead>Field Name</TableHead>
                    <TableHead>Affected Count</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.map((item) => (
                    <TableRow key={item.field_name}>
                      <TableCell className="font-medium font-mono text-xs">
                        {item.model}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {item.field_name}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {item.count}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            item.action === "delete"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-500"
                          }`}
                        >
                          {item.action === "delete"
                            ? "Delete Conflicted"
                            : "Repoint/Update"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            <ShieldAlert className="size-5 shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold">Irreversible Merger</p>
              <p className="text-muted-foreground text-destructive/90">
                This merger runs in a database transaction. Conflicted OneToOne
                fields will be deleted, and the source organization will be
                permanently deleted.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 rounded-lg border p-4">
            <Checkbox
              id="confirm-merge"
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked === true)}
            />
            <label
              htmlFor="confirm-merge"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              I understand that this is a destructive, irreversible operation.
            </label>
          </div>

          <div className="flex justify-between items-center pt-2">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={mergeMutation.isPending}
            >
              Back to Setup
            </Button>
            <Button
              onClick={handleExecuteMerge}
              disabled={!confirmed || mergeMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {mergeMutation.isPending
                ? "Executing Merge..."
                : "Execute Merge & Delete Source"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Configure Merge Parameters
        </CardTitle>
        <CardDescription>
          Provide the source code and destination UUID to generate a merge
          preview.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePreviewSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="source-org-code">
              Source Organization Code (to delete)
            </Label>
            <Input
              id="source-org-code"
              placeholder="e.g. MITS-KL"
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dest-org-id">
              Destination Organization UUID (to merge into)
            </Label>
            <Input
              id="dest-org-id"
              placeholder="e.g. d4e5f6a7-b8c9-0123-def0-123456789abc"
              value={destId}
              onChange={(e) => setDestId(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isPreviewLoading}>
              {isPreviewLoading
                ? "Generating Preview..."
                : "Preview Merge Impact"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
