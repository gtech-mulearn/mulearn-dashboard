"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/api";
import { endpoints } from "@/api/endpoints";
import { authStore } from "@/lib/auth";
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

// ─── CSV download hook (callback-based, mirrors useManageUsersCsvDownload) ──

export function useKarmaVoucherCsvDownload() {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadCsv = useCallback(async () => {
    const token = authStore.getAccessToken();
    if (!token) {
      throw new Error("Please login again to download CSV");
    }

    setIsDownloading(true);
    try {
      const base = process.env.NEXT_PUBLIC_DJANGO_API_URL;
      const csvPath = endpoints.admin.karmaVoucher.exportCSV;
      const response = await fetch(base ? `${base}${csvPath}` : csvPath, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download CSV");
      }

      const blob = await response.blob();
      downloadBlob(blob, "karma-vouchers.csv");
    } finally {
      setIsDownloading(false);
    }
  }, []);

  return { downloadCsv, isDownloading };
}

// ─── Helper ─────────────────────────────────────────────────────────────────

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}
