import { Download, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { SearchBar } from "./SearchBar";

type Props = {
  onSearchText: (data: string) => void;
  onPerPageNumber: (data: number) => void;
  CSV: string;
  perPage: number;
  perPageOptions: number[];
  searchPlaceholder: string;
  searchSize: "sm" | "md" | "lg";
  searchPosition: "left" | "center" | "right";
  searchWrapperClassName?: string;
  searchFieldWrapperClassName?: string;
  searchBarClassName?: string;
  searchInputClassName?: string;
  onCsvDownload?: () => Promise<void> | void;
  isCsvDownloading?: boolean;
};

const TableTop = ({
  onSearchText,
  onPerPageNumber,
  CSV,
  perPage,
  perPageOptions,
  searchPlaceholder,
  searchSize,
  searchPosition,
  searchWrapperClassName,
  searchFieldWrapperClassName,
  searchBarClassName,
  searchInputClassName,
  onCsvDownload,
  isCsvDownloading = false,
}: Props) => {
  const handleData = (search: string) => {
    onSearchText(search);
  };

  const handleClick = async () => {
    if (!onCsvDownload) return;
    try {
      await onCsvDownload();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to download CSV",
      );
    }
  };

  return (
    <div
      className={cn(
        "mb-4 flex flex-col gap-3 rounded-2xl border border-border/50 bg-card p-3 md:flex-row md:items-center",
        searchPosition === "left" && "md:justify-start",
        searchPosition === "center" && "md:justify-center",
        searchPosition === "right" && "md:justify-between",
      )}
    >
      {searchPosition !== "left" && (
        <div
          aria-hidden
          className="hidden text-2xl font-bold text-foreground md:block md:w-[240px]"
        ></div>
      )}
      <div
        className={cn(
          "w-full rounded-2xl border border-border bg-muted/40 p-1.5 md:max-w-[720px]",
          searchPosition === "center" && "mx-auto",
          searchPosition === "right" && "md:ml-auto",
          searchPosition === "left" && "md:mr-auto",
          searchWrapperClassName,
          !CSV && "md:w-fit md:max-w-none",
        )}
      >
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div
            className={cn(
              "relative flex-1 w-full lg:w-auto",
              searchFieldWrapperClassName,
              !CSV && "lg:flex-none",
            )}
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
            <SearchBar
              onSearch={handleData}
              placeholder={searchPlaceholder}
              size={searchSize}
              showButton={false}
              className={cn(CSV ? "w-full" : "w-fit", searchBarClassName)}
              inputClassName={cn(
                "border-border bg-background pl-9 pr-3",
                searchInputClassName,
              )}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 w-full lg:w-auto">
            <div className="flex items-center gap-2">
              <span className="whitespace-nowrap text-xs font-medium text-muted-foreground">
                Rows per page
              </span>
              <Select
                value={String(perPage)}
                onValueChange={(value) => onPerPageNumber(Number(value))}
              >
                <SelectTrigger className="h-10 w-[88px] rounded-xl border-border bg-background">
                  <SelectValue placeholder="Rows" />
                </SelectTrigger>
                <SelectContent>
                  {perPageOptions.map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {CSV && (
              <Button
                variant="outline"
                onClick={handleClick}
                disabled={isCsvDownloading}
                className="h-10 rounded-xl border-border bg-background px-4 font-semibold text-foreground hover:bg-muted"
              >
                <Download className="mr-2 size-4" />
                Export CSV
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableTop;
