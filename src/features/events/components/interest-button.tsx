"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToggleInterest } from "../hooks";
import type { ViewerInterestStatus } from "../types";

interface InterestButtonProps {
  eventId: string;
  status: ViewerInterestStatus | null;
  count: number;
  disabled?: boolean;
}

export function InterestButton({
  eventId,
  status,
  count,
  disabled,
}: InterestButtonProps) {
  const mutation = useToggleInterest(eventId);
  const isInterested = status === "interested";

  return (
    <Button
      type="button"
      variant={isInterested ? "default" : "outline"}
      className={isInterested ? "bg-pink-600 hover:bg-pink-700 text-white" : ""}
      disabled={disabled || mutation.isPending}
      onClick={() => mutation.mutate(status)}
    >
      {mutation.isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : null}
      {isInterested ? `Going · ${count}` : `I'm Going · ${count}`}
    </Button>
  );
}
