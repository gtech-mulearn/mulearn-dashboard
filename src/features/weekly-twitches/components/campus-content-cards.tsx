"use client";

import { useState } from "react";
import Pagination from "@/components/dashboard/table/pagination";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsList, useSmtList } from "../hooks";
import type { CampusContentItem, CampusContentType } from "../schemas";
import { MediaCard, MediaCardSkeleton } from "./media-card";
import { CampusContentDetailSheet } from "./media-detail-sheet";

const SKELETONS = Array.from({ length: 6 }, (_, i) => `skeleton-${i}`);

interface Props {
  contentType: CampusContentType;
}

export function CampusContentCards({ contentType }: Props) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [zone, setZone] = useState("");
  const [sheetItem, setSheetItem] = useState<CampusContentItem | null>(null);

  const params = {
    pageIndex: page,
    perPage: 12,
    search,
    status: status || undefined,
    zone: zone || undefined,
  };

  const smtQuery = useSmtList(params, contentType === "smt");
  const isQuery = useIsList(params, contentType === "isr");
  const { data, isLoading } = contentType === "smt" ? smtQuery : isQuery;

  const items = data?.data ?? [];
  const totalPages = data?.pagination.totalPages ?? 0;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap gap-2">
          <Input
            placeholder="Search episodes..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="max-w-xs rounded-xl"
          />
          <Select
            value={status || "all"}
            onValueChange={(v) => {
              setPage(1);
              setStatus(v === "all" ? "" : v);
            }}
          >
            <SelectTrigger className="w-[140px] rounded-xl border-border bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={zone || "all"}
            onValueChange={(v) => {
              setPage(1);
              setZone(v === "all" ? "" : v);
            }}
          >
            <SelectTrigger className="w-[120px] rounded-xl border-border bg-background">
              <SelectValue placeholder="Zone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All zones</SelectItem>
              <SelectItem value="north">North</SelectItem>
              <SelectItem value="central">Central</SelectItem>
              <SelectItem value="south">South</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading
          ? SKELETONS.map((key) => <MediaCardSkeleton key={key} />)
          : items.map((item) => (
              <MediaCard
                key={item.id}
                id={item.id}
                title={item.topic}
                subtitle={item.campus}
                date={item.date}
                status={item.status}
                onClick={() => setSheetItem(item)}
              />
            ))}
      </div>

      {/* Empty */}
      {!isLoading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <p className="text-sm">No episodes found.</p>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        perPage={12}
        totalCount={data?.pagination.count}
        currentPageCount={items.length}
        handlePreviousClick={() => setPage((p) => p - 1)}
        handleNextClick={() => setPage((p) => p + 1)}
      />

      {/* Detail sheet */}
      <CampusContentDetailSheet
        item={sheetItem}
        contentType={contentType}
        onClose={() => setSheetItem(null)}
      />
    </div>
  );
}
