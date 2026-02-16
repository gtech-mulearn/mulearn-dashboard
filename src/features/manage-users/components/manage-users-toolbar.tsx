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
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
      <div className="relative min-w-[260px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search users"
          className="pl-9"
        />
      </div>

      <Select
        value={String(perPage)}
        onValueChange={(value) => onPerPageChange(Number(value))}
      >
        <SelectTrigger className="w-full sm:w-[120px]">
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

      <Button variant="outline" onClick={onDownloadCsv}>
        <Download className="size-4" />
        CSV
      </Button>
    </div>
  );
}
