"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type StarValue = 1 | 2 | 3 | 4 | 5;

const STARS: StarValue[] = [1, 2, 3, 4, 5];
const WORDS: Record<StarValue, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very good",
  5: "Excellent",
};

interface StarRatingInputProps {
  value: StarValue | null;
  onChange: (value: StarValue) => void;
  /** Radio group name; unique per form. */
  name: string;
  label?: string;
  disabled?: boolean;
}

/**
 * 1–5 star picker built on native radios: arrow keys move between stars and
 * each star is announced as "N stars".
 */
export function StarRatingInput({
  value,
  onChange,
  name,
  label = "Rating",
  disabled,
}: StarRatingInputProps) {
  const [hovered, setHovered] = useState<StarValue | null>(null);
  const shown = hovered ?? value;

  return (
    <fieldset disabled={disabled}>
      <legend className="sr-only">{label}</legend>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: mouse-leave only clears the hover preview; selection uses keyboard-accessible radios */}
      <div
        className="flex items-center gap-1"
        onMouseLeave={() => setHovered(null)}
      >
        {STARS.map((star) => (
          <label
            key={star}
            className="cursor-pointer rounded-md p-1 focus-within:ring-2 focus-within:ring-ring"
            onMouseEnter={() => setHovered(star)}
          >
            <input
              type="radio"
              name={name}
              value={star}
              checked={value === star}
              onChange={() => onChange(star)}
              aria-label={`${star} ${star === 1 ? "star" : "stars"}`}
              className="sr-only"
            />
            <Star
              aria-hidden="true"
              className={cn(
                "h-8 w-8 transition-colors",
                shown && star <= shown
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/40",
              )}
            />
          </label>
        ))}
        <span
          className="ml-2 text-sm font-medium text-muted-foreground"
          aria-live="polite"
        >
          {shown ? WORDS[shown] : "Choose a rating"}
        </span>
      </div>
    </fieldset>
  );
}
