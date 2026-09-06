"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { endpoints } from "@/api/endpoints";
import { useCsvDownload } from "@/hooks/use-csv-download";
import { getApiResponseError } from "@/hooks/use-get-error";
import { downloadBlob } from "@/lib/download";
import {
  createVoucher,
  deleteKarmaVoucher,
  downloadTemplate,
  exportVouchersCsv,
  importVouchers,
  updateVoucher,
} from "../api";
import { karmaVoucherKeys } from "./query-keys";

// ─── Create ─────────────────────────────────────────────────────────────────

export function useCreateKarmaVoucher() {
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: createVoucher,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: karmaVoucherKeys.lists() });
      toast.success("Voucher created and emailed to user");
    },
    onError: (error) =>
      toast.error(
        getApiResponseError(error, { fallback: "Failed to create voucher" }),
      ),
  });

  return {
    createVoucher: mutation.mutateAsync,
    isCreating: mutation.isPending,
    reset: mutation.reset,
  };
}

// ─── Update ─────────────────────────────────────────────────────────────────

export function useUpdateKarmaVoucher() {
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: updateVoucher,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: karmaVoucherKeys.lists() });
      toast.success("Voucher updated");
    },
    onError: (error) =>
      toast.error(
        getApiResponseError(error, { fallback: "Failed to update voucher" }),
      ),
  });

  return {
    updateVoucher: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    reset: mutation.reset,
  };
}

// ─── Delete ─────────────────────────────────────────────────────────────────

export function useDeleteKarmaVoucher() {
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteKarmaVoucher,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: karmaVoucherKeys.lists() });
      toast.success("Voucher deleted");
    },
    onError: (error) =>
      toast.error(getApiResponseError(error, { fallback: "Delete failed" })),
  });

  return {
    deleteVoucher: mutation.mutateAsync,
    isDeleting: mutation.isPending,
  };
}

// ─── Import ─────────────────────────────────────────────────────────────────

export function useImportVouchers() {
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: importVouchers,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: karmaVoucherKeys.lists() });

      const successCount = data.Success.length;
      const failedCount = data.Failed.length;

      if (failedCount === 0) {
        toast.success(
          `Imported ${successCount} voucher${successCount === 1 ? "" : "s"} successfully`,
        );
      } else if (successCount === 0) {
        toast.error(
          `Import failed: ${failedCount} row${failedCount === 1 ? "" : "s"} had errors`,
        );
      } else {
        toast.warning(
          `Imported ${successCount} voucher${successCount === 1 ? "" : "s"}, ${failedCount} row${failedCount === 1 ? "" : "s"} failed`,
        );
      }
    },
    onError: (error) =>
      toast.error(
        getApiResponseError(error, { fallback: "Failed to import vouchers" }),
      ),
  });

  return {
    uploadVouchers: mutation.mutateAsync,
    isUploading: mutation.isPending,
    importData: mutation.data,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
}

// ─── Export CSV (blob download) ─────────────────────────────────────────────

export function useExportVouchersCsv() {
  const mutation = useMutation({
    mutationFn: exportVouchersCsv,
    onSuccess: (blob) => {
      downloadBlob(blob, "karma-vouchers.csv");
      toast.success("Export successful");
    },
    onError: (error) =>
      toast.error(getApiResponseError(error, { fallback: "Export failed" })),
  });

  return {
    exportCsv: mutation.mutateAsync,
    isExporting: mutation.isPending,
  };
}

// ─── Download Template (blob download) ──────────────────────────────────────

export function useDownloadTemplate() {
  const mutation = useMutation({
    mutationFn: downloadTemplate,
    onSuccess: (blob) => {
      downloadBlob(blob, "karma-voucher-template.xlsx");
      toast.success("Template downloaded");
    },
    onError: (error) =>
      toast.error(
        getApiResponseError(error, { fallback: "Template download failed" }),
      ),
  });

  return {
    downloadTemplateFile: mutation.mutateAsync,
    isDownloading: mutation.isPending,
  };
}

// ─── CSV download hook ──────────────────────────────────────────────────────

export function useKarmaVoucherCsvDownload() {
  return useCsvDownload(
    endpoints.admin.karmaVoucher.exportCSV,
    "karma-vouchers.csv",
  );
}
