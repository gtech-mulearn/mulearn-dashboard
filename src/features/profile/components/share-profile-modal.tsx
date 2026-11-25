/**
 * Share Profile Modal
 *
 * 📍 src/features/profile/components/share-profile-modal.tsx
 *
 * Modal dialog for sharing profile link.
 */

"use client";

import { Check, Copy, Download, Link2, QrCode } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import QRCode from "react-qr-code";
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

const LOGO_SRC = "/favicon.ico";
const EXPORT_SIZE = 512;
const EXPORT_PADDING = 32;
// Matches on-screen 55px logo on 176px QR (~10% of area); level "H" tolerates ~30% data loss.
const LOGO_RATIO = 55 / 176;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

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
  const qrRef = useRef<HTMLDivElement>(null);

  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/profile/${muid}`
      : `https://app.mulearn.org/profile/${muid}`;

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

  const handleDownload = async () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    try {
      const svgData = new XMLSerializer().serializeToString(svg);
      const [qr, logo] = await Promise.all([
        loadImage(
          `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`,
        ),
        loadImage(LOGO_SRC),
      ]);

      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = EXPORT_SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unsupported");

      const qrSize = EXPORT_SIZE - EXPORT_PADDING * 2;
      const logoSize = qrSize * LOGO_RATIO;
      const logoPos = (EXPORT_SIZE - logoSize) / 2;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, EXPORT_SIZE, EXPORT_SIZE);
      ctx.drawImage(qr, EXPORT_PADDING, EXPORT_PADDING, qrSize, qrSize);
      ctx.drawImage(logo, logoPos, logoPos, logoSize, logoSize);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob) throw new Error("PNG export failed");

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${muid}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("QR code downloaded");
    } catch {
      toast.error("Failed to download QR code");
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
                public. Scroll down to the "Profile Settings" section on this
                page to change visibility.
              </p>
            </div>
          )}

          {/* QR Code Section */}
          <div className="flex flex-col items-center justify-center space-y-3 rounded-xl border border-dashed border-border bg-muted/50 p-6">
            <div
              ref={qrRef}
              className="relative aspect-square w-48 overflow-hidden rounded-lg bg-white p-2 shadow-sm"
            >
              <QRCode
                value={profileUrl}
                level="H"
                size={176}
                className="h-full w-full"
                aria-label="Profile QR Code"
              />
              <Image
                src={LOGO_SRC}
                alt=""
                width={55}
                height={55}
                unoptimized
                className="absolute top-1/2 left-1/2 h-[55px] w-[55px] -translate-x-1/2 -translate-y-1/2 rounded-md"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2 text-xs"
              onClick={handleDownload}
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
              Share Profile Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
