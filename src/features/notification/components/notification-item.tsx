"use client";

import { formatDistanceToNow } from "date-fns";
import { Check, ExternalLink, Loader2, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  isSafeRedirectUrl,
  type NotificationItem as NotificationItemData,
} from "../schemas";

interface NotificationItemProps {
  item: NotificationItemData;
  isDeleting?: boolean;
  isMarkingRead?: boolean;
  onDelete?: (id: string) => void;
  onMarkRead?: (id: string) => void;
}

/**
 * Only allow relative paths and HTTPS URLs.
 * Returns null for any other scheme (javascript:, data:, http://, etc.)
 * so the link is hidden rather than rendered with an unsafe href.
 */
function sanitizeRedirectUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return isSafeRedirectUrl(url) ? url : null;
}

export function NotificationItem({
  item,
  isDeleting,
  isMarkingRead,
  onDelete,
  onMarkRead,
}: NotificationItemProps) {
  const isPending = isDeleting || isMarkingRead;
  const safeUrl = sanitizeRedirectUrl(item.redirect_url);
  const isExternal = safeUrl?.startsWith("https://") ?? false;

  return (
    // Non-interactive container — avoids nested interactive elements (button > button/a).
    // Mark-as-read is triggered by the ✓ icon button; the Link handles navigation.
    <div
      className={cn(
        "relative flex flex-col gap-1 rounded-lg border border-border p-3 text-sm transition-all",
        item.is_read ? "bg-card" : "bg-primary/5 border-primary/20",
        isPending && "pointer-events-none opacity-50",
      )}
    >
      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        {/* Left: unread dot + title */}
        <div className="flex min-w-0 items-center gap-1.5">
          {!item.is_read && (
            <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
          )}
          <p className="truncate font-medium leading-snug">{item.title}</p>
        </div>

        {/* Right: action buttons */}
        <div className="flex shrink-0 items-center gap-0.5">
          {!item.is_read && onMarkRead && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-muted-foreground hover:text-primary"
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
              className="h-5 w-5 text-muted-foreground hover:text-foreground"
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
      <p className="line-clamp-2 pl-3.5 text-xs leading-snug text-muted-foreground">
        {item.description}
      </p>

      {/* Footer: timestamp + link */}
      <div className="mt-1 flex items-center justify-between pl-3.5">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(item.created_at), {
              addSuffix: true,
            })}
          </span>
          {item.source === "broadcast" && (
            <span className="rounded bg-muted px-1.5 py-0.2 text-[10px] font-medium text-muted-foreground">
              Announcement
            </span>
          )}
        </div>

        {safeUrl && (
          <Link
            href={safeUrl}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
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
            <ExternalLink className="h-3 w-3" />
          </Link>
        )}
      </div>
    </div>
  );
}
