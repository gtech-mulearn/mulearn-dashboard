"use client";

import { formatDistanceToNow } from "date-fns";
import { Check, ExternalLink, Loader2, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { resolveNotificationHref } from "../lib/notification-href";
import type { NotificationItem as NotificationItemData } from "../schemas";

interface NotificationItemProps {
  item: NotificationItemData;
  isDeleting?: boolean;
  isMarkingRead?: boolean;
  onDelete?: (id: string) => void;
  onMarkRead?: (id: string) => void;
}

export function NotificationItem({
  item,
  isDeleting,
  isMarkingRead,
  onDelete,
  onMarkRead,
}: NotificationItemProps) {
  const isPending = isDeleting || isMarkingRead;
  // Typed notifications link by entity; legacy ones by redirect_url (only
  // relative or https, same-origin URLs kept in-app).
  const link = resolveNotificationHref(
    item,
    typeof window === "undefined" ? "" : window.location.origin,
  );
  const isExternal = link?.external ?? false;

  return (
    // Non-interactive container — avoids nested interactive elements (button > button/a).
    // Mark-as-read is triggered by the ✓ icon button; the Link handles navigation.
    <div
      className={cn(
        "group relative flex flex-col gap-2 overflow-hidden rounded-xl border p-3 text-sm transition-all",
        item.is_read
          ? "border-border/70 bg-card hover:border-brand-blue/30 hover:shadow-sm"
          : "border-brand-blue/20 bg-brand-blue/[0.04] shadow-sm",
        isPending && "pointer-events-none opacity-50",
      )}
    >
      {!item.is_read && (
        <span className="absolute inset-y-0 left-0 w-1 bg-linear-to-b from-brand-blue to-brand-purple" />
      )}
      {isPending && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-card/60">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        {/* Left: unread dot + title */}
        <div className="flex min-w-0 items-center gap-2">
          {!item.is_read && (
            <span className="h-2 w-2 shrink-0 rounded-full bg-brand-blue shadow-[0_0_0_3px_rgba(46,133,254,0.12)]" />
          )}
          <p className="truncate font-semibold leading-snug tracking-[-0.01em]">
            {item.title}
          </p>
        </div>

        {/* Right: action buttons */}
        <div className="flex shrink-0 items-center gap-0.5">
          {!item.is_read && onMarkRead && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-muted-foreground hover:bg-brand-blue/10 hover:text-brand-blue"
              onClick={() => onMarkRead(item.id)}
              disabled={isPending}
              aria-label="Mark as read"
              title="Mark as read"
            >
              <Check className="h-3 w-3" />
            </Button>
          )}

          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onDelete(item.id)}
              disabled={isPending}
              aria-label="Delete notification"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Body */}
      <p className="line-clamp-2 pl-4 text-xs leading-relaxed text-muted-foreground">
        {item.description}
      </p>

      {/* Footer: timestamp + link */}
      <div className="mt-1 flex items-center justify-between gap-3 pl-4">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-muted-foreground">
            {formatDistanceToNow(new Date(item.created_at), {
              addSuffix: true,
            })}
          </span>
          {item.source === "broadcast" && (
            <span className="rounded-full bg-brand-purple/10 px-2 py-0.5 text-[10px] font-semibold text-brand-purple">
              Announcement
            </span>
          )}
        </div>

        {link && (
          <Link
            href={link.href}
            className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-brand-blue transition-colors hover:bg-brand-blue/10"
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            onClick={() => {
              // Mark as read when navigating via the link
              if (!item.is_read && onMarkRead) {
                onMarkRead(item.id);
              }
            }}
          >
            View
            {isExternal && <ExternalLink className="h-3 w-3" />}
          </Link>
        )}
      </div>
    </div>
  );
}
