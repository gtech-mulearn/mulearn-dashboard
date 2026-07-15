"use client";

import { ChevronDown, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOptions = options.filter((o) =>
    selectedValues.includes(o.value),
  );

  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q
      ? options.filter((o) => o.label.toLowerCase().includes(q))
      : options;
  }, [options, search]);

  // Close on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutside);
    }
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen]);

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    for (const v of selectedValues) onToggle(v, false);
  };

  const handleRemove = (e: React.MouseEvent, value: string) => {
    e.stopPropagation();
    onToggle(value, false);
  };

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
      )}

      {/* Wrapper — relative so the dropdown panel positions against it */}
      <div className="relative" ref={containerRef}>
        {/* Trigger button */}
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => {
            setIsOpen((prev) => !prev);
            if (isOpen) setSearch("");
          }}
          className="flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted/50"
        >
          <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 text-left">
            {selectedOptions.length > 0 ? (
              selectedOptions.map((option) => (
                <span
                  key={option.value}
                  className="inline-flex items-center gap-1 rounded-md bg-background px-2 py-1 text-sm text-foreground"
                >
                  <span className="truncate">{option.label}</span>
                  <button
                    type="button"
                    className="shrink-0 text-foreground/70"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => handleRemove(e, option.value)}
                  >
                    <X className="size-3.5" />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-muted-foreground">{`Select ${(label ?? "").toLowerCase()}`}</span>
            )}
          </span>
          <span className="flex shrink-0 items-center gap-1">
            {selectedOptions.length > 0 && (
              <button
                type="button"
                className="rounded p-1 text-muted-foreground hover:text-foreground"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={handleClearAll}
              >
                <X className="size-3.5" />
              </button>
            )}
            <ChevronDown
              className={`size-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </span>
        </button>

        {/* Inline dropdown panel — no Portal, renders in-place inside Dialog DOM */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-border bg-popover shadow-md">
            {/* Search input */}
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <Search className="size-3.5 shrink-0 text-muted-foreground" />
              <input
                ref={(el) => {
                  if (el) el.focus();
                }}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${(label ?? "").toLowerCase()}…`}
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Scrollable list */}
            <div className="max-h-52 overflow-y-auto overscroll-contain p-2">
              {filteredOptions.length === 0 ? (
                <p className="px-2 py-3 text-sm text-muted-foreground">
                  No options found
                </p>
              ) : (
                <div className="space-y-0.5">
                  {filteredOptions.map((option) => {
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
          </div>
        )}
      </div>
    </div>
  );
}
