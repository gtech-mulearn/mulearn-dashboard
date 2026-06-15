import type React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DepartmentDialogProps {
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

export function DepartmentDialog({
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
}: DepartmentDialogProps) {
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
                <Label htmlFor="dept-title" className="text-left font-medium">
                  Department Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dept-title"
                  value={inputValue}
                  onChange={(e) => onInputChange?.(e.target.value)}
                  placeholder="e.g. Computer Science and Engineering"
                  className="h-10"
                  required
                  maxLength={100}
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? `${actionText}…` : actionText}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <>
            <p className="text-sm text-muted-foreground py-2">
              This action is <span className="font-semibold">permanent</span>{" "}
              and cannot be undone.
            </p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="button"
                variant={variant}
                onClick={() => onSubmit()}
                disabled={isPending}
              >
                {isPending ? `${actionText}…` : actionText}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
