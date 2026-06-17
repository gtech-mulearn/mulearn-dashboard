"use client";

import { Inbox } from "lucide-react";
import type { BroadcastNotification, DirectNotification } from "../schemas";
import { NotificationItem } from "./notification-item";

interface DirectListProps {
  type: "direct";
  items: DirectNotification[];
  onDelete: (id: string) => void;
  deletingId?: string;
  emptyLabel?: string;
}

interface BroadcastListProps {
  type: "broadcast";
  items: BroadcastNotification[];
  onDelete?: never;
  deletingId?: never;
  emptyLabel?: string;
}

type NotificationListProps = DirectListProps | BroadcastListProps;

export function NotificationList({
  type,
  items,
  onDelete,
  deletingId,
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
          id={item.id}
          title={item.title}
          description={item.description}
          created_at={item.created_at}
          url={item.url}
          button={"button" in item ? item.button : undefined}
          type={type}
          onDelete={type === "direct" ? onDelete : undefined}
          isDeleting={deletingId === item.id}
        />
      ))}
    </div>
  );
}
