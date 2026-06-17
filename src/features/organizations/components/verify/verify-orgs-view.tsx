"use client";

import { useMemo, useState } from "react";
import { Blank } from "@/components/dashboard/table/Blank";
import Table, { type Data } from "@/components/dashboard/table/Table";
import TableTop from "@/components/dashboard/table/TableTop";
import THead from "@/components/dashboard/table/Thead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUnverifiedOrgs } from "../../hooks/use-verification";
import type { UnverifiedOrgItem } from "../../schemas/verification.schema";
import { VerifyActionDialog } from "./verify-action-dialog";

const COLUMNS = [
  { column: "title", Label: "Title", isSortable: false },
  { column: "org_type", Label: "Type", isSortable: false },
  { column: "department", Label: "Department", isSortable: false },
  { column: "graduation_year", Label: "Grad. Year", isSortable: false },
  { column: "created_by", Label: "Created By", isSortable: false },
  { column: "created_at", Label: "Created At", isSortable: false },
];

export default function VerifyOrgsView() {
  const [searchInput, setSearchInput] = useState("");

  const { data: orgs, isLoading } = useUnverifiedOrgs();

  const [selectedOrg, setSelectedOrg] = useState<UnverifiedOrgItem | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!orgs) return [];
    const term = searchInput.toLowerCase();
    return term
      ? orgs.filter(
          (o) =>
            o.title.toLowerCase().includes(term) ||
            o.org_type.toLowerCase().includes(term) ||
            o.created_by.toLowerCase().includes(term),
        )
      : orgs;
  }, [orgs, searchInput]);

  const rows = useMemo(
    () =>
      filtered.map((item, idx) => ({
        id: item.id,
        slno: idx + 1,
        title: item.title,
        org_type: item.org_type,
        department: item.department ?? "—",
        graduation_year: item.graduation_year ?? "—",
        created_by: item.created_by,
        created_at: new Date(item.created_at).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        _raw: item,
      })),
    [filtered],
  );

  const renderActions = (row: Data) => (
    <Button
      onClick={() => {
        setSelectedOrg(row._raw as unknown as UnverifiedOrgItem);
        setDialogOpen(true);
      }}
    >
      Review
    </Button>
  );

  const renderCell = (column: string, row: Data) => {
    if (column === "org_type") {
      const val = row[column];
      return <Badge variant="outline">{val ? String(val) : "—"}</Badge>;
    }
    return null; // let Table render default
  };

  return (
    <Card className="border-0 bg-transparent shadow-none rounded-none">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-0">
        <div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Organization Verification
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Review and approve or reject unverified organization submissions
          </p>
        </div>
        <Badge
          variant="outline"
          className="text-sm px-3 py-1 self-start sm:self-auto"
        >
          {filtered.length} pending
        </Badge>
      </CardHeader>

      <CardContent className="space-y-6 px-0">
        <TableTop
          onSearchText={(val) => setSearchInput(val)}
          onPerPageNumber={() => {}}
          perPage={10}
          perPageOptions={[10, 25, 50]}
          CSV=""
          searchPlaceholder="Search by name, type, or submitter…"
          searchSize="md"
          searchPosition="right"
          searchWrapperClassName="md:max-w-[680px]"
          searchFieldWrapperClassName="lg:max-w-[380px]"
          searchInputClassName="h-10 text-sm"
        />

        <div className="w-full overflow-x-auto">
          <Table
            rows={rows as unknown as Data[]}
            isLoading={isLoading}
            page={1}
            perPage={rows.length || 10}
            columnOrder={COLUMNS}
            id={["id"]}
            customActionRender={renderActions}
            customCellRender={renderCell}
          >
            <THead columnOrder={COLUMNS} onIconClick={() => {}} action={true} />
            <Blank />
          </Table>
        </div>
      </CardContent>

      <VerifyActionDialog
        isOpen={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedOrg(null);
        }}
        org={selectedOrg}
      />
    </Card>
  );
}
