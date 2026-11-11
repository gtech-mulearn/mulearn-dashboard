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
    <div className="flex flex-col gap-3">
      {["one", "two", "three"].map((id) => (
        <div
          key={id}
          className="space-y-3 rounded-xl border border-border/60 bg-muted/30 p-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
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
        className="z-[70] w-[calc(100vw-2rem)] overflow-hidden rounded-xl border-border/80 bg-card p-0 shadow-lg md:w-[380px]"
      >
        {/* ── Header ── */}
        <div className="px-4 pb-3 pt-4">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex flex-col gap-0.5">
              <h4 className="text-base font-semibold leading-tight">
                Notifications
              </h4>
              {unreadCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {unreadCount} unread
                </span>
              )}
            </div>

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
        <Separator className="mx-4 mb-3 w-auto" />
        {/* ── Body ── */}
        <div className="px-4 pb-4">
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
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Bell className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium">You&apos;re all caught up!</p>
              <p className="text-xs text-muted-foreground/80">
                No new updates for now.
              </p>
            </div>
          ) : (
            <div className="flex max-h-[380px] flex-col gap-3 overflow-y-auto pr-1">
              {notifications.map((item) => {
                const isSelectable =
                  selectMode && item.source === "personal" && !item.is_read;
                return (
                  <div
                    key={item.id}
                    className={
                      selectMode ? "flex items-start gap-2" : undefined
                    }
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
                    <Separator className="mb-3 mt-4" />
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
                    <Separator className="mb-3 mt-4" />
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
        </div>
      </PopoverContent>
    </Popover>
  );
}
