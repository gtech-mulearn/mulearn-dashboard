"use client";
import { Copy, TrendingUp } from "lucide-react";
import type { FC, ReactElement, ReactNode } from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { HiOutlinePencil } from "react-icons/hi";
import Loader from "@/app/loading";
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
    width?: string;
    wrap?: (data: string | ReactElement, id: string, row: Data) => ReactElement;
  }[];
  id?: string[];
  onEditClick?: (column: string | number | boolean) => void;
  onDeleteClick?: (column: string | undefined) => void;
  onVerifyClick?: (column: string | number | boolean) => void;
  onCopyClick?: (column: string | number | boolean) => void;
  analytics?: (column: string | number | boolean) => void;
  modalVerifyHeading?: string;
  modalVerifyContent?: string;
  modalDeleteHeading?: string;
  modalDeleteContent?: string;
  modalTypeContent?: string;
  customCellRender?: (column: string, row: Data) => ReactElement | null;
  slNoCellClassName?: string;
  customActionRender?: (row: Data) => ReactElement | null;
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
  const [verifyRowId, setVerifyRowId] = useState<string | null>(null);
  const [verifyRowTitle, setVerifyRowTitle] = useState<string>("");
  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [thumbWidth, setThumbWidth] = useState(0);
  const [thumbLeft, setThumbLeft] = useState(0);
  const startIndex = (props.page - 1) * props.perPage;
  const actionIdColumn = props.id?.[0];
  const rowIdsKey = props.rows.map((row) => String(row.id ?? "")).join("|");
  const scrollResetKey = `${props.page}-${props.perPage}-${rowIdsKey}`;

  const hasData = useMemo(() => props.rows.length > 0, [props.rows.length]);

  const updateScrollIndicator = useCallback(() => {
    const el = tableContainerRef.current;
    if (!el) return;

    const { scrollWidth, clientWidth, scrollLeft } = el;
    const overflow = scrollWidth > clientWidth + 1;
    setHasOverflow(overflow);

    if (!overflow) {
      setThumbWidth(0);
      setThumbLeft(0);
      return;
    }

    const nextThumbWidth = Math.max(
      (clientWidth / scrollWidth) * clientWidth,
      56,
    );
    const maxThumbLeft = clientWidth - nextThumbWidth;
    const maxScrollLeft = scrollWidth - clientWidth;
    const nextThumbLeft =
      maxScrollLeft <= 0 ? 0 : (scrollLeft / maxScrollLeft) * maxThumbLeft;

    setThumbWidth(nextThumbWidth);
    setThumbLeft(nextThumbLeft);
  }, []);

  useLayoutEffect(() => {
    if (!scrollResetKey) return;
    const el = tableContainerRef.current;
    if (!el) return;
    el.scrollLeft = 0;
    updateScrollIndicator();
  }, [scrollResetKey, updateScrollIndicator]);

  useEffect(() => {
    updateScrollIndicator();
    const onResize = () => updateScrollIndicator();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [updateScrollIndicator]);

  const openVerify = (id: string | number | boolean, row: Data) => {
    setVerifyRowId(String(id));
    setVerifyRowTitle(
      String(
        row.full_name ??
          row.name ??
          row.title ??
          props.modalVerifyHeading ??
          "Verify",
      ),
    );
  };

  return (
    <>
      {props.isloading && (
        <div className="rounded-xl border border-border bg-card px-3 py-10 text-center md:hidden">
          <Loader />
        </div>
      )}

      <div
        ref={tableContainerRef}
        onScroll={updateScrollIndicator}
        className="hidden overflow-x-auto overflow-y-hidden rounded-xl border border-border bg-card md:block"
      >
        <table className="w-full border-collapse table-fixed">
          {props.children?.[0]}
          {props.isloading ? (
            <tbody>
              <tr>
                <td
                  colSpan={props.columnOrder.length + 2}
                  className="px-3 py-10 text-center"
                >
                  <Loader />
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {props.rows.map((rowData, index) => (
                <tr
                  key={`${rowData.id ?? index}`}
                  className="odd:bg-muted/70 even:bg-transparent"
                >
                  <td
                    className={`border-b border-border px-3.5 py-3 w-16 ${props.slNoCellClassName ?? ""}`}
                  >
                    {startIndex + index + 1}
                  </td>
                  {props.columnOrder.map((column) => (
                    <td
                      className={`border-b border-border px-3.5 py-3 break-words ${column.width || ""}`}
                      key={column.column}
                    >
                      {(() => {
                        const customRendered = props.customCellRender?.(
                          column.column,
                          rowData,
                        );
                        if (customRendered) return customRendered;
                        return column.wrap
                          ? column.wrap(
                              convertToTableData(rowData[column.column]),
                              String(rowData.id ?? ""),
                              rowData,
                            )
                          : convertToTableData(rowData[column.column]);
                      })()}
                    </td>
                  ))}
                  {props.id?.map((column) => (
                    <td
                      className="border-b border-border px-3.5 py-3 w-32"
                      key={column}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {props.customActionRender ? (
                          props.customActionRender(rowData)
                        ) : (
                          <>
                            {props.analytics && (
                              <button
                                type="button"
                                className="rounded-md p-2 text-muted-foreground hover:bg-muted"
                                onClick={() =>
                                  props.analytics?.(rowData[column] ?? "")
                                }
                              >
                                <TrendingUp className="size-4" />
                              </button>
                            )}
                            {props.onCopyClick && (
                              <button
                                type="button"
                                className="rounded-md p-2 text-muted-foreground hover:bg-muted"
                                onClick={() =>
                                  props.onCopyClick?.(rowData[column] ?? "")
                                }
                              >
                                <Copy className="size-4" />
                              </button>
                            )}
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
                            {props.onVerifyClick && (
                              <button
                                type="button"
                                className="rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-muted"
                                onClick={() =>
                                  openVerify(rowData[column] ?? "", rowData)
                                }
                              >
                                Verify
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
                          </>
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
      {hasOverflow && (
        <div className="mt-3 hidden md:block">
          <div className="relative h-2 rounded-full bg-border">
            <div
              className="absolute top-0 h-2 rounded-full bg-muted-foreground/40"
              style={{
                width: `${thumbWidth}px`,
                transform: `translateX(${thumbLeft}px)`,
              }}
            />
          </div>
        </div>
      )}

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
                    {props.customActionRender ? (
                      props.customActionRender(rowData)
                    ) : (
                      <>
                        {props.analytics && (
                          <button
                            type="button"
                            className="rounded-md p-2 text-muted-foreground hover:bg-muted"
                            onClick={() =>
                              props.analytics?.(rowData[actionIdColumn] ?? "")
                            }
                          >
                            <TrendingUp className="size-4" />
                          </button>
                        )}
                        {props.onCopyClick && (
                          <button
                            type="button"
                            className="rounded-md p-2 text-muted-foreground hover:bg-muted"
                            onClick={() =>
                              props.onCopyClick?.(rowData[actionIdColumn] ?? "")
                            }
                          >
                            <Copy className="size-4" />
                          </button>
                        )}
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
                        {props.onVerifyClick && (
                          <button
                            type="button"
                            className="rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-muted"
                            onClick={() =>
                              openVerify(rowData[actionIdColumn] ?? "", rowData)
                            }
                          >
                            Verify
                          </button>
                        )}
                        {props.onDeleteClick && (
                          <button
                            type="button"
                            className="rounded-md p-2 text-muted-foreground hover:bg-muted"
                            onClick={() =>
                              setDeleteRowId(
                                String(rowData[actionIdColumn] ?? ""),
                              )
                            }
                          >
                            <AiOutlineDelete />
                          </button>
                        )}
                      </>
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
                      <div className="break-words text-sm text-foreground">
                        {(() => {
                          const customRendered = props.customCellRender?.(
                            column.column,
                            rowData,
                          );
                          if (customRendered) return customRendered;
                          return column.wrap
                            ? column.wrap(
                                convertToTableData(rowData[column.column]),
                                String(rowData.id ?? ""),
                                rowData,
                              )
                            : convertToTableData(rowData[column.column]);
                        })()}
                      </div>
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
        isOpen={Boolean(verifyRowId)}
        setIsOpen={(value) => {
          if (!value) setVerifyRowId(null);
        }}
        id={verifyRowId ?? ""}
        heading={props.modalVerifyHeading ?? verifyRowTitle}
        content={props.modalVerifyContent ?? "Are you sure you want to verify?"}
        type="success"
        click={async (id) => props.onVerifyClick?.(id)}
      />

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
