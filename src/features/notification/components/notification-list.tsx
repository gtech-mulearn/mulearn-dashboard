"use client";

import { Inbox } from "lucide-react";
import type { NotificationItem as NotificationItemType } from "../schemas";
import { NotificationItem } from "./notification-item";

interface NotificationListProps {
  items: NotificationItemType[];
  deletingId?: string;
  markingReadId?: string;
  onDelete?: (id: string) => void;
  onMarkRead?: (id: string) => void;
  emptyLabel?: string;
}

export function NotificationList({
  items,
  deletingId,
  markingReadId,
  onDelete,
  onMarkRead,
  emptyLabel = "No notifications",
}: NotificationListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
        <Inbox className="h-8 w-8" />
        <p className="text-sm">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 overflow-y-auto max-h-[360px] pr-1">
      {items.map((item) => (
        <NotificationItem
          key={item.id}
          item={item}
          isDeleting={deletingId === item.id}
          isMarkingRead={markingReadId === item.id}
          onDelete={onDelete}
          onMarkRead={onMarkRead}
        />
      ))}
    </div>
  );
}
