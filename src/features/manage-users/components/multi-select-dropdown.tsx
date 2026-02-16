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
      <p className="text-sm font-medium text-foreground">{label}</p>
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
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
        <div className="max-h-48 overflow-y-auto rounded-md border border-border bg-popover p-2 shadow-sm">
          {options.length === 0 ? (
            <p className="text-sm text-muted-foreground">No options</p>
          ) : (
            <div className="space-y-2">
              {options.map((option) => {
                const checked = selectedValues.includes(option.value);

                return (
                  <div
                    key={option.value}
                    className="flex items-center gap-2 rounded px-2 py-1 hover:bg-muted"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(state) =>
                        onToggle(option.value, Boolean(state))
                      }
                    />
                    <button
                      type="button"
                      className="text-left text-sm text-foreground"
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
