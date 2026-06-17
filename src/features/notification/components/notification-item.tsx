"use client";

import { formatDistanceToNow } from "date-fns";
import { ExternalLink, Loader2, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  id: string;
  title: string;
  description: string;
  created_at: string;
  url?: string | null;
  button?: string | null;
  type: "direct" | "broadcast";
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

export function NotificationItem({
  id,
  title,
  description,
  created_at,
  url,
  button,
  type,
  onDelete,
  isDeleting,
}: NotificationItemProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-1 rounded-lg border border-border bg-card p-3 text-sm transition-opacity",
        isDeleting && "opacity-50 pointer-events-none",
      )}
    >
      {isDeleting && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <p className="font-medium leading-snug">{title}</p>
        {type === "direct" && onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => onDelete(id)}
            disabled={isDeleting}
            aria-label="Delete notification"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <p className="text-muted-foreground leading-snug">{description}</p>

      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
        </span>
        {url && (
          <Link
            href={url}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
            target={url.startsWith("http") ? "_blank" : undefined}
            rel={url.startsWith("http") ? "noopener noreferrer" : undefined}
          >
            {button ?? "View"}
            <ExternalLink className="h-3 w-3" />
          </Link>
        )}
      </div>
    </div>
  );
}
