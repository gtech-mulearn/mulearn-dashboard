"use client";

import { Loader2 } from "lucide-react";
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
  const isLoggedIn = !!authStore.getAccessToken();

  const handleClick = () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    mutation.mutate(status);
  };

  return (
    <Button
      type="button"
      variant={isInterested ? "default" : "outline"}
      className={
        isInterested
          ? "bg-primary hover:bg-primary/90 text-primary-foreground"
          : ""
      }
      disabled={disabled || mutation.isPending}
      onClick={handleClick}
    >
      {mutation.isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : null}
      {isInterested ? `Going · ${count}` : `I'm Going · ${count}`}
    </Button>
  );
}
