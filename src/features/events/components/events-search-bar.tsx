"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type EventsSearchBarProps = {
  defaultValue?: string;
  onSearch: (data: string) => void;
  placeholder?: string;
  onClear?: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
  showButton?: boolean;
  inputClassName?: string;
};

export function EventsSearchBar({
  defaultValue = "",
  onSearch,
  placeholder = "Search events...",
  onClear,
  size = "md",
  className,
  showButton = false,
  inputClassName,
}: EventsSearchBarProps) {
  const [search, setSearch] = useState(defaultValue);
  const lastSubmittedRef = useRef(defaultValue);
  const inFlightSubmissionRef = useRef<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep a ref to the latest onSearch callback so the debounce timer never executes a stale closure
  const onSearchRef = useRef(onSearch);
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  // Synchronize when defaultValue changes externally (e.g. router updates, filter resets, history navigation)
  useEffect(() => {
    // If defaultValue matches an in-flight submission from this component, acknowledge the echo
    // and preserve any newer active keystrokes the user typed in the interim
    if (
      inFlightSubmissionRef.current !== null &&
      defaultValue === inFlightSubmissionRef.current
    ) {
      inFlightSubmissionRef.current = null;
      return;
    }

    // External update: abort any pending debounced search so it doesn't overwrite the external change
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    inFlightSubmissionRef.current = null;

    setSearch(defaultValue);
    lastSubmittedRef.current = defaultValue;
  }, [defaultValue]);

  // Abort any pending debounced search on browser history Back/Forward (popstate)
  useEffect(() => {
    const handlePopState = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      inFlightSubmissionRef.current = null;
      const params = new URLSearchParams(window.location.search);
      const urlQ = params.get("q") ?? "";
      setSearch(urlQ);
      lastSubmittedRef.current = urlQ;
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const sizeClass =
    size === "sm"
      ? "h-9 text-sm"
      : size === "lg"
        ? "h-11 text-base"
        : "h-10 text-sm";

  const onChangeSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    const sanitizedInput = inputValue.replace(/[<>/]/g, "");
    setSearch(sanitizedInput);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      const trimmed = sanitizedInput.trim();
      if (trimmed !== lastSubmittedRef.current) {
        lastSubmittedRef.current = trimmed;
        inFlightSubmissionRef.current = trimmed;
        onSearchRef.current(trimmed);
      }
    }, 300);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const trimmed = search.trim();
    if (trimmed !== lastSubmittedRef.current) {
      lastSubmittedRef.current = trimmed;
      inFlightSubmissionRef.current = trimmed;
      onSearchRef.current(trimmed);
    }
  };

  const clearInput = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setSearch("");
    lastSubmittedRef.current = "";
    inFlightSubmissionRef.current = "";
    if (onClear) onClear();
    else onSearchRef.current("");
  };

  return (
    <form
      className={cn("flex w-full items-center gap-2", className)}
      onSubmit={handleSubmit}
    >
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
        <Input
          type="text"
          placeholder={placeholder}
          onChange={onChangeSearch}
          value={search}
          className={cn(
            "rounded-xl border-border/60 pl-9 pr-9",
            sizeClass,
            inputClassName,
          )}
        />
        {search && (
          <Button
            type="button"
            variant="ghost"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            onClick={clearInput}
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
      {showButton && (
        <Button type="submit" className={cn("rounded-xl", sizeClass)}>
          Search
        </Button>
      )}
    </form>
  );
}
