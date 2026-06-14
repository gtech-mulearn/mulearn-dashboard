"use client";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

type Props = {
  onSearch: (data: string) => void;
  placeholder: string;
  onClear?: () => void;
  size: "sm" | "md" | "lg";
  className?: string;
  showButton: boolean;
  inputClassName?: string;
  debounceDelay?: number;
};

export const SearchBar = ({
  onSearch,
  placeholder,
  onClear,
  size,
  className,
  showButton,
  inputClassName,
  debounceDelay = 500,
}: Props) => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, debounceDelay);

  const sizeClass =
    size === "sm"
      ? "h-9 text-sm"
      : size === "lg"
        ? "h-11 text-base"
        : "h-10 text-sm";

  // Fire onSearch automatically when debounced value changes (no button)
  useEffect(() => {
    if (!showButton) {
      onSearch(debouncedSearch.trim());
    }
  }, [debouncedSearch, showButton, onSearch]);

  const onChangeSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedInput = event.target.value.replace(/[<>/]/g, "");
    setSearch(sanitizedInput);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSearch(search.trim()); // immediate on explicit submit
  };

  const clearInput = () => {
    setSearch("");
    if (onClear) onClear();
    else onSearch("");
  };

  return (
    <form
      className={cn("flex w-full items-center gap-2", className)}
      onSubmit={handleSubmit}
    >
      <div className="relative flex-1">
        <Input
          type="text"
          placeholder={placeholder}
          onChange={onChangeSearch}
          value={search}
          className={cn(
            "rounded-xl border-border/60 pr-9",
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
