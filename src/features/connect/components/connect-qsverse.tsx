"use client";

import Link from "next/link";
import { useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useQsverseInfo } from "@/features/connect";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function QsverseConnectDialog({ open, onOpenChange }: Props) {
  const qsverse = useQsverseInfo();
  const isRefreshing = qsverse.isFetching;
  const handleRefreshConnection = useCallback(async () => {
    try {
      const response = await qsverse.refetch();
      const dids = response?.data?.dids;
      if (Array.isArray(dids) && dids.length > 0) {
        toast.success("Wallet connected successfully!");
        onOpenChange(false);
      } else {
        toast.error(
          "No connected wallet found. Please link your wallet in the QSeverse app first.",
        );
      }
    } catch {
      toast.error("Failed to check connection status.");
    }
  }, [onOpenChange, qsverse]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Connect your QSeverse Wallet</DialogTitle>
          <DialogDescription>
            To claim verifiable credentials for your achievements, you need to
            link your QSeverse wallet.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <p className="font-medium">Steps to connect:</p>
          <ol className="list-decimal space-y-2 pl-5 text-muted-foreground">
            <li>Download the QSeverse app from your app store and sign up</li>
            <li>Connect your µLearn account</li>
            <li>Your wallet will be automatically linked</li>
            <li>Click “Refresh Status” below to verify</li>
          </ol>
        </div>
        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button asChild variant="outline">
            <Link
              href="https://apps.apple.com/us/app/qs-passport/id6477819506"
              target="_blank"
              rel="noreferrer"
            >
              App Store
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link
              href="https://play.google.com/store/apps/details?id=com.qseverse.passport"
              target="_blank"
              rel="noreferrer"
            >
              Play Store
            </Link>
          </Button>
          <Button
            variant="default"
            onClick={handleRefreshConnection}
            disabled={isRefreshing}
          >
            {isRefreshing && <Spinner className="mr-2 h-4 w-4" />}
            Refresh Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
