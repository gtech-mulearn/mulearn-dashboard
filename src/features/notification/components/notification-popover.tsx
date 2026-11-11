"use client";

import { Bell, ListChecks, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  useDeleteAllPersonalNotifications,
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkManyNotificationsRead,
  useMarkNotificationRead,
  useNotificationFeed,
  useUnreadCount,
} from "../hooks";
import { NotificationItem } from "./notification-item";

const HEADING_ID = "notification-popover-heading";

function NotificationSkeleton() {
  return (
    <ul className="divide-y divide-border" aria-hidden="true">
      {["one", "two", "three"].map((id) => (
        <li key={id} className="flex gap-3 px-4 py-3">
          <div className="flex h-5 w-4 shrink-0 items-center justify-center">
            <Skeleton className="size-2 rounded-full" />
          </div>
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-20" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function NotificationPopover() {
  const [open, setOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | undefined>(undefined);
  const [markingReadId, setMarkingReadId] = useState<string | undefined>(
    undefined,
  );

  // multi-select state
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Badge: always alive while topbar is mounted (polls every 60s)
  const { data: unreadCount = 0 } = useUnreadCount();

  // Feed: only fetch when the popover is open
  const {
    data: feedData,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useNotificationFeed(open);

  const { mutate: markOneRead } = useMarkNotificationRead();
  const { mutate: markAllRead, isPending: isMarkingAll } =
    useMarkAllNotificationsRead();
  const { mutate: markManyRead, isPending: isMarkingMany } =
    useMarkManyNotificationsRead();
  const { mutate: deleteOne } = useDeleteNotification();
  const { mutate: deleteAllPersonal, isPending: isDeletingAll } =
    useDeleteAllPersonalNotifications();

  const notifications = useMemo(
    () => feedData?.pages.flatMap((page) => page.results) ?? [],
    [feedData],
  );
  const hasUnread = unreadCount > 0;
  const hasPersonalNotifications = notifications.some(
    (n) => n.source === "personal",
  );

  // IDs eligible for selection: only unread personal notifications
  // (broadcast notifications are not supported by the bulk-read endpoint)
  const selectableIds = notifications
    .filter((n) => n.source === "personal" && !n.is_read)
    .map((n) => n.id);
  const allSelected =
    selectableIds.length > 0 &&
    selectableIds.every((id) => selectedIds.has(id));

  const isReady = !isLoading && !isError;
  const canSelect = isReady && selectableIds.length > 0;
  const showFooter =
    isReady && (selectMode || canSelect || hasPersonalNotifications);

  function exitSelectMode() {
    setSelectMode(false);
    setSelectedIds(new Set());
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) exitSelectMode();
  }

  function toggleSelectAll() {
    setSelectedIds(allSelected ? new Set() : new Set(selectableIds));
  }

  function toggleItem(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleMarkRead(id: string) {
    setMarkingReadId(id);
    markOneRead(id, { onSettled: () => setMarkingReadId(undefined) });
  }

  function handleDelete(id: string) {
    setDeletingId(id);
    deleteOne(id, { onSettled: () => setDeletingId(undefined) });
  }

  function handleMarkSelectedRead() {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    markManyRead(ids, { onSettled: exitSelectMode });
  }

  function handleDeleteSelected() {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    // No bulk-delete endpoint — fire individual deletes for personal notifications
    for (const id of ids) {
      deleteOne(id);
    }
    exitSelectMode();
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          id="notification-bell-button"
          className="relative shrink-0 rounded-full"
          size="icon"
          variant="ghost"
          // The count covers personal notifications only (not broadcasts).
          aria-label={
            unreadCount > 0
              ? `${unreadCount} unread personal notifications`
              : "Notifications"
          }
          title={
            unreadCount > 0 ? "Unread personal notifications" : "Notifications"
          }
        >
          <Bell className="h-[18px] w-[18px] text-muted-foreground" />
          {unreadCount > 0 && (
            <Badge className="-right-0.5 -top-0.5 absolute h-[18px] min-w-[18px] items-center justify-center border-2 border-background bg-brand-blue px-1 text-[10px] font-bold text-white shadow-sm">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={10}
        collisionPadding={16}
        aria-labelledby={HEADING_ID}
        className="z-[70] w-[calc(100vw-2rem)] overflow-hidden p-0 sm:w-96"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <h2 id={HEADING_ID} className="text-sm font-semibold">
              Notifications
            </h2>
            {hasUnread && (
              <span className="text-xs text-muted-foreground">
                {unreadCount} unread
              </span>
            )}
          </div>

          {!selectMode && hasUnread && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllRead()}
              disabled={isMarkingAll}
            >
              {isMarkingAll && <Spinner />}
              Mark all as read
            </Button>
          )}
        </div>

        <Separator />

        {/* ── Select-all bar ── */}
        {selectMode && selectableIds.length > 0 && (
          <>
            <div className="flex items-center gap-3 bg-muted/50 px-4 py-2.5">
              <div className="flex w-4 shrink-0 justify-center">
                <Checkbox
                  id="select-all-notifications"
                  checked={allSelected}
                  onCheckedChange={toggleSelectAll}
                />
              </div>
              <label
                htmlFor="select-all-notifications"
                className="cursor-pointer select-none text-xs font-medium text-muted-foreground"
              >
                Select all unread
              </label>
              <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                {selectedIds.size} selected
              </span>
            </div>
            <Separator />
          </>
        )}

        {/* ── Body ── */}
        <div className="max-h-96 overflow-y-auto overscroll-contain">
          {isLoading ? (
            <NotificationSkeleton />
          ) : isError ? (
            <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                We couldn&apos;t load your notifications.
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Try again
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-10 text-center">
              <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted">
                <Bell className="size-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">
                You&apos;re all caught up
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                New notifications will show up here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {notifications.map((item) => {
                const isSelectable =
                  selectMode && item.source === "personal" && !item.is_read;
                return (
                  <li key={item.id}>
                    <NotificationItem
                      item={item}
                      isDeleting={deletingId === item.id}
                      isMarkingRead={markingReadId === item.id}
                      onDelete={selectMode ? undefined : handleDelete}
                      onMarkRead={selectMode ? undefined : handleMarkRead}
                      selection={
                        isSelectable
                          ? {
                              checked: selectedIds.has(item.id),
                              onToggle: () => toggleItem(item.id),
                            }
                          : undefined
                      }
                    />
                  </li>
                );
              })}

              {hasNextPage && (
                <li className="px-4 py-3">
                  <Button
                    id="notification-load-more-btn"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage && <Spinner />}
                    {isFetchingNextPage ? "Loading…" : "Load more"}
                  </Button>
                </li>
              )}
            </ul>
          )}
        </div>

        {/* ── Footer ── */}
        {showFooter && (
          <>
            <Separator />
            <div className="flex items-center justify-between gap-2 px-4 py-3">
              {selectMode ? (
                <>
                  <Button variant="outline" size="sm" onClick={exitSelectMode}>
                    Cancel
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button
                      id="delete-selected-btn"
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteSelected}
                      disabled={selectedIds.size === 0}
                    >
                      Delete
                    </Button>
                    <Button
                      id="mark-selected-read-btn"
                      size="sm"
                      onClick={handleMarkSelectedRead}
                      disabled={selectedIds.size === 0 || isMarkingMany}
                    >
                      {isMarkingMany && <Spinner />}
                      Mark as read
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {canSelect ? (
                    <Button
                      id="notification-select-toggle"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectMode(true)}
                    >
                      <ListChecks />
                      Select
                    </Button>
                  ) : (
                    <span />
                  )}
                  {hasPersonalNotifications && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteAllPersonal()}
                      disabled={isDeletingAll}
                    >
                      {isDeletingAll ? <Spinner /> : <Trash2 />}
                      Clear all
                    </Button>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
