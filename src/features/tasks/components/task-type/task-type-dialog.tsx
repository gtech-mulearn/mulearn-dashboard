import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface TaskTypeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  type: "form" | "confirm";
  inputValue?: string;
  onInputChange?: (value: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  isPending?: boolean;
  variant?: "default" | "destructive";
  actionText: string;
}

export function TaskTypeDialog({
  isOpen,
  onClose,
  title,
  description,
  type,
  inputValue = "",
  onInputChange,
  onSubmit,
  isPending = false,
  variant = "default",
  actionText,
}: TaskTypeDialogProps) {
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {type === "form" ? (
          <form onSubmit={handleFormSubmit}>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="title" className="text-left font-medium">
                  Title
                </Label>
                <Input
                  id="title"
                  value={inputValue}
                  onChange={(e) => onInputChange?.(e.target.value)}
                  placeholder="e.g. Bug Fix"
                  className="col-span-3 h-10"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? `${actionText}...` : actionText}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant={variant}
              onClick={() => onSubmit()}
              disabled={isPending}
            >
              {isPending ? `${actionText}...` : actionText}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
