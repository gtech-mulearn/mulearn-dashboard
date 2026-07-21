/**
 * Share Profile Modal
 *
 * 📍 src/features/profile/components/share-profile-modal.tsx
 *
 * Modal dialog for sharing profile link.
 */

"use client";

import { Check, Copy, Download, Link2, Loader2, QrCode } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useQRCode } from "../hooks/use-profile";

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
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/profile/${muid}`
      : `https://app.mulearn.org/profile/${muid}`;

  const { data: qrBlob, isLoading: isLoadingQr } = useQRCode(profileUrl);

  useEffect(() => {
    if (qrBlob) {
      const url = URL.createObjectURL(qrBlob);
      setQrUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [qrBlob]);

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

  const handleDownload = () => {
    if (!qrBlob) return;
    const url = URL.createObjectURL(qrBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${muid}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("QR code downloaded");
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
        if (error instanceof Error && error.name === "AbortError") return;
        toast.error("Failed to share");
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-0 p-0 sm:max-w-md">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Share Profile
          </DialogTitle>
          <DialogDescription className="sr-only">
            Share your profile link or QR code with others.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto px-6 pb-6 space-y-4">
          {/* Privacy Warning */}
          {!isPublic && (
            <div className="rounded-lg bg-warning/10 p-3 text-sm text-warning">
              <p className="font-medium">Your profile is private</p>
              <p className="mt-1 text-xs text-warning/80">
                Others won't be able to view your profile until you make it
                public in settings.
              </p>
            </div>
          )}

          {/* QR Code Section */}
          <div className="flex flex-col items-center justify-center space-y-3 rounded-xl border border-dashed border-border bg-muted/50 p-6">
            <div className="relative aspect-square w-48 overflow-hidden rounded-lg bg-card p-2 shadow-sm">
              {isLoadingQr ? (
                <div className="flex h-full w-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : qrUrl ? (
                <Image
                  src={qrUrl}
                  alt="Profile QR Code"
                  className="h-full w-full object-contain"
                  width={192}
                  height={192}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                  Failed to load QR
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2 text-xs"
              onClick={handleDownload}
              disabled={!qrBlob}
            >
              <Download className="h-3.5 w-3.5" />
              Download QR Code
            </Button>
          </div>

          {/* Profile URL */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Profile Link</p>
            <div className="flex gap-2">
              <Input value={profileUrl} readOnly className="bg-muted" />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-success" />
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
