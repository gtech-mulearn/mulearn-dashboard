/**
 * Moderator Leaderboard
 *
 * 📍 src/features/discord-moderation/components/moderator-leaderboard.tsx
 *
 * Receives `option` (peer | appraiser) from the parent page.
 * Uses the shared Table / THead / Pagination / Blank components.
 */

"use client";

import { useState } from "react";
import { Blank } from "@/components/dashboard/table/Blank";
import Pagination from "@/components/dashboard/table/pagination";
import Table, { type Data } from "@/components/dashboard/table/Table";
import { useModeratorBoard } from "../hooks";
import type { LeaderboardOption } from "../schemas";

// ─── Column definitions ───────────────────────────────────────────────────────

const COLUMN_ORDER = [
  { column: "name", Label: "Name", isSortable: false, width: "w-[30%]" },
  { column: "count", Label: "Task Count", isSortable: false, width: "w-[30%]" },
  { column: "muid", Label: "Muid", isSortable: false, width: "w-[30%]" },
];

/** Custom thead so we can centre all columns uniformly. */
function LeaderboardTHead() {
  const thBase =
    "border-b border-border px-6 py-3 text-sm font-bold tracking-wider";
  return (
    <thead>
      <tr>
        <th className={`${thBase} text-center w-[10%]`}>Sl.no</th>
        <th className={`${thBase} text-left w-[30%]`}>Name</th>
        <th className={`${thBase} text-center w-[30%]`}>Task Count</th>
        <th className={`${thBase} text-left w-[30%]`}>Muid</th>
      </tr>
    </thead>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ModeratorLeaderboardProps {
  option: LeaderboardOption;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ModeratorLeaderboard({ option }: ModeratorLeaderboardProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const { data, isLoading } = useModeratorBoard({
    option,
    pageIndex: currentPage,
    perPage,
  });

  const rows = (data?.data ?? []) as unknown as Data[];
  const totalPages = data?.pagination?.totalPages ?? 1;
  const totalCount = data?.pagination?.total ?? 0;

  // Reset to page 1 whenever option changes (handled by parent re-rendering with new prop)

  return (
    <Table
      rows={rows}
      isloading={isLoading}
      page={currentPage}
      perPage={perPage}
      columnOrder={COLUMN_ORDER}
      id={[]}
      slNoCellClassName="text-center"
      customCellRender={(column, row) => {
        if (column === "count") {
          return <div className="text-center">{String(row.count ?? "-")}</div>;
        }
        return null;
      }}
    >
      <LeaderboardTHead />
      <div>
        {!isLoading && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            handleNextClick={() =>
              setCurrentPage((p) => Math.min(p + 1, totalPages))
            }
            handlePreviousClick={() =>
              setCurrentPage((p) => Math.max(p - 1, 1))
            }
            perPage={perPage}
            totalCount={totalCount}
          />
        )}
      </div>
      <Blank />
    </Table>
  );
}
