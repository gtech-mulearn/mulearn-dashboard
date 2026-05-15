import { ChevronDown, ChevronUp } from "lucide-react";
import type { FC } from "react";

type Column = {
  column: string;
  Label: string;
  isSortable: boolean;
  width?: string;
};

interface TableHeadProps {
  columnOrder: Column[];
  onIconClick: (column: string) => void;
  action: boolean;
  verify?: boolean;
  thClassName?: string;
  slNoClassName?: string;
  currentSort?: string;
}

const THead: FC<TableHeadProps> = ({
  columnOrder,
  onIconClick,
  action,
  verify = false,
  thClassName = "",
  slNoClassName = "w-16",
  currentSort = "",
}) => {
  const getSortIcon = (columnName: string) => {
    const isDescending = currentSort.startsWith("-");
    const sortedColumn = isDescending ? currentSort.slice(1) : currentSort;

    const isThisColumnSorted = sortedColumn === columnName;

    const baseClass = "h-4 w-4 transition-opacity";

    if (isThisColumnSorted) {
      return isDescending ? (
        <ChevronDown className={`${baseClass} text-primary opacity-100`} />
      ) : (
        <ChevronUp className={`${baseClass} text-primary opacity-100`} />
      );
    }

    // Not sorted: icon hidden by default, visible on hover via group
    return (
      <ChevronUp className={`${baseClass} opacity-0 group-hover:opacity-40`} />
    );
  };

  return (
    <thead>
      <tr>
        <th
          className={`border-b border-border px-3.5 py-3 text-left text-sm font-bold uppercase tracking-wider ${slNoClassName} ${thClassName}`}
        >
          Sl.no
        </th>
        {columnOrder.map((column) => (
          <th
            className={`border-b border-border px-3.5 py-3 text-left text-sm font-bold tracking-wider ${column.width || ""} ${thClassName}`}
            key={column.column}
          >
            <div className="flex items-center gap-2">
              <span>{column.Label}</span>
              {column.isSortable && (
                <button
                  type="button"
                  onClick={() => onIconClick(column.column)}
                  className="group inline-flex items-center justify-center p-1 rounded hover:bg-muted transition-colors"
                  title={`Sort by ${column.Label}`}
                >
                  {getSortIcon(column.column)}
                </button>
              )}
            </div>
          </th>
        ))}
        {verify && (
          <th className="border-b border-border px-3.5 py-3 text-left text-sm font-bold tracking-wider">
            Verify
          </th>
        )}
        {action && (
          <th className="border-b border-border px-3.5 py-3 text-left text-sm font-bold tracking-wider w-32">
            Action
          </th>
        )}
      </tr>
    </thead>
  );
};

export default THead;
