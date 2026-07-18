"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import type { ChangelogEntry } from "@/lib/whats-new";

interface WhatsNewPopupProps {
  entry: ChangelogEntry | null;
  isOpen: boolean;
  onSeen: (hash: string) => Promise<void>;
  onDismiss: (hash: string) => Promise<void>;
}

export function WhatsNewPopup({
  entry,
  isOpen,
  onSeen,
  onDismiss,
}: WhatsNewPopupProps) {
  const router = useRouter();
  const [dismissedHash, setDismissedHash] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(Boolean(isOpen));
  const seenHashRef = useRef<string | null>(null);
  const seenTrackedRef = useRef(false);

  const content = entry?.body ?? "";
  const isDismissed = entry?.hash ? dismissedHash === entry.hash : false;

  useEffect(() => {
    if (!entry?.hash) {
      return;
    }

    if (seenHashRef.current !== entry.hash) {
      seenHashRef.current = entry.hash;
      seenTrackedRef.current = false;
      setIsVisible(Boolean(isOpen));
    }
  }, [entry?.hash, isOpen]);

  useEffect(() => {
    if (!entry?.hash || !isVisible || seenTrackedRef.current) {
      return;
    }

    seenTrackedRef.current = true;
    void onSeen(entry.hash);
  }, [entry?.hash, isVisible, onSeen]);

  if (!entry || !isVisible || isDismissed) {
    return null;
  }

  return (
    <Dialog
      open={isVisible}
      onOpenChange={(open) => {
        if (!open) {
          void handleClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>What&apos;s new</DialogTitle>
          <DialogDescription>
            {entry.title} is now available with the latest updates.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto rounded-lg border bg-muted/20 p-4 text-sm leading-6">
          <MarkdownRenderer content={content} className="space-y-3" />
        </div>

        <div className="flex items-center justify-between gap-3">
          <Button onClick={() => void handleReadMore()} variant="outline">
            Read more
          </Button>
          <Button onClick={() => void handleClose()} variant="default">
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  async function handleClose() {
    if (entry?.hash) {
      setDismissedHash(entry.hash);
      setIsVisible(false);
      await onDismiss(entry.hash);
    }
  }

  async function handleReadMore() {
    await handleClose();
    router.push("/dashboard/changelog");
  }
}
