"use client";
import { useState } from "react";
import { HiOutlineX } from "react-icons/hi";
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
};

export const SearchBar = ({
  onSearch,
  placeholder,
  onClear,
  size,
  className,
  showButton,
  inputClassName,
}: Props) => {
  const [search, setSearch] = useState("");

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
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSearch(search.trim());
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
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            onClick={clearInput}
          >
            <HiOutlineX />
          </button>
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
