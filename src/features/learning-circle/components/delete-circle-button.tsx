/**
 * Delete Circle Button
 *
 * 📍 src/features/learning-circle/components/delete-circle-button.tsx
 *
 * Confirmation dialog for deleting a learning circle. Owner only.
 */

"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useDeleteCircle } from "../hooks";

interface DeleteCircleButtonProps {
  circleId: string;
  circleName: string;
}

export function DeleteCircleButton({
  circleId,
  circleName,
}: DeleteCircleButtonProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { mutate: deleteCircle, isPending } = useDeleteCircle();

  const handleDelete = () => {
    deleteCircle(circleId, {
      onSuccess: () => {
        setOpen(false);
        router.push("/dashboard/learning-circle");
      },
    });
  };

  return (
    <>
      <button
        type="button"
        className="inline-flex h-9 items-center gap-2 rounded-[12px] border border-[#FCA5A5] bg-white px-4
          text-[13px] font-semibold text-[#DC2626] transition-all duration-150
          hover:bg-[#FEF2F2] hover:border-[#F87171] active:scale-[0.97]"
        style={{
          fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
        }}
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete Circle
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden rounded-[20px] border border-[#F0F0F0] p-0 shadow-[0_20px_60px_rgba(0,0,0,0.12)] sm:max-w-[420px]">
          <div
            style={{
              fontFamily:
                "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
            }}
          >
            <DialogHeader className="px-6 pt-6 pb-4">
              <DialogTitle className="flex items-center gap-3 text-lg">
                <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#FEF2F2] border border-[#FECACA]/50">
                  <Trash2 className="h-5 w-5 text-[#DC2626]" />
                </div>
                <span className="text-[18px] font-bold tracking-[-0.01em] text-[#DC2626]">
                  Delete Circle
                </span>
              </DialogTitle>
              <DialogDescription className="mt-3 text-[14px] leading-relaxed text-[#6B7280]">
                Are you sure you want to delete{" "}
                <span className="font-bold text-[#111827]">{circleName}</span>?
                This action cannot be undone. All meetings and data associated
                with this circle will be permanently removed.
              </DialogDescription>
            </DialogHeader>

            <div className="flex justify-end gap-3 border-t border-[#F3F4F6] bg-[#FAFAFA] px-6 py-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="h-9 rounded-[12px] border border-[#E5E7EB] bg-white px-5 text-[13px] font-semibold text-[#374151]
                  transition-all duration-150 hover:bg-[#F9FAFB] hover:border-[#D1D5DB] active:scale-[0.97] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="inline-flex h-9 items-center rounded-[12px] bg-[#DC2626] px-5 text-[13px] font-semibold text-white
                  transition-all duration-150 hover:bg-[#B91C1C] active:scale-[0.97] disabled:opacity-50"
              >
                {isPending && <Spinner className="mr-2 h-4 w-4" />}
                Delete
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
