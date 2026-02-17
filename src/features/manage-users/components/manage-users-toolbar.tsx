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

interface ManageUsersToolbarProps {
  searchInput: string;
  perPage: number;
  onSearchChange: (value: string) => void;
  onPerPageChange: (value: number) => void;
  onDownloadCsv: () => void;
}

export function ManageUsersToolbar({
  searchInput,
  perPage,
  onSearchChange,
  onPerPageChange,
  onDownloadCsv,
}: ManageUsersToolbarProps) {
  return (
    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
      <div className="relative min-w-[260px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search users"
          className="h-10 rounded-xl pl-9"
        />
      </div>

      <Select
        value={String(perPage)}
        onValueChange={(value) => onPerPageChange(Number(value))}
      >
        <SelectTrigger className="h-10 w-full rounded-xl sm:w-[140px]">
          <SelectValue placeholder="Rows" />
        </SelectTrigger>
        <SelectContent>
          {[5, 10, 20, 50, 100].map((option) => (
            <SelectItem key={option} value={String(option)}>
              {option} / page
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        onClick={onDownloadCsv}
        className="h-10 gap-2 rounded-xl border-border bg-background text-foreground hover:bg-muted/50"
      >
        <Download className="size-4" />
        <span className="hidden sm:inline">Export CSV</span>
        <span className="sm:hidden">CSV</span>
      </Button>
    </div>
  );
}
