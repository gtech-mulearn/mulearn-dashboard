"use client";

import { Pencil, Trash2 } from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { FaSort } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { ManageUserListItem } from "../schemas";

type TableHeader = {
  column: keyof Pick<
    ManageUserListItem,
    | "full_name"
    | "karma"
    | "muid"
    | "email"
    | "mobile"
    | "discord_id"
    | "level"
    | "created_at"
  >;
  label: string;
};

const manageUsersColumns: TableHeader[] = [
  { column: "full_name", label: "Full Name" },
  { column: "karma", label: "Total Karma" },
  { column: "muid", label: "Mu ID" },
  { column: "email", label: "Email" },
  { column: "mobile", label: "Mobile" },
  { column: "discord_id", label: "Discord ID" },
  { column: "level", label: "Level" },
  { column: "created_at", label: "Created On" },
];

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getCellValue(user: ManageUserListItem, column: TableHeader["column"]) {
  if (column === "created_at") return formatDate(user.created_at);
  const raw = user[column];
  return raw === null || raw === undefined || raw === "" ? "-" : String(raw);
}

interface ManageUsersTableProps {
  users: ManageUserListItem[];
  isLoading: boolean;
  pageIndex: number;
  perPage: number;
  onSort: (column: string) => void;
  onEdit: (id: string) => void;
  onEditHover: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ManageUsersTable({
  users,
  isLoading,
  pageIndex,
  perPage,
  onSort,
  onEdit,
  onEditHover,
  onDelete,
}: ManageUsersTableProps) {
  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [thumbWidth, setThumbWidth] = useState(0);
  const [thumbLeft, setThumbLeft] = useState(0);
  const userIdsKey = users.map((user) => user.id).join("|");
  const scrollResetKey = `${pageIndex}-${perPage}-${userIdsKey}`;

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
    if (!scrollResetKey) return;
    const el = tableContainerRef.current;
    if (!el) return;

    const raf = window.requestAnimationFrame(() => {
      if (!tableContainerRef.current) return;
      tableContainerRef.current.scrollLeft = 0;
      updateScrollIndicator();
    });

    return () => window.cancelAnimationFrame(raf);
  }, [scrollResetKey, updateScrollIndicator]);

  useEffect(() => {
    updateScrollIndicator();
    const onResize = () => updateScrollIndicator();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [updateScrollIndicator]);

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-border bg-card">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-1 rounded-xl border border-border bg-card text-center">
        <p className="font-semibold text-foreground">No users found</p>
        <p className="text-sm text-muted-foreground">
          Try adjusting your search or filters.
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        key={scrollResetKey}
        ref={tableContainerRef}
        onScroll={updateScrollIndicator}
        className="hidden max-w-full overflow-x-auto overflow-y-hidden rounded-xl border border-border bg-card text-[15px] text-foreground md:block"
      >
        <table className="w-full border-collapse whitespace-nowrap">
          <thead>
            <tr>
              <th className="border-b border-border px-3.5 py-3 text-left text-sm font-bold uppercase tracking-wider">
                S/N
              </th>
              {manageUsersColumns.map((column) => (
                <th
                  className="border-b border-border px-3.5 py-3 text-left text-sm font-bold tracking-wider"
                  key={column.column}
                >
                  <button
                    type="button"
                    className="flex w-full items-center gap-1.5 text-left"
                    onClick={() => onSort(column.column)}
                  >
                    {column.label}
                    <FaSort className="text-[12px]" />
                  </button>
                </th>
              ))}
              <th className="border-b border-border px-3.5 py-3 text-left text-sm font-bold tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id} className="odd:bg-muted even:bg-transparent">
                <td className="border-b border-border px-3.5 py-3 text-[15px]">
                  {(pageIndex - 1) * perPage + index + 1}
                </td>
                {manageUsersColumns.map((column) => (
                  <td
                    className="border-b border-border px-3.5 py-3 text-[15px]"
                    key={`${user.id}-${column.column}`}
                  >
                    {getCellValue(user, column.column)}
                  </td>
                ))}
                <td className="border-b border-border px-3.5 py-3 text-[15px]">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(user.id)}
                      onMouseEnter={() => onEditHover(user.id)}
                      onFocus={() => onEditHover(user.id)}
                      className="text-muted-foreground"
                    >
                      <Pencil className="size-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(user.id)}
                      className="text-muted-foreground"
                    >
                      <Trash2 className="size-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hasOverflow && (
        <div className="mt-2 hidden md:block">
          <div className="relative h-2 rounded-full bg-muted">
            <div
              className="absolute top-0 h-2 rounded-full bg-border"
              style={{
                width: `${thumbWidth}px`,
                transform: `translateX(${thumbLeft}px)`,
              }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 text-[15px] md:hidden">
        {users.map((user, index) => (
          <div
            key={user.id}
            className="rounded-xl border border-border/60 bg-card p-4 shadow-sm"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-[15px] text-muted-foreground">
                  #{(pageIndex - 1) * perPage + index + 1}
                </p>
                <p className="text-lg font-semibold text-foreground">
                  {user.full_name || "-"}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(user.id)}
                  onFocus={() => onEditHover(user.id)}
                  className="text-muted-foreground"
                >
                  <Pencil className="size-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(user.id)}
                  className="text-muted-foreground"
                >
                  <Trash2 className="size-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[15px]">
              {manageUsersColumns
                .filter((column) => column.column !== "full_name")
                .map((column) => (
                  <div key={`${user.id}-mobile-${column.column}`}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {column.label}
                    </p>
                    <p className="break-words text-foreground">
                      {getCellValue(user, column.column)}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
