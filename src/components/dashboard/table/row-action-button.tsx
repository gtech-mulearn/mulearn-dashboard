"use client";

/**
 * Icon-only row action with a tooltip — the style the Mentor verification tab
 * introduced, shared so every verification tab's View / Approve / Reject /
 * etc. buttons look and behave the same.
 *
 * 📍 src/components/dashboard/table/row-action-button.tsx
 */
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const TONES = {
  neutral: "text-foreground hover:bg-muted",
  success:
    "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950",
  destructive: "text-destructive hover:bg-destructive/10",
} as const;

export type RowActionTone = keyof typeof TONES;

interface RowActionButtonProps {
  icon: LucideIcon;
  /** Tooltip text, and the button's accessible name. */
  label: string;
  onClick: () => void;
  tone?: RowActionTone;
  disabled?: boolean;
  id?: string;
}

export function RowActionButton({
  icon: Icon,
  label,
  onClick,
  tone = "neutral",
  disabled,
  id,
}: RowActionButtonProps) {
  // Own provider: Radix Tooltip needs one above it, and not every table that
  // renders these rows wraps itself in a TooltipProvider.
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            id={id}
            className={cn("h-8 w-8", TONES[tone])}
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
          >
            <Icon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
