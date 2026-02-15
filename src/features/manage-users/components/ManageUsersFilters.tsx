"use client";

import { Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ManageUsersFiltersProps {
  search: string;
  perPage: number;
  onSearchChange: (value: string) => void;
  onPerPageChange: (value: number) => void;
  onExportCsv: () => void;
  disableExport?: boolean;
}

export function ManageUsersFilters({
  search,
  perPage,
  onSearchChange,
  onPerPageChange,
  onExportCsv,
  disableExport = false,
}: ManageUsersFiltersProps) {
  return (
    <div className="bg-card border-border flex flex-wrap items-center gap-3 rounded-lg border p-4">
      <div className="relative min-w-64 grow">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search users..."
          className="pl-9"
        />
      </div>

      <Select
        value={String(perPage)}
        onValueChange={(value) => onPerPageChange(Number(value))}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Rows per page" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="10">10 / page</SelectItem>
          <SelectItem value="20">20 / page</SelectItem>
          <SelectItem value="50">50 / page</SelectItem>
        </SelectContent>
      </Select>

      <Button
        type="button"
        variant="outline"
        onClick={onExportCsv}
        disabled={disableExport}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        CSV
      </Button>
    </div>
  );
}
