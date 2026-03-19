"use client";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import type {
  ChannelData,
  CreateChannelInput,
  UpdateChannelInput,
} from "../schema";
import {
  useAddChannel,
  useChannel,
  useDeleteChannel,
  useUpdateChannel,
} from "./index";

const EMPTY_CREATE: CreateChannelInput = { name: "", discord_id: "" };
const EMPTY_EDIT: UpdateChannelInput = { name: "", discord_id: "" };

export function useChannelLogic() {
  // ── Pagination / filter state ──────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");

  // ── Modal state ────────────────────────────────────────────
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [createForm, setCreateForm] =
    useState<CreateChannelInput>(EMPTY_CREATE);
  const [editForm, setEditForm] = useState<UpdateChannelInput>(EMPTY_EDIT);

  // ── React Query hooks ──────────────────────────────────────
  const { data, isLoading } = useChannel({
    page: currentPage,
    perPage,
    search,
    sortBy,
  });

  const addMutation = useAddChannel();
  const updateMutation = useUpdateChannel();
  const deleteMutation = useDeleteChannel();

  const isSubmitting = addMutation.isPending || updateMutation.isPending;

  // ── Derived data ───────────────────────────────────────────
  const rows: ChannelData[] = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;
  const totalCount = data?.pagination?.count ?? 0;

  // ── Handlers ───────────────────────────────────────────────
  const handleNextClick = useCallback(() => {
    setCurrentPage((p) => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const handlePreviousClick = useCallback(() => {
    setCurrentPage((p) => Math.max(p - 1, 1));
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setCurrentPage(1);
  }, []);

  const handlePerPageChange = useCallback((value: number) => {
    setPerPage(value);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((column: string) => {
    setSortBy((prev) => (prev === column ? `-${column}` : column));
  }, []);

  const handleDeleteRow = useCallback(
    (id: string) => {
      deleteMutation.mutate(id, {
        onSuccess: () => toast.success("Channel deleted."),
        onError: () => toast.error("Failed to delete channel."),
      });
    },
    [deleteMutation],
  );

  // ── Create ─────────────────────────────────────────────────
  const toggleCreateModal = useCallback((open: boolean) => {
    setOpenCreate(open);
    if (!open) setCreateForm(EMPTY_CREATE);
  }, []);

  const handleCreateSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      addMutation.mutate(createForm, {
        onSuccess: () => {
          toast.success("Channel created.");
          toggleCreateModal(false);
        },
        onError: () => toast.error("Failed to create channel."),
      });
    },
    [addMutation, createForm, toggleCreateModal],
  );

  // ── Edit ───────────────────────────────────────────────────
  const toggleEditModal = useCallback((open: boolean) => {
    setOpenEdit(open);
    if (!open) setEditForm(EMPTY_EDIT);
  }, []);

  const handleEditClick = useCallback((row: ChannelData) => {
    setEditForm({ name: row.name, discord_id: row.discord_id });
    setOpenEdit(true);
  }, []);

  const handleEditSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      updateMutation.mutate(editForm, {
        onSuccess: () => {
          toast.success("Channel updated.");
          toggleEditModal(false);
        },
        onError: () => toast.error("Failed to update channel."),
      });
    },
    [updateMutation, editForm, toggleEditModal],
  );

  return {
    rows,
    isLoading,
    currentPage,
    perPage,
    totalPages,
    totalCount,
    openCreate,
    openEdit,
    isSubmitting,
    createForm,
    editForm,
    handleNextClick,
    handlePreviousClick,
    handleSearch,
    handlePerPageChange,
    handleSortChange,
    handleDeleteRow,
    handleCreateSubmit,
    handleEditSubmit,
    handleEditClick,
    toggleCreateModal,
    toggleEditModal,
    setCreateForm,
    setEditForm,
  };
}
