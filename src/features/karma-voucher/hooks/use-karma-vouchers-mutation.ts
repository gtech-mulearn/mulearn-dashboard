"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/api";
import { endpoints } from "@/api/endpoints";
import { useCsvDownload } from "@/hooks/use-csv-download";
import { downloadBlob } from "@/lib/download";
import {
  deleteKarmaVoucher,
  downloadTemplate,
  exportVouchersCsv,
  importVouchers,
} from "../api";
import { karmaVoucherKeys } from "./query-keys";

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
      toast.error(error instanceof ApiError ? error.message : "Delete failed"),
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: karmaVoucherKeys.lists() });
    },
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
      toast.error(error instanceof ApiError ? error.message : "Export failed"),
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
        error instanceof ApiError ? error.message : "Template download failed",
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
