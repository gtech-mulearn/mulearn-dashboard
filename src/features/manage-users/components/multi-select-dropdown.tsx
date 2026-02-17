"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import type { UiOption } from "../schemas";

interface MultiSelectDropdownProps {
  label: string;
  options: UiOption[];
  selectedValues: string[];
  onToggle: (value: string, checked: boolean) => void;
}

export function MultiSelectDropdown({
  label,
  options,
  selectedValues,
  onToggle,
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div className="space-y-2" ref={containerRef}>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <button
        type="button"
        className="flex h-10 w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted/30"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>
          {selectedValues.length > 0
            ? `${selectedValues.length} selected`
            : `Select ${label.toLowerCase()}`}
        </span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </button>
      {isOpen && (
        <div className="max-h-48 overflow-y-auto rounded-xl border border-border/50 bg-popover p-2 shadow-sm">
          {options.length === 0 ? (
            <p className="px-2 py-3 text-sm text-muted-foreground">
              No options
            </p>
          ) : (
            <div className="space-y-1">
              {options.map((option) => {
                const checked = selectedValues.includes(option.value);

                return (
                  <div
                    key={option.value}
                    className="flex items-center gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(state) =>
                        onToggle(option.value, Boolean(state))
                      }
                    />
                    <button
                      type="button"
                      className="flex-1 text-left text-sm text-foreground"
                      onClick={() => onToggle(option.value, !checked)}
                    >
                      {option.label}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
