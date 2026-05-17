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
  icon?: React.ReactNode;
  label: string;
  description?: string;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export function OptionCard({
  icon,
  label,
  description,
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
        "text-left",
        "transition-all duration-200",
        "hover:shadow-md hover:border-primary/30",
        "active:scale-[0.98]",
        selected
          ? "border-primary bg-primary text-primary-foreground shadow-md"
          : "border-border shadow-sm",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      {icon && <span className="text-2xl shrink-0">{icon}</span>}
      <span className="flex-1 min-w-0">
        <span
          className={cn(
            "block text-base font-medium",
            selected ? "text-primary-foreground" : "text-foreground",
          )}
        >
          {label}
        </span>
        {description && (
          <span
            className={cn(
              "block text-xs mt-0.5 leading-snug",
              selected ? "text-primary-foreground/80" : "text-muted-foreground",
            )}
          >
            {description}
          </span>
        )}
      </span>
      {selected && (
        <span className="w-5 h-5 rounded-full bg-primary-foreground flex items-center justify-center shrink-0">
          <svg
            className="w-3 h-3 text-primary"
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
