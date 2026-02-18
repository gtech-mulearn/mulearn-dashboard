import type { Dispatch, SetStateAction } from "react";
import { SlArrowLeft, SlArrowRight } from "react-icons/sl";
import ShowPerPage from "./showperpage";

type Props = {
  handlePreviousClick?: () => void;
  handleNextClick?: () => void;
  currentPage: number;
  totalPages: number;
  options?: number[];
  onPerPageNumber?: (data: number) => void;
  perPage: number;
  setPerPage: Dispatch<SetStateAction<number>>;
  totalCount?: number;
};

const Pagination = ({
  handlePreviousClick,
  handleNextClick,
  currentPage,
  totalPages,
  options,
  onPerPageNumber,
  perPage,
  setPerPage,
  totalCount,
}: Props) => {
  const handleOptionChange = (value: number) => {
    setPerPage(value);
    onPerPageNumber?.(value);
  };

  const start = (currentPage - 1) * perPage + 1;
  const end = totalCount
    ? Math.min(currentPage * perPage, totalCount)
    : currentPage * perPage;

  return (
    <>
      {totalPages > 0 && (
        <div className="flex flex-col gap-3 border-t border-border/40 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            <strong className="text-foreground">{start}</strong> -{" "}
            <strong className="text-foreground">{end}</strong>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={currentPage > 1 ? handlePreviousClick : undefined}
                className="rounded-md border border-border p-2 disabled:opacity-50"
                disabled={currentPage <= 1}
              >
                <SlArrowLeft />
              </button>
              <p className="text-sm">
                <strong>{currentPage}</strong> / {totalPages}
              </p>
              <button
                type="button"
                onClick={currentPage < totalPages ? handleNextClick : undefined}
                className="rounded-md border border-border p-2 disabled:opacity-50"
                disabled={currentPage >= totalPages}
              >
                <SlArrowRight />
              </button>
            </div>
            <ShowPerPage
              options={options ?? [5, 10, 20, 50, 100]}
              selectedOption={perPage}
              onOptionChange={handleOptionChange}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Pagination;
