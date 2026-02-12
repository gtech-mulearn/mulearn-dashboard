/**
 * Progress Arrow Button
 *
 * 📍 src/components/ui/progress-arrow.tsx
 *
 * A circular arrow button with an optional progress ring around it.
 * Used for step navigation in onboarding flows.
 */

"use client";

import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressArrowProps {
  /** Progress value 0-100 */
  progress?: number;
  /** Click handler */
  onClick?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Additional classes */
  className?: string;
}

export function ProgressArrow({
  progress = 0,
  onClick,
  disabled = false,
  className,
}: ProgressArrowProps) {
  // Calculate stroke dasharray for progress ring
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative inline-flex items-center justify-center",
        "w-14 h-14 rounded-full",
        "bg-primary text-white",
        "shadow-[inset_0_6px_11px_0_rgba(255,255,255,0.33),inset_0_-6px_17px_0_rgba(0,0,0,0.18)]",
        "border border-[#0054E8]",
        "hover:bg-primary/90 active:scale-95 transition-all",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
      type="button"
    >
      {/* Progress ring */}
      <svg
        className="absolute inset-0 -rotate-90"
        width="56"
        height="56"
        viewBox="0 0 60 60"
        aria-hidden="true"
      >
        {/* Background ring */}
        <circle
          cx="30"
          cy="30"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="3"
        />
        {/* Progress ring */}
        <circle
          cx="30"
          cy="30"
          r={radius}
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-300"
        />
      </svg>

      {/* Arrow icon */}
      <ArrowRight className="w-5 h-5 relative z-10" />
    </button>
  );
}
