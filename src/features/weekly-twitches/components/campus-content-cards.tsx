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
import { StateDisplay } from "@/components/ui/state-display";
import { useIsList, useSmtList } from "../hooks";
import type { CampusContentItem, CampusContentType } from "../schemas";
import { CampusContentDetailDialog } from "./campus-content-detail-dialog";
import { MediaCard, MediaCardSkeleton } from "./media-card";

const SKELETONS = Array.from({ length: 6 }, (_, i) => `skeleton-${i}`);

const LABELS: Record<CampusContentType, string> = {
  smt: "Salt Mango Tree",
  isr: "Inspiration Station Radio",
};

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
    status: status || "ongoing,upcoming",
    zone: zone || undefined,
  };

  const smtQuery = useSmtList(params, contentType === "smt");
  const isQuery = useIsList(params, contentType === "isr");
  const { data, isLoading, isError } =
    contentType === "smt" ? smtQuery : isQuery;

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
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {SKELETONS.map((key) => (
            <MediaCardSkeleton key={key} />
          ))}
        </div>
      ) : isError ? (
        <StateDisplay
          variant="no-results"
          className="rounded-2xl border border-dashed border-border bg-muted/40"
          title="Failed to load episodes"
          description={`Something went wrong while fetching ${LABELS[contentType]} episodes. Please try again.`}
        />
      ) : items.length === 0 ? (
        <StateDisplay
          variant="no-results"
          className="rounded-2xl border border-dashed border-border bg-muted/40"
          title="No episodes found"
          description={`There are currently no ${LABELS[contentType]} episodes listed here.`}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <MediaCard
              key={item.id}
              id={item.id}
              title={item.topic}
              subtitle={item.campus}
              date={item.date}
              time={item.time}
              status={item.status}
              onClick={() => setSheetItem(item)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {items.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          perPage={12}
          totalCount={data?.pagination.count}
          currentPageCount={items.length}
          handlePreviousClick={() => setPage((p) => p - 1)}
          handleNextClick={() => setPage((p) => p + 1)}
        />
      )}

      {/* Detail dialog */}
      <CampusContentDetailDialog
        item={sheetItem}
        contentType={contentType}
        onClose={() => setSheetItem(null)}
      />
    </div>
  );
}
