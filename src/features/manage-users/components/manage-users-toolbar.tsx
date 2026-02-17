"use client";

import { Download, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

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
    <div className="flex flex-col gap-4 rounded-2xl border border-border/50 bg-card p-2 shadow-sm lg:flex-row lg:items-center lg:p-1.5">
      {/* Search Section */}
      <div className="relative flex-1">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50">
          <Search className="size-4" />
        </div>
        <Input
          value={searchInput}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by name, email, Mu ID..."
          className="h-10 w-full border-none bg-transparent pl-9 text-base shadow-none hover:bg-muted/30 focus-visible:ring-0 lg:text-sm"
        />
      </div>

      <Separator orientation="vertical" className="hidden h-8 lg:block" />
      <Separator orientation="horizontal" className="lg:hidden" />

      {/* Actions Section */}
      <div className="grid grid-cols-[1fr_auto] gap-2 lg:flex lg:items-center">
        {/* Row Count Select */}
        <div className="flex items-center gap-2">
          <span className="hidden text-xs font-medium text-muted-foreground lg:inline-block whitespace-nowrap">
            Rows per page
          </span>
          <Select
            value={String(perPage)}
            onValueChange={(value) => onPerPageChange(Number(value))}
          >
            <SelectTrigger className="h-10 w-full rounded-xl border-border/60 bg-muted/30 text-sm font-medium shadow-sm transition-colors hover:bg-muted/50 focus:ring-primary/20 lg:w-[80px]">
              <SelectValue placeholder="Rows" />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50, 100].map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Export Button */}
        <Button
          variant="outline"
          onClick={onDownloadCsv}
          className="h-10 gap-2 rounded-xl border-border/60 bg-muted/30 font-medium text-foreground hover:bg-muted/50 hover:text-primary lg:px-4"
        >
          <Download className="size-4" />
          <span className="hidden sm:inline">Export CSV</span>
          <span className="sm:hidden">Export</span>
        </Button>
      </div>
    </div>
  );
}
