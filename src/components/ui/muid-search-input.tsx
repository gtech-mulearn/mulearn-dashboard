"use client";

import { Loader2, Search, X } from "lucide-react";
import * as React from "react";
import { type UserResult, useSearch } from "@/hooks/use-search";
import { Badge } from "./badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface MuidSearchInputProps {
  value: string[];
  onChange: (muids: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MuidSearchInput({
  value,
  onChange,
  placeholder = "Search by muid…",
  disabled = false,
}: MuidSearchInputProps) {
  const [open, setOpen] = React.useState(false);
  const { query, results, isLoading, handleSearch, clearResults } =
    useSearch(value);

  const selectUser = (user: UserResult) => {
    if (!value.includes(user.muid)) {
      onChange([...value, user.muid]);
    }
    clearResults();
    setOpen(false);
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="space-y-1.5">
        {/* Selected tags */}
        {value.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {value.map((muid, i) => (
              <Badge key={muid} variant="secondary" className="gap-1 pr-1">
                {muid}
                {!disabled && (
                  <button
                    type="button"
                    className="rounded-sm opacity-60 transition-opacity hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTag(i);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
        )}

        {/* Trigger */}
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5" />
              {placeholder}
            </span>
          </button>
        </PopoverTrigger>

        {/* Dropdown */}
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Type to search…"
              value={query}
              onValueChange={handleSearch}
            />
            <CommandList className="max-h-[180px]">
              {isLoading && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
              {!isLoading && query && results.length === 0 && (
                <CommandEmpty>No users found.</CommandEmpty>
              )}
              {!isLoading && results.length > 0 && (
                <CommandGroup>
                  {results.map((user) => (
                    <CommandItem
                      key={user.id}
                      value={user.muid}
                      onSelect={() => selectUser(user)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <span className="font-medium">{user.full_name}</span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {user.muid}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </div>
    </Popover>
  );
}
