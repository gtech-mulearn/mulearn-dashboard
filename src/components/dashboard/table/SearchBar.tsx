"use client";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  onSearch: (data: string) => void;
  placeholder: string;
  onClear?: () => void;
  size: "sm" | "md" | "lg";
  className?: string;
  showButton: boolean;
  inputClassName?: string;
  defaultValue?: string;
};

export const SearchBar = ({
  onSearch,
  placeholder,
  onClear,
  size,
  className,
  showButton,
  inputClassName,
  defaultValue = "",
}: Props) => {
  const [search, setSearch] = useState(defaultValue);
  const lastSubmittedRef = useRef(defaultValue);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize when defaultValue changes externally (e.g. browser history back/forward)
  useEffect(() => {
    if (defaultValue !== lastSubmittedRef.current) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setSearch(defaultValue);
      lastSubmittedRef.current = defaultValue;
    }
  }, [defaultValue]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
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
      const trimmed = sanitizedInput.trim();
      if (trimmed !== lastSubmittedRef.current) {
        lastSubmittedRef.current = trimmed;
        onSearch(trimmed);
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
      onSearch(trimmed);
    }
  };

  const clearInput = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setSearch("");
    lastSubmittedRef.current = "";
    if (onClear) onClear();
    else onSearch("");
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
};
