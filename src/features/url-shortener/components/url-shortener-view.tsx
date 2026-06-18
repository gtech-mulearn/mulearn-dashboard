"use client";

import { Link2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Blank } from "@/components/dashboard/table/Blank";
import Pagination from "@/components/dashboard/table/pagination";
import Table from "@/components/dashboard/table/Table";
import TableTop from "@/components/dashboard/table/TableTop";
import THead from "@/components/dashboard/table/Thead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useDeleteShortUrl,
  useShortUrlsList,
} from "@/features/url-shortener/hooks/use-short-urls";
import type { ShortUrlItem } from "@/features/url-shortener/schemas/shortener.schema";
import { getApiResponseError } from "@/hooks/use-get-error";
import { UrlShortenerFormModal } from "./url-shortener-form-modal";

const COLUMNS = [
  { column: "title", Label: "Title", isSortable: true },
  { column: "short_url", Label: "Short URL", isSortable: true },
  { column: "long_url", Label: "Long URL", isSortable: true },
  { column: "created_at", Label: "Created On", isSortable: true },
] as const;

export default function UrlShortenerView() {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [sort, setSort] = useState("");
  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<ShortUrlItem | null>(null);
  const router = useRouter();
  const deleteMutation = useDeleteShortUrl();

  const { data, isLoading } = useShortUrlsList({
    pageIndex: currentPage,
    perPage,
    search,
    sortBy: sort,
  });

  const rows = (data?.data ?? []) as ShortUrlItem[];
  const totalPages = data?.pagination.totalPages ?? 0;
  const totalCount = data?.pagination.total;

  const handleNextClick = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages || 1));
  };

  const handlePreviousClick = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleSearch = (value: string) => {
    setCurrentPage(1);
    setSearch(value);
  };

  const handlePerPageNumber = (value: number) => {
    setCurrentPage(1);
    setPerPage(value);
  };

  const handleSortChange = (column: string) => {
    setCurrentPage(1);
    setSort((prev) => (prev === column ? `-${column}` : column));
  };

  const handleDeleteRow = async (value: string | undefined) => {
    if (!value) return;
    try {
      await deleteMutation.mutateAsync(value);
      toast.success("Short URL deleted");
    } catch (error) {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to delete short URL" }),
      );
    }
  };

  const handleEditClick = (id: string | number | boolean) => {
    const found = rows.find((r) => r.id === String(id));
    if (found) {
      setEditItem(found);
      setFormOpen(true);
    }
  };

  const handleAnalyticsClick = (id: string | number | boolean) => {
    router.push(`/dashboard/url-shortener/${id}/analytics`);
  };

  const handleCopyClick = (shorturl: string) => {
    const fullUrl = `https://mulearn.org/r/${shorturl}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("Short URL copied");
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) setEditItem(null);
  };

  return (
    <>
      <Card className="overflow-visible border-0 bg-transparent shadow-none rounded-none">
        <CardHeader className="px-0 py-0 sm:px-0 sm:py-0">
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.06] px-3 py-1 text-xs font-semibold text-primary">
                <Link2 className="size-3.5" />
                URL Management
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                URL Shortener
              </CardTitle>
            </div>
            <Button
              className="shrink-0 gap-1.5"
              onClick={() => {
                setEditItem(null);
                setFormOpen(true);
              }}
            >
              <Plus className="size-3.5" />
              Create New URL
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 bg-transparent p-0">
          <TableTop
            onSearchText={handleSearch}
            onPerPageNumber={handlePerPageNumber}
            perPage={perPage}
            perPageOptions={[5, 10, 20, 50, 100]}
            CSV=""
            searchPlaceholder="Search URLs..."
            searchSize="md"
            searchPosition="right"
            searchWrapperClassName="md:max-w-[780px]"
            searchFieldWrapperClassName="lg:max-w-[460px]"
            searchInputClassName="h-10 text-sm"
          />
          <Table
            rows={rows}
            isLoading={isLoading}
            page={currentPage}
            perPage={perPage}
            columnOrder={[...COLUMNS]}
            id={["id"]}
            onEditClick={handleEditClick}
            analytics={handleAnalyticsClick}
            onCopyClick={(id) => {
              const url = rows.find((r) => r.id === String(id));
              if (url) {
                handleCopyClick(url.short_url || "");
              }
            }}
            onDeleteClick={handleDeleteRow}
            modalDeleteHeading="Delete"
            modalTypeContent="error"
            modalDeleteContent="Are you sure you want to delete this short URL?"
          >
            <THead
              columnOrder={[...COLUMNS]}
              onIconClick={handleSortChange}
              action
            />
            <div>
              {!isLoading && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  handleNextClick={handleNextClick}
                  handlePreviousClick={handlePreviousClick}
                  perPage={perPage}
                  totalCount={totalCount}
                />
              )}
            </div>
            <Blank />
          </Table>
        </CardContent>
      </Card>
      <UrlShortenerFormModal
        open={formOpen}
        onOpenChange={handleFormClose}
        item={editItem}
      />
    </>
  );
}
