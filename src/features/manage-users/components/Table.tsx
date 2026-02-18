import type { FC, ReactElement, ReactNode } from "react";
import { useMemo, useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { HiOutlinePencil } from "react-icons/hi";
import { Spinner } from "@/components/ui/spinner";
import Modal from "./Modal";

export interface Data {
  [key: string]: string | number | boolean | null | undefined;
}

type TableProps = {
  rows: Data[];
  isloading?: boolean;
  children?: [ReactNode?, ReactNode?, ReactNode?];
  page: number;
  perPage: number;
  columnOrder: {
    column: string;
    Label: string;
    isSortable: boolean;
    wrap?: (data: string | ReactElement, id: string, row: Data) => ReactElement;
  }[];
  id?: string[];
  onEditClick?: (column: string | number | boolean) => void;
  onDeleteClick?: (column: string | undefined) => void;
  modalDeleteHeading?: string;
  modalDeleteContent?: string;
  modalTypeContent?: string;
};

function convertToTableData(dateString: unknown): string {
  if (dateString === null || dateString === undefined || dateString === "") {
    return "-";
  }
  if (typeof dateString === "boolean") return dateString ? "Yes" : "No";
  const str = String(dateString);
  const date = new Date(str);
  if (!Number.isNaN(date.getTime()) && str.includes("T")) {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  return str;
}

const Table: FC<TableProps> = (props) => {
  const [deleteRowId, setDeleteRowId] = useState<string | null>(null);
  const startIndex = (props.page - 1) * props.perPage;
  const actionIdColumn = props.id?.[0];

  const hasData = useMemo(() => props.rows.length > 0, [props.rows.length]);

  return (
    <>
      {props.isloading && (
        <div className="rounded-xl border border-border bg-card px-3 py-10 text-center md:hidden">
          <Spinner className="mx-auto size-7 text-primary" />
        </div>
      )}

      <div className="hidden overflow-x-auto rounded-xl border border-border bg-card md:block">
        <table className="w-full border-collapse whitespace-nowrap">
          {props.children?.[0]}
          {props.isloading ? (
            <tbody>
              <tr>
                <td
                  colSpan={props.columnOrder.length + 2}
                  className="px-3 py-10 text-center"
                >
                  <Spinner className="mx-auto size-7 text-primary" />
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {props.rows.map((rowData, index) => (
                <tr
                  key={`${rowData.id ?? index}`}
                  className="odd:bg-muted even:bg-transparent"
                >
                  <td className="border-b border-border px-3.5 py-3">
                    {startIndex + index + 1}
                  </td>
                  {props.columnOrder.map((column) => (
                    <td
                      className="border-b border-border px-3.5 py-3"
                      key={column.column}
                    >
                      {column.wrap
                        ? column.wrap(
                            convertToTableData(rowData[column.column]),
                            String(rowData.id ?? ""),
                            rowData,
                          )
                        : convertToTableData(rowData[column.column])}
                    </td>
                  ))}
                  {props.id?.map((column) => (
                    <td
                      className="border-b border-border px-3.5 py-3"
                      key={column}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {props.onEditClick && (
                          <button
                            type="button"
                            className="rounded-md p-2 text-muted-foreground hover:bg-muted"
                            onClick={() =>
                              props.onEditClick?.(rowData[column] ?? "")
                            }
                          >
                            <HiOutlinePencil />
                          </button>
                        )}
                        {props.onDeleteClick && (
                          <button
                            type="button"
                            className="rounded-md p-2 text-muted-foreground hover:bg-muted"
                            onClick={() =>
                              setDeleteRowId(String(rowData[column] ?? ""))
                            }
                          >
                            <AiOutlineDelete />
                          </button>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {!props.isloading && hasData && (
        <div className="space-y-3 md:hidden">
          {props.rows.map((rowData, index) => (
            <div
              key={`${rowData.id ?? index}`}
              className="rounded-xl border border-border/60 bg-card p-4 shadow-sm"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">
                    #{startIndex + index + 1}
                  </p>
                  <p className="text-base font-semibold text-foreground">
                    {convertToTableData(rowData.full_name)}
                  </p>
                </div>
                {actionIdColumn && (
                  <div className="flex items-center gap-1">
                    {props.onEditClick && (
                      <button
                        type="button"
                        className="rounded-md p-2 text-muted-foreground hover:bg-muted"
                        onClick={() =>
                          props.onEditClick?.(rowData[actionIdColumn] ?? "")
                        }
                      >
                        <HiOutlinePencil />
                      </button>
                    )}
                    {props.onDeleteClick && (
                      <button
                        type="button"
                        className="rounded-md p-2 text-muted-foreground hover:bg-muted"
                        onClick={() =>
                          setDeleteRowId(String(rowData[actionIdColumn] ?? ""))
                        }
                      >
                        <AiOutlineDelete />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                {props.columnOrder
                  .filter((column) => column.column !== "full_name")
                  .map((column) => (
                    <div key={`mobile-${rowData.id ?? index}-${column.column}`}>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {column.Label}
                      </p>
                      <p className="break-words text-sm text-foreground">
                        {convertToTableData(rowData[column.column])}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!props.isloading && !hasData && (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          No data to display
        </div>
      )}

      {!props.isloading && hasData && (
        <div className="mt-4">{props.children?.[1]}</div>
      )}

      <Modal
        isOpen={Boolean(deleteRowId)}
        setIsOpen={(value) => {
          if (!value) setDeleteRowId(null);
        }}
        id={deleteRowId ?? ""}
        heading={props.modalDeleteHeading ?? "Delete"}
        content={props.modalDeleteContent ?? "Are you sure you want to delete?"}
        type={props.modalTypeContent ?? "error"}
        click={async (id) => props.onDeleteClick?.(String(id))}
      />
    </>
  );
};

export default Table;
