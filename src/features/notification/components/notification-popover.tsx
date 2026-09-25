"use client";

import { Bell, CheckCheck, ListChecks, Loader2, Trash2, X } from "lucide-react";
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
import {
  useDeleteAllPersonalNotifications,
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkManyNotificationsRead,
  useMarkNotificationRead,
  useNotificationFeed,
  useUnreadCount,
} from "../hooks";
import { NotificationList } from "./notification-list";

function NotificationSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton items
        <div key={i} className="rounded-lg border border-border p-3 space-y-2">
          <Skeleton className="h-3.5 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
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
  const unreadPersonalNotifications = notifications.filter(
    (n) => n.source === "personal" && !n.is_read,
  );
  const hasUnread = unreadCount > 0;
  const hasPersonalNotifications = notifications.some(
    (n) => n.source === "personal",
  );

  // IDs eligible for selection: only unread personal notifications
  // (broadcast notifications are not supported by the bulk-read endpoint)
  const selectableIds = unreadPersonalNotifications.map((n) => n.id);
  const allSelected =
    selectableIds.length > 0 &&
    selectableIds.every((id) => selectedIds.has(id));

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
          className="relative rounded-full shrink-0"
          size="icon"
          variant="ghost"
          aria-label={
            unreadCount > 0
              ? `${unreadCount} unread notifications`
              : "Notifications"
          }
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <Badge className="-right-1 -top-1 absolute h-5 w-5 items-center justify-center rounded-full border-transparent bg-destructive p-0 text-destructive-foreground text-xs">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        collisionPadding={16}
        className="w-[calc(100vw-2rem)] md:w-80 p-4 z-[70]"
      >
        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-3">
          {/* Left: title + subtitle */}
          <div className="flex flex-col gap-0.5">
            <h4 className="font-semibold leading-none">Notifications</h4>
            {unreadCount > 0 && (
              <span className="text-[11px] text-muted-foreground">
                {unreadCount} unread
              </span>
            )}
          </div>

          {/* Right: action buttons — never shrink */}
          <div className="flex shrink-0 items-center gap-1">
            {/* Select toggle — only when there are unread personal items */}
            {!isLoading &&
              !isError &&
              unreadPersonalNotifications.length > 0 && (
                <Button
                  id="notification-select-toggle"
                  size="sm"
                  variant={selectMode ? "secondary" : "ghost"}
                  className="h-7 px-2 text-xs gap-1.5"
                  onClick={() =>
                    selectMode ? exitSelectMode() : setSelectMode(true)
                  }
                  aria-label={
                    selectMode
                      ? "Cancel selection"
                      : "Select personal notifications"
                  }
                >
                  {selectMode ? (
                    <>
                      <X className="h-3 w-3" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <ListChecks className="h-3 w-3" />
                      Select
                    </>
                  )}
                </Button>
              )}

            {/* Mark all read — only in normal mode */}
            {!selectMode && hasUnread && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs gap-1.5"
                onClick={() => markAllRead()}
                disabled={isMarkingAll}
                aria-label="Mark all notifications as read"
              >
                {isMarkingAll ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <CheckCheck className="h-3 w-3" />
                )}
                Mark all read
              </Button>
            )}
          </div>
        </div>
        {/* ── Select-all row ── */}
        {selectMode && selectableIds.length > 0 && (
          <div className="flex items-center gap-2 mb-2 px-1">
            <Checkbox
              id="select-all-notifications"
              checked={allSelected}
              onCheckedChange={toggleSelectAll}
              aria-label={
                allSelected
                  ? "Deselect all personal notifications"
                  : "Select all unread personal notifications"
              }
            />
            <label
              htmlFor="select-all-notifications"
              className="text-xs text-muted-foreground cursor-pointer select-none"
            >
              {allSelected
                ? "Deselect all personal"
                : "Select all unread personal"}
            </label>
          </div>
        )}
        <Separator className="mb-3" />
        {/* ── Body ── */}
        {isLoading ? (
          <NotificationSkeleton />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
            <p className="text-sm text-center">
              Failed to load notifications.
              <br />
              Please try again.
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
            <p className="text-sm">You're all caught up!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[360px] pr-1">
            {notifications.map((item) => {
              const isSelectable =
                selectMode && item.source === "personal" && !item.is_read;
              return (
                <div
                  key={item.id}
                  className={selectMode ? "flex items-start gap-2" : undefined}
                >
                  {/* Checkbox column — keeps layout stable for read items */}
                  {selectMode && (
                    <div className="mt-3.5 h-4 w-4 shrink-0 flex items-center justify-center">
                      {isSelectable && (
                        <Checkbox
                          id={`select-notif-${item.id}`}
                          checked={selectedIds.has(item.id)}
                          onCheckedChange={() => toggleItem(item.id)}
                          aria-label={`Select: ${item.title}`}
                        />
                      )}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <NotificationList
                      items={[item]}
                      deletingId={deletingId}
                      markingReadId={markingReadId}
                      onDelete={selectMode ? undefined : handleDelete}
                      onMarkRead={selectMode ? undefined : handleMarkRead}
                    />
                  </div>
                </div>
              );
            })}

            {/* Load more button */}
            {hasNextPage && (
              <div className="pt-2 pb-1 text-center">
                <Button
                  id="notification-load-more-btn"
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-muted-foreground h-8 hover:text-foreground"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  aria-label="Load more notifications"
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      Loading more…
                    </>
                  ) : (
                    "Load more notifications"
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
        {/* ── Footer ── */}
        {!isLoading &&
          !isError &&
          (selectMode
            ? /* Multi-select action bar — appears only when ≥1 item is checked */
              selectedIds.size > 0 && (
                <>
                  <Separator className="mt-3 mb-2" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {selectedIds.size} selected
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        id="delete-selected-btn"
                        size="sm"
                        variant="ghost"
                        className="h-7 px-3 text-xs gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={handleDeleteSelected}
                        aria-label="Delete selected personal notifications"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                      <Button
                        id="mark-selected-read-btn"
                        size="sm"
                        variant="default"
                        className="h-7 px-3 text-xs gap-1.5"
                        onClick={handleMarkSelectedRead}
                        disabled={isMarkingMany}
                        aria-label="Mark selected personal notifications as read"
                      >
                        {isMarkingMany ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <CheckCheck className="h-3 w-3" />
                        )}
                        Mark as read
                      </Button>
                    </div>
                  </div>
                </>
              )
            : /* Normal footer: clear personal */
              hasPersonalNotifications && (
                <>
                  <Separator className="mt-3 mb-2" />
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs text-muted-foreground gap-1.5 hover:text-destructive"
                      onClick={() => deleteAllPersonal()}
                      disabled={isDeletingAll}
                      aria-label="Clear personal notifications"
                    >
                      {isDeletingAll ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                      Clear personal notifications
                    </Button>
                  </div>
                </>
              ))}
      </PopoverContent>
    </Popover>
  );
}
