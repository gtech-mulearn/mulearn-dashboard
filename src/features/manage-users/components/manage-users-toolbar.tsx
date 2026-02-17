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
    <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center">
      <div className="relative w-full lg:min-w-[340px]">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/80" />
        <Input
          value={searchInput}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by name, email, Mu ID"
          className="h-12 rounded-2xl border-border/60 bg-card pl-11 text-base shadow-[0_6px_20px_-16px_rgba(0,0,0,0.45)] transition-all placeholder:text-muted-foreground/90 focus-visible:border-primary/35 focus-visible:ring-primary/25"
        />
      </div>

      <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto sm:items-center">
        <Select
          value={String(perPage)}
          onValueChange={(value) => onPerPageChange(Number(value))}
        >
          <SelectTrigger className="h-12 w-full rounded-2xl border-border/60 bg-card text-base shadow-[0_6px_20px_-16px_rgba(0,0,0,0.45)] sm:w-[150px]">
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
          variant="default"
          onClick={onDownloadCsv}
          className="h-12 gap-2 rounded-2xl bg-primary px-5 text-base font-semibold text-primary-foreground shadow-[0_12px_26px_-14px_hsl(var(--primary))] transition-all hover:-translate-y-0.5 hover:bg-primary/90"
        >
          <Download className="size-4" />
          <span>Export CSV</span>
        </Button>
      </div>
    </div>
  );
}
