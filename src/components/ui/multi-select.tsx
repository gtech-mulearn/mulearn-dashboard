"use client";

import { Check, ChevronDown, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  maxSelections?: number;
  minSelections?: number;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select options...",
  disabled = false,
  className,
  maxSelections,
  minSelections,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  const filtered = React.useMemo(() => {
    if (!search) return options;
    return options.filter((o) =>
      o.label.toLowerCase().includes(search.toLowerCase()),
    );
  }, [options, search]);

  const toggle = (optValue: string) => {
    if (value.includes(optValue)) {
      onChange(value.filter((v) => v !== optValue));
    } else {
      if (maxSelections !== undefined && value.length >= maxSelections) {
        toast.error(
          `You can select a maximum of ${maxSelections} Interest Group${
            maxSelections === 1 ? "" : "s"
          }.`,
        );
        return;
      }
      onChange([...value, optValue]);
    }
  };

  const remove = (optValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optValue));
  };

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const selectedLabels = options.filter((o) => value.includes(o.value));

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div
        role="combobox"
        aria-expanded={open}
        tabIndex={disabled ? -1 : 0}
        onClick={() => {
          if (!disabled) setOpen((v) => !v);
        }}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        className={cn(
          "flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        )}
      >
        {selectedLabels.length === 0 ? (
          <span className="text-muted-foreground flex-1">{placeholder}</span>
        ) : (
          <>
            {selectedLabels.map((o) => (
              <Badge key={o.value} variant="secondary" className="gap-1 pr-1">
                {o.label}
                <button
                  type="button"
                  aria-label={`Remove ${o.label}`}
                  onClick={(e) => remove(o.value, e)}
                  className="rounded-sm opacity-60 hover:opacity-100 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {maxSelections !== undefined && (
              <span className="ml-auto text-xs text-muted-foreground whitespace-nowrap">
                {value.length}/{maxSelections}
              </span>
            )}
          </>
        )}
        <ChevronDown
          className={cn(
            "ml-auto h-4 w-4 shrink-0 opacity-50 transition-transform",
            open && "rotate-180",
          )}
        />
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          <div className="p-2 border-b">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No results found.
              </p>
            ) : (
              filtered.map((o) => {
                const selected = value.includes(o.value);
                const atMax =
                  maxSelections !== undefined &&
                  value.length >= maxSelections &&
                  !selected;
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => toggle(o.value)}
                    disabled={atMax}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm outline-none transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      selected && "bg-accent/50",
                      atMax &&
                        "opacity-40 cursor-not-allowed hover:bg-transparent hover:text-current",
                    )}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0",
                        selected ? "opacity-100 text-primary" : "opacity-0",
                      )}
                    />
                    {o.label}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
