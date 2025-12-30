/**
 * Share Profile Modal
 *
 * 📍 src/features/profile/components/share-profile-modal.tsx
 *
 * Modal dialog for sharing profile link.
 */

"use client";

import { Check, Copy, Link2, QrCode } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface ShareProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  muid: string;
  isPublic: boolean | null;
}

export function ShareProfileModal({
  open,
  onOpenChange,
  muid,
  isPublic,
}: ShareProfileModalProps) {
  const [copied, setCopied] = useState(false);

  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/profile/${muid}`
      : `https://mulearn.org/profile/${muid}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My μLearn Profile",
          text: "Check out my μLearn profile!",
          url: profileUrl,
        });
      } catch (error) {
        // User cancelled or error
        if ((error as Error).name !== "AbortError") {
          toast.error("Failed to share");
        }
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Share Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Privacy Warning */}
          {!isPublic && (
            <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              <p className="font-medium">Your profile is private</p>
              <p className="mt-1 text-xs text-amber-600">
                Others won't be able to view your profile until you make it
                public in settings.
              </p>
            </div>
          )}

          {/* Profile URL */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Profile Link</p>
            <div className="flex gap-2">
              <Input value={profileUrl} readOnly className="bg-gray-50" />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Share Options */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleCopy}
            >
              <Copy className="h-4 w-4" />
              Copy Link
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleNativeShare}
            >
              <QrCode className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
