/**
 * Achievement Detail Modal
 *
 * 📍 src/features/profile/components/achievement-detail-modal.tsx
 *
 * Generic "view achievement" modal shared by earned (non-VC) and eligible
 * cards — shows the icon, full (untrimmed) description, and tags, with an
 * optional action slot for continuing the flow (e.g. Claim Achievement).
 */

"use client";

import { Award } from "lucide-react";
import Image from "next/image";
import type * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { resolveMediaUrl } from "@/lib/utils";

interface AchievementDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  description?: string | null;
  iconUrl?: string | null;
  tags?: string[];
  /** Optional action(s) rendered in the footer, e.g. a Claim button */
  footer?: React.ReactNode;
}

export function AchievementDetailModal({
  open,
  onOpenChange,
  name,
  description,
  iconUrl,
  tags = [],
  footer,
}: AchievementDetailModalProps) {
  const resolvedImageSrc = resolveMediaUrl(iconUrl || "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="mb-1 h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-border/60 bg-muted shadow-sm">
            {resolvedImageSrc ? (
              <div className="relative h-full w-full">
                <Image
                  src={resolvedImageSrc}
                  alt={name}
                  fill
                  className="object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <Award className="h-10 w-10 text-muted-foreground/60" />
              </div>
            )}
          </div>
          <DialogTitle className="text-xl">{name}</DialogTitle>
          <DialogDescription asChild>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {description ||
                "This achievement doesn't have a description yet."}
            </p>
          </DialogDescription>
        </DialogHeader>

        {tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {footer && (
          <DialogFooter className="sm:justify-center">{footer}</DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
