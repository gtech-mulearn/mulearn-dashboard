import { Button } from "@/components/ui/button";

type Props = {
  handlePreviousClick?: () => void;
  handleNextClick?: () => void;
  currentPage: number;
  totalPages: number;
  perPage: number;
  totalCount?: number;
  currentPageCount?: number;
};

const Pagination = ({
  handlePreviousClick,
  handleNextClick,
  currentPage,
  totalPages,
  perPage,
  totalCount,
  currentPageCount,
}: Props) => {
  const total =
    totalCount ??
    (currentPageCount != null
      ? (totalPages - 1) * perPage +
        (currentPage === totalPages ? currentPageCount : perPage)
      : 0);
  const start = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const end =
    total === 0
      ? 0
      : totalCount !== undefined
        ? Math.min(currentPage * perPage, totalCount)
        : currentPageCount !== undefined
          ? (currentPage - 1) * perPage + currentPageCount
          : currentPage * perPage;

  return (
    <>
      {totalPages > 0 && (
        <div className="flex flex-col items-start justify-between gap-4 border-t border-border/40 pt-4 sm:flex-row sm:items-center">
          <div className="text-sm text-muted-foreground">
            Showing{" "}
            <strong className="text-foreground">
              {start} to {end}
            </strong>{" "}
            out of <strong className="text-foreground">{total}</strong> entries
          </div>
          <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto sm:justify-normal">
            <Button
              variant="outline"
              onClick={handlePreviousClick}
              disabled={currentPage <= 1}
              aria-label="Go to previous page"
            >
              Previous
            </Button>

            <div className="flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-xl border border-primary/20 bg-primary/[0.06] px-4 text-sm font-semibold text-foreground">
              Page {currentPage} of {totalPages || 1}
            </div>

            <Button
              variant="default"
              onClick={handleNextClick}
              disabled={currentPage >= totalPages}
              aria-label="Go to next page"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default Pagination;
