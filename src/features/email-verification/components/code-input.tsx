"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export const CODE_LENGTH = 6;
const SLOTS = ["d1", "d2", "d3", "d4", "d5", "d6"] as const;

interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
  describedBy?: string;
}

/**
 * One real input, so paste, autofill and screen readers just work, drawn
 * as six boxes. Non-digits are dropped, so "123 456" from an email works.
 */
export function CodeInput({
  value,
  onChange,
  onComplete,
  disabled,
  invalid,
  autoFocus,
  describedBy,
}: CodeInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const id = useId();

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const handleChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, CODE_LENGTH);
    onChange(digits);
    if (digits.length === CODE_LENGTH && digits !== value) onComplete?.(digits);
  };

  const activeIndex = Math.min(value.length, CODE_LENGTH - 1);

  return (
    <div className="relative w-fit">
      <label htmlFor={id} className="sr-only">
        6-digit code
      </label>
      <input
        ref={inputRef}
        id={id}
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className="absolute inset-0 z-10 h-full w-full cursor-text opacity-0"
      />
      <div aria-hidden="true" className="flex gap-2">
        {SLOTS.map((slot, index) => (
          <div
            key={slot}
            className={cn(
              "flex h-12 w-10 items-center justify-center rounded-lg border bg-background text-lg font-semibold tabular-nums transition-colors sm:h-14 sm:w-12 sm:text-xl",
              focused &&
                index === activeIndex &&
                "border-ring ring-[3px] ring-ring/50",
              invalid && "border-destructive",
              disabled && "opacity-50",
            )}
          >
            {value[index] ?? ""}
          </div>
        ))}
      </div>
    </div>
  );
}
