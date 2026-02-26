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
import THead from "@/components/dashboard/table/Thead";
import type { LeaderboardOption } from "../schemas";
import { useModeratorBoard } from "../hooks";

// ─── Column definitions ───────────────────────────────────────────────────────

const COLUMN_ORDER = [
  { column: "name", Label: "Name", isSortable: false, width: "w-1/4" },
  { column: "count", Label: "Task Count", isSortable: false, width: "w-1/4" },
  { column: "muid", Label: "Muid", isSortable: false, width: "w-1/4" },
];

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
    >
      <THead
        columnOrder={COLUMN_ORDER}
        onIconClick={() => undefined}
        action={false}
        thClassName="text-xl"
        slNoClassName="w-1/4"
      />
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
