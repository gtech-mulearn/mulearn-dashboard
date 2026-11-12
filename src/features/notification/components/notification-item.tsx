"use client";

import { format, formatDistanceToNow } from "date-fns";
import { Check, ExternalLink, X } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { resolveNotificationHref } from "../lib/notification-href";
import type { NotificationItem as NotificationItemData } from "../schemas";

interface NotificationItemProps {
  item: NotificationItemData;
  isDeleting?: boolean;
  isMarkingRead?: boolean;
  onDelete?: (id: string) => void;
  onMarkRead?: (id: string) => void;
  /** When set, the leading gutter shows a checkbox instead of the unread dot. */
  selection?: { checked: boolean; onToggle: () => void };
}

export function NotificationItem({
  item,
  isDeleting,
  isMarkingRead,
  onDelete,
  onMarkRead,
  selection,
}: NotificationItemProps) {
  const isPending = isDeleting || isMarkingRead;
  // Typed notifications link by entity; legacy ones by redirect_url (only
  // relative or https, same-origin URLs kept in-app).
  const link = resolveNotificationHref(
    item,
    typeof window === "undefined" ? "" : window.location.origin,
  );
  const isExternal = link?.external ?? false;
  const createdAt = new Date(item.created_at);
  const markRead = item.is_read ? undefined : onMarkRead;

  return (
    // Non-interactive container — avoids nested interactive elements (button > button/a).
    <div
      className={cn(
        "group flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50",
        isPending && "pointer-events-none opacity-60",
      )}
      aria-busy={isPending || undefined}
    >
      {/* Leading gutter: fixed width keeps every title on the same column */}
      <div className="flex h-5 w-4 shrink-0 items-center justify-center">
        {selection ? (
          <Checkbox
            id={`select-notif-${item.id}`}
            checked={selection.checked}
            onCheckedChange={selection.onToggle}
            aria-label={`Select: ${item.title}`}
          />
        ) : (
          !item.is_read && (
            <span className="size-2 rounded-full bg-brand-blue">
              <span className="sr-only">Unread</span>
            </span>
          )
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p
            className={cn(
              "min-w-0 flex-1 break-words text-sm text-foreground line-clamp-2",
              item.is_read ? "font-medium" : "font-semibold",
            )}
          >
            {item.title}
          </p>

          {isPending ? (
            <Spinner className="mt-0.5 shrink-0 text-muted-foreground" />
          ) : (
            (markRead || onDelete) && (
              // Revealed on hover/focus where hover exists; always shown on touch.
              <div className="-my-1.5 -mr-2 flex shrink-0 items-center transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                {markRead && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:bg-muted hover:text-foreground"
                    onClick={() => markRead(item.id)}
                    aria-label="Mark as read"
                    title="Mark as read"
                  >
                    <Check />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:bg-muted hover:text-foreground"
                    onClick={() => onDelete(item.id)}
                    aria-label="Delete notification"
                    title="Delete"
                  >
                    <X />
                  </Button>
                )}
              </div>
            )
          )}
        </div>

        {item.description && (
          <p className="mt-0.5 break-words text-xs text-muted-foreground line-clamp-2">
            {item.description}
          </p>
        )}

        <div className="mt-2 flex items-center gap-2">
          <time
            dateTime={item.created_at}
            title={format(createdAt, "PPpp")}
            className="text-xs text-muted-foreground"
          >
            {formatDistanceToNow(createdAt, { addSuffix: true })}
          </time>
          {item.source === "broadcast" && (
            <Badge variant="purple">Announcement</Badge>
          )}

          {link && (
            <Button
              asChild
              variant="link"
              size="sm"
              className="ml-auto h-auto gap-1 p-0 text-xs has-[>svg]:px-0"
            >
              <Link
                href={link.href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                // Mark as read when navigating via the link
                onClick={() => markRead?.(item.id)}
              >
                View
                {isExternal && <ExternalLink className="size-3" />}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
