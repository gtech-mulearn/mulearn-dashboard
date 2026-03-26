"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Table from "@/components/dashboard/table/Table";
import THead from "@/components/dashboard/table/Thead";
import Pagination from "@/components/dashboard/table/pagination";
import TableTop from "@/components/dashboard/table/TableTop";
import { Blank } from "@/components/dashboard/table/Blank";
import { useCollegeLevelsList } from "@/features/college-levels/hooks";

export default function CollegeLevelsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");

  const { data, isLoading } = useCollegeLevelsList({
    pageIndex: currentPage,
    perPage,
    search,
    sortBy: sort,
  });

  /* =====================================================
     Column Definition (single source of truth)
  ===================================================== */

  const columns = [
    { column: "org", Label: "College", isSortable: true },
    { column: "level", Label: "Level", isSortable: true },
    { column: "member_count", Label: "No of Members", isSortable: true },
    {
      column: "no_of_members_increased",
      Label: "Member Gain",
      isSortable: true,
    },
    { column: "lc_count", Label: "Number of LCs", isSortable: true },
    { column: "no_of_lc_increased", Label: "LC Gain", isSortable: true },
    { column: "total_karma_gained", Label: "Total Karma", isSortable: true },
    { column: "total_karma_increased", Label: "Karma Gain", isSortable: true },
    { column: "no_of_alumni", Label: "Number of Alumni", isSortable: false },
  ];

  /* =====================================================
     Transform API response safely
  ===================================================== */

  const rows = useMemo(() => {
    if (!data?.data) return [];

    return data.data.map((item) => {
      const karma =
        typeof item.total_karma === "number" || !item.total_karma
          ? null
          : item.total_karma;

      return {
        id: item.id,
        org: item.org,
        level: item.level,
        member_count: item.number_of_members.member_count,
        member_gain: item.number_of_members.no_of_members_increased,
        lc_count: item.no_of_lc.lc_count,
        lc_gain: item.no_of_lc.no_of_lc_increased,
        total_karma: karma ? karma.total_karma_gained : "-",
        karma_gain: karma
          ? `${karma.total_karma_increased} (${Math.round(
              karma.increased_percentage,
            )}%)`
          : "-",
        no_of_alumni: item.no_of_alumni,
      };
    });
  }, [data]);

  const totalPages = data?.pagination?.totalPages ?? 0;
  const totalCount = data?.pagination?.count ?? 0;

  const handleSortChange = (column: string) => {
    setCurrentPage(1);
    setSort((prev) => (prev === column ? `-${column}` : column));
  };

  return (
    <Card className="border-0 bg-transparent shadow-none rounded-none">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Community: College Levels
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <TableTop
          onSearchText={(val) => {
            setCurrentPage(1);
            setSearch(val);
          }}
          onPerPageNumber={(val) => {
            setCurrentPage(1);
            setPerPage(val);
          }}
          perPage={perPage}
          perPageOptions={[10, 20, 50]}
          CSV=""
          searchPlaceholder="Search college..."
          searchSize="md"
          searchPosition="right"
        />

        <Table
          rows={rows}
          isloading={isLoading}
          page={currentPage}
          perPage={perPage}
          columnOrder={columns}
        >
          <THead
            columnOrder={columns}
            onIconClick={handleSortChange}
            action={false}
          />

          {!isLoading && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              handleNextClick={() =>
                setCurrentPage((p) => Math.min(p + 1, totalPages || 1))
              }
              handlePreviousClick={() =>
                setCurrentPage((p) => Math.max(p - 1, 1))
              }
              perPage={perPage}
              totalCount={totalCount}
            />
          )}

          <Blank />
        </Table>
      </CardContent>
    </Card>
  );
}
