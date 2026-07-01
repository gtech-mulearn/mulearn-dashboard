"use client";

import { ChevronDown, X } from "lucide-react";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { UiOption } from "../schemas";

interface MultiSelectDropdownProps {
  label?: string;
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
  const selectedOptions = options.filter((option) =>
    selectedValues.includes(option.value),
  );

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
      )}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            className="flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted/50"
            onClick={(event) => {
              const target = event.target as HTMLElement;

              const removeValue = target
                .closest("[data-remove-value]")
                ?.getAttribute("data-remove-value");
              if (removeValue) {
                onToggle(removeValue, false);
                event.preventDefault();
                return;
              }

              const clearAll = target.closest("[data-clear-all]");
              if (clearAll) {
                for (const value of selectedValues) {
                  onToggle(value, false);
                }
                event.preventDefault();
                return;
              }
            }}
          >
            <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 text-left">
              {selectedOptions.length > 0
                ? selectedOptions.map((option) => (
                    <span
                      key={option.value}
                      className="inline-flex items-center gap-1 rounded-md bg-background px-2 py-1 text-sm text-foreground"
                    >
                      <span className="truncate">{option.label}</span>
                      <span
                        data-remove-value={option.value}
                        className="shrink-0 text-foreground/70"
                      >
                        <X className="size-3.5" />
                      </span>
                    </span>
                  ))
                : `Select ${(label ?? "").toLowerCase()}`}
            </span>
            <span className="flex shrink-0 items-center gap-1">
              {selectedOptions.length > 0 && (
                <span
                  data-clear-all
                  className="rounded p-1 text-muted-foreground"
                >
                  <X className="size-3.5" />
                </span>
              )}
              <ChevronDown className="size-4 text-muted-foreground" />
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-2 shadow-sm rounded-xl overflow-y-auto max-h-48"
          align="start"
          sideOffset={8}
        >
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
        </PopoverContent>
      </Popover>
    </div>
  );
}
