"use client";

import { Heart, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authStore } from "@/lib/auth";
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
  const router = useRouter();
  const mutation = useToggleInterest(eventId);
  const isInterested = status === "interested";
  const isLoggedIn = authStore.isAuthenticated();

  const handleClick = () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    mutation.mutate(status);
  };

  return (
    <Button
      variant="outline"
      className="w-full rounded-full"
      disabled={disabled || mutation.isPending}
      onClick={handleClick}
    >
      {mutation.isPending ? (
        <Loader2 className="mr-2 size-4 animate-spin" />
      ) : (
        <Heart
          className="mr-2 size-4"
          fill={isInterested ? "currentColor" : "none"}
        />
      )}
      {isInterested ? `Going · ${count}` : `I'm Going · ${count}`}
    </Button>
  );
}
