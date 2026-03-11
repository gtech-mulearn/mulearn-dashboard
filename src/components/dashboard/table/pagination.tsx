import { Button } from "@/components/ui/button";

type Props = {
  handlePreviousClick?: () => void;
  handleNextClick?: () => void;
  currentPage: number;
  totalPages: number;
  perPage: number;
  totalCount?: number;
};

const Pagination = ({
  handlePreviousClick,
  handleNextClick,
  currentPage,
  totalPages,
  perPage,
  totalCount,
}: Props) => {
  const start = (currentPage - 1) * perPage + 1;
  const end = totalCount
    ? Math.min(currentPage * perPage, totalCount)
    : currentPage * perPage;

  return (
    <>
      {totalPages > 0 && (
        <div className="flex flex-col items-start justify-between gap-4 border-t border-border/40 pt-4 sm:flex-row sm:items-center">
          <div className="text-sm text-muted-foreground">
            Showing <strong className="text-foreground">{start}</strong> to{" "}
            <strong className="text-foreground">{end}</strong> entries
          </div>
          <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto sm:justify-normal">
            <Button
              variant="outline"
              onClick={handlePreviousClick}
              disabled={currentPage <= 1}
              className="h-10 shrink-0 whitespace-nowrap rounded-xl border-primary/30 px-4 text-sm font-semibold text-primary transition-all hover:bg-primary/10 disabled:border-border"
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
              className="h-10 shrink-0 whitespace-nowrap rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition-all hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
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
