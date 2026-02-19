"use client";

import { useState } from "react";
import ManagementTablePage from "@/components/dashboard/table/ManagementTablePage";
import { useManageUsersList } from "@/features/manage-users/hooks";
import type { ManageUserListItem } from "@/features/manage-users/schemas";

export default function ManageUsers() {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [sort, setSort] = useState("");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useManageUsersList({
    pageIndex: currentPage,
    perPage,
    search,
    sortBy: sort,
  });

  const rows = (data?.data ?? []) as ManageUserListItem[];
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

  return (
    <ManagementTablePage
      badgeText="User Management"
      titleText="Manage Users"
      columnOrder={[
        { column: "full_name", Label: "Full Name", isSortable: true },
        { column: "karma", Label: "Total Karma", isSortable: true },
        { column: "muid", Label: "Mu ID", isSortable: true },
        { column: "email", Label: "Email", isSortable: true },
        { column: "mobile", Label: "Mobile", isSortable: true },
        { column: "discord_id", Label: "Discord ID", isSortable: true },
        { column: "level", Label: "Level", isSortable: true },
        { column: "created_at", Label: "Created On", isSortable: true },
      ]}
      rowIdColumns={["id"]}
      rows={rows}
      isLoading={isLoading}
      totalPages={totalPages}
      totalCount={totalCount}
      currentPage={currentPage}
      perPage={perPage}
      onSearch={handleSearch}
      onPerPageNumber={handlePerPageNumber}
      onNextClick={handleNextClick}
      onPreviousClick={handlePreviousClick}
      onSortChange={handleSortChange}
      onAfterDelete={() => setCurrentPage(1)}
      enableEdit={true}
      enableDelete={true}
    />
  );
}
