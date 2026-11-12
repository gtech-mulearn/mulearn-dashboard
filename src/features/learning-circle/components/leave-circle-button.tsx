/**
 * Leave Circle Button
 *
 * 📍 src/features/learning-circle/components/leave-circle-button.tsx
 *
 * Confirmation dialog for a member leaving a learning circle. Members only —
 * the circle creator/lead must transfer lead or delete the circle instead.
 */

"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { useLeaveCircle } from "../hooks";

interface LeaveCircleButtonProps {
  circleId: string;
  circleName: string;
}

export function LeaveCircleButton({
  circleId,
  circleName,
}: LeaveCircleButtonProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { mutate: leaveCircle, isPending } = useLeaveCircle();

  const handleLeave = () => {
    leaveCircle(circleId, {
      onSuccess: () => {
        setOpen(false);
        router.push("/dashboard/learning-circle");
      },
    });
  };

  return (
    <>
      <Button type="button" variant="destructive" onClick={() => setOpen(true)}>
        <LogOut className="h-3.5 w-3.5" />
        Leave Circle
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Leave Circle</DialogTitle>
            <DialogDescription>
              Are you sure you want to leave{" "}
              <span className="font-bold text-foreground">{circleName}</span>?
              You will need to request to join again to rejoin.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleLeave}
              disabled={isPending}
            >
              {isPending && <Spinner className="mr-2 h-4 w-4" />}
              Leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
