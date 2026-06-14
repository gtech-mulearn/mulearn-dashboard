import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  slNoClassName = "w-16",
}: TableHeadProps) => {
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
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onIconClick(column.column)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowUpDown className="size-3" />
                </Button>
              )}
            </div>
          </th>
        ))}
        {verify && (
          <th
            className={`border-b border-border px-3.5 py-3 text-center text-sm font-bold tracking-wider ${thClassName}`}
          >
            Verify
          </th>
        )}
        {action && (
          <th
            className={`border-b border-border px-3.5 py-3 text-center text-sm font-bold tracking-wider w-32 ${thClassName}`}
          >
            Action
          </th>
        )}
      </tr>
    </thead>
  );
};

export default THead;
