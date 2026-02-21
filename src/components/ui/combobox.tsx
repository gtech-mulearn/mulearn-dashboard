/**
 * Combobox Component (Searchable Select)
 *
 * 📍 src/components/ui/combobox.tsx
 */

"use client";

import { Check, ChevronDown } from "lucide-react";
import * as React from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Option {
  id: string;
  title: string;
}

interface ComboboxProps {
  options: Option[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  onCreateNew?: (searchTerm: string) => void;
  createNewText?: string;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select an option",
  searchPlaceholder: _searchPlaceholder = "Search...",
  emptyText = "No results found.",
  disabled = false,
  className,
  onCreateNew,
  createNewText = "Create new",
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.id === value);

  // Filter options based on search
  const filteredOptions = React.useMemo(() => {
    if (!search) return options;
    return options.filter((option) =>
      option.title.toLowerCase().includes(search.toLowerCase()),
    );
  }, [options, search]);

  // Display value in input (handle custom values not in options)
  const displayValue = search || selectedOption?.title || value || "";

  const handleSelect = (option: Option) => {
    onValueChange(option.id);
    setSearch("");
    setOpen(false);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={displayValue}
          onChange={(e) => {
            const newValue = e.target.value;
            setSearch(newValue);
            if (!open) setOpen(true);

            // If user clears the input completely, clear the form value too
            if (newValue === "" && value) {
              onValueChange("");
            }
          }}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          disabled={disabled}
          className={cn(
            "h-12 rounded-xl border-gray-200 bg-gray-50/50 px-4 pr-10",
            className,
          )}
          autoComplete="off"
        />
        <ChevronDown
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none transition-transform",
            open && "rotate-180",
          )}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border bg-popover shadow-md">
          <div className="max-h-75 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-1">
                <div className="py-4 text-center text-sm text-muted-foreground">
                  {emptyText}
                </div>
                {onCreateNew && search.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      onCreateNew(search.trim());
                      setSearch("");
                      setOpen(false);
                    }}
                    className={cn(
                      "relative flex w-full cursor-pointer items-center rounded-sm px-3 py-2 text-sm outline-none transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      "border-t",
                    )}
                  >
                    <span className="text-primary font-medium">
                      + {createNewText}: "{search.trim()}"
                    </span>
                  </button>
                )}
              </div>
            ) : (
              <div className="p-1">
                {filteredOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={cn(
                      "relative flex w-full cursor-pointer items-center rounded-sm px-3 py-2 text-sm outline-none transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      value === option.id && "bg-accent text-accent-foreground",
                    )}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {option.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
