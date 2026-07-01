"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Renders text clamped to `lines`. When the content overflows, a "Show more"
 * link opens a modal with the full text — keeps grid cards a fixed height
 * instead of expanding inline and reflowing the layout.
 */
export function ExpandableText({
  text,
  title,
  lines = 2,
  className,
}: {
  text: string;
  /** Heading for the modal (e.g. the session title). */
  title?: string;
  lines?: number;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-measure overflow when the text changes
  useEffect(() => {
    const el = ref.current;
    if (el) setOverflowing(el.scrollHeight > el.clientHeight + 1);
  }, [text]);

  return (
    <div className={className}>
      <p
        ref={ref}
        className="whitespace-pre-line text-sm text-muted-foreground"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: lines,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {text}
      </p>
      {overflowing && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-0.5 text-xs font-medium text-primary hover:underline"
        >
          Show more
        </button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[80vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title ?? "Description"}</DialogTitle>
          </DialogHeader>
          <p className="whitespace-pre-line text-sm text-muted-foreground">
            {text}
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
