import { ArrowUpDown } from "lucide-react";

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
}

const THead = ({
  columnOrder,
  onIconClick,
  action,
  verify = false,
  thClassName = "",
  slNoClassName = "w-20",
}: TableHeadProps) => {
  return (
    <thead>
      <tr>
        <th
          className={`border-b border-border px-4 py-3 text-left text-base font-bold uppercase tracking-wider ${slNoClassName} ${thClassName}`}
        >
          Sl.no
        </th>
        {columnOrder.map((column) => (
          <th
            className={`border-b border-border px-4 py-3 text-left text-base font-bold tracking-wider ${column.width || ""} ${thClassName}`}
            key={column.column}
          >
            <div className="flex items-center gap-2">
              <span>{column.Label}</span>
              {column.isSortable && (
                <button
                  type="button"
                  onClick={() => onIconClick(column.column)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowUpDown className="size-3" />
                </button>
              )}
            </div>
          </th>
        ))}
        {verify && (
          <th className="border-b border-border px-4 py-3 text-left text-base font-bold tracking-wider">
            Verify
          </th>
        )}
        {action && (
          <th className="border-b border-border px-4 py-3 text-left text-base font-bold tracking-wider w-32">
            Action
          </th>
        )}
      </tr>
    </thead>
  );
};

export default THead;
