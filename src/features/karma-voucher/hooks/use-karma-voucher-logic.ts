/**
 * Karma Voucher Page Logic Hook
 *
 * 📍 src/features/Karma-voucher/hooks/use-karma-voucher-logic.ts
 *
 * Consolidates all state and mutation logic for the Karma Voucher management page.
 * This pattern keeps the UI component purely declarative.
 */

"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import type {
  CreateVoucherPayload,
  KarmaVoucher,
  UpdateVoucherPayload,
} from "../types";
import {
  useCreateKarmaVoucher,
  useDeleteKarmaVoucher,
  useDownloadTemplate,
  useImportVouchers,
  useKarmaVoucherCsvDownload,
  useKarmaVouchers,
  useUpdateKarmaVoucher,
} from "./index";

export function useKarmaVoucherLogic() {
  // ─── Local State ──────────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [sort, setSort] = useState("");
  const [search, setSearch] = useState("");
  const [openImport, setOpenImport] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<KarmaVoucher | null>(
    null,
  );

  // ─── Mutation Hooks ───────────────────────────────────────────────────────
  const { deleteVoucher, isDeleting } = useDeleteKarmaVoucher();
  const { createVoucher, isCreating } = useCreateKarmaVoucher();
  const { updateVoucher, isUpdating } = useUpdateKarmaVoucher();
  const {
    uploadVouchers,
    isUploading,
    importData,
    isSuccess: isImportSuccess,
    reset: resetImport,
  } = useImportVouchers();

  const { downloadCsv, isDownloading: isExporting } =
    useKarmaVoucherCsvDownload();

  const { downloadTemplateFile, isDownloading: isDownloadingTemplate } =
    useDownloadTemplate();

  // ─── Data Fetching ────────────────────────────────────────────────────────
  const { data, isLoading: isDataLoading } = useKarmaVouchers({
    page: currentPage,
    perPage,
    search,
    sortBy: sort,
  });

  // ─── Computed Values ──────────────────────────────────────────────────────
  const rows = (data?.data ?? []) as KarmaVoucher[];
  const totalPages = data?.pagination?.totalPages ?? 1;
  const totalCount = data?.pagination?.count ?? 0;

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const _handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleNextClick = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const handlePreviousClick = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const handleSearch = useCallback((value: string) => {
    setCurrentPage(1);
    setSearch(value);
  }, []);

  const handlePerPageChange = useCallback((value: number) => {
    setCurrentPage(1);
    setPerPage(value);
  }, []);

  const handleSortChange = useCallback((column: string) => {
    setCurrentPage(1);
    setSort((prev) => (prev === column ? `-${column}` : column));
  }, []);

  const handleDeleteRow = useCallback(
    async (id: string | undefined) => {
      if (!id) return;
      try {
        await deleteVoucher(id);
      } catch {
        // Handled by useDeleteKarmaVoucher's onError toast.
      }
    },
    [deleteVoucher],
  );

  const handleImportSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const file = formData.get("file");
      if (!(file instanceof File)) return;
      if (!file.name.toLowerCase().endsWith(".xlsx")) {
        toast.error("Only .xlsx files are supported for bulk import");
        return;
      }

      try {
        await uploadVouchers(file);
      } catch {
        // Handled by useImportVouchers' onError toast.
      }
    },
    [uploadVouchers],
  );

  const handleDownloadTemplate = useCallback(() => {
    downloadTemplateFile();
  }, [downloadTemplateFile]);

  const toggleImportModal = useCallback(
    (open: boolean) => {
      setOpenImport(open);
      if (!open) resetImport();
    },
    [resetImport],
  );

  const toggleAddModal = useCallback((open: boolean) => {
    setOpenAdd(open);
  }, []);

  const handleAddSubmit = useCallback(
    async (values: CreateVoucherPayload) => {
      await createVoucher(values);
    },
    [createVoucher],
  );

  const handleEditRow = useCallback(
    (id: string | number | boolean) => {
      const voucher = rows.find((row) => row.id === id);
      if (voucher) setEditingVoucher(voucher);
    },
    [rows],
  );

  const closeEditModal = useCallback((open: boolean) => {
    if (!open) setEditingVoucher(null);
  }, []);

  const handleEditSubmit = useCallback(
    async (values: Omit<UpdateVoucherPayload, "id">) => {
      if (!editingVoucher) return;
      await updateVoucher({ id: editingVoucher.id, ...values });
      setEditingVoucher(null);
    },
    [editingVoucher, updateVoucher],
  );

  return {
    // Data & State
    rows,
    isLoading: isDataLoading || isDeleting,
    currentPage,
    perPage,
    sort,
    search,
    totalPages,
    totalCount,
    openImport,
    openAdd,
    editingVoucher,

    // Mutation States
    isUploading,
    isImportSuccess,
    importData,
    isExporting,
    isDownloadingTemplate,
    isCreating,
    isUpdating,

    // Handlers
    handleNextClick,
    handlePreviousClick,
    handleSearch,
    handlePerPageChange,
    handleSortChange,
    handleDeleteRow,
    handleImportSubmit,
    handleDownloadTemplate,
    toggleImportModal,
    toggleAddModal,
    handleAddSubmit,
    handleEditRow,
    closeEditModal,
    handleEditSubmit,
    downloadCsv,
  };
}
