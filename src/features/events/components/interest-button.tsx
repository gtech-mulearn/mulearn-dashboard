/**
 * Interest Button
 *
 * 📍 src/features/events/components/interest-button.tsx
 *
 * "I'm Going" toggle button with optimistic UI. Uses auth check.
 */

"use client";

import { Heart, HeartOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMarkInterest, useRemoveInterest } from "../hooks/events.hooks";
import type { ViewerInterestStatus } from "../schemas/events.schema";

interface InterestButtonProps {
  eventId: string;
  interestStatus: ViewerInterestStatus | null;
  interestCount: number;
  className?: string;
}

export function InterestButton({
  eventId,
  interestStatus,
  interestCount,
  className,
}: InterestButtonProps) {
  const markInterest = useMarkInterest();
  const removeInterest = useRemoveInterest();

  const isInterested = interestStatus === "interested";
  const isPending = markInterest.isPending || removeInterest.isPending;

  const handleToggle = () => {
    if (isPending) return;
    if (isInterested) {
      removeInterest.mutate(eventId);
    } else {
      markInterest.mutate(eventId);
    }
  };

  return (
    <Button
      variant={isInterested ? "default" : "outline"}
      size="sm"
      className={`gap-2 ${className ?? ""}`}
      onClick={handleToggle}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isInterested ? (
        <Heart className="h-4 w-4 fill-current" />
      ) : (
        <HeartOff className="h-4 w-4" />
      )}
      {isInterested ? "Going" : "I'm Going"}
      {interestCount > 0 && (
        <span className="text-xs opacity-70">({interestCount})</span>
      )}
    </Button>
  );
}
