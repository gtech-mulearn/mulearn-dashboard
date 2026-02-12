/**
 * Option Card Component
 *
 * 📍 src/components/ui/option-card.tsx
 *
 * A selectable option card with icon and text for quiz-style selections.
 */

"use client";

import { cn } from "@/lib/utils";

interface OptionCardProps {
  /** Icon or emoji to display */
  icon?: React.ReactNode;
  /** Option label */
  label: string;
  /** Whether this option is selected */
  selected?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Disabled state */
  disabled?: boolean;
}

export function OptionCard({
  icon,
  label,
  selected = false,
  onClick,
  disabled = false,
}: OptionCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type="button"
      className={cn(
        "w-full flex items-center gap-4 px-6 py-4",
        "rounded-2xl border bg-card",
        "text-left text-base font-medium",
        "transition-all duration-200",
        "hover:shadow-md hover:border-primary/30",
        "active:scale-[0.98]",
        selected
          ? "border-primary bg-primary/10 shadow-md"
          : "border-border shadow-sm",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      {icon && <span className="text-2xl shrink-0">{icon}</span>}
      <span className="flex-1 text-foreground">{label}</span>
      {selected && (
        <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <svg
            className="w-3 h-3 text-primary-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </span>
      )}
    </button>
  );
}
