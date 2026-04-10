"use client";

import { Check, Loader2, Plus, Search, X } from "lucide-react";
import * as React from "react";
import { type UserResult, useSearch } from "@/hooks/use-search";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Badge } from "./badge";
import { Button } from "./button";
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
  /** Selected muid strings — for multi-select tag mode */
  value?: string[];
  /** Called with updated muid array in multi-select mode */
  onChange?: (muids: string[]) => void;
  /** Called with the full UserResult — for single-select / callback mode */
  onSelectUser?: (user: UserResult) => void;
  placeholder?: string;
  disabled?: boolean;
  /**
   * When true: keeps the dropdown open after selection so the selected row
   * stays visible and highlighted. Closes only on explicit clear / role
   * assignment. The trigger shows the selected user inline.
   */
  keepOpen?: boolean;
  /** Currently selected user — used to highlight the row and show in trigger */
  selectedUser?: { muid: string; name: string } | null;
  /** Called when the user explicitly clears the selection */
  onClear?: () => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

// Stable reference — prevents useSearch's useEffect from re-running on every
// render when no `value` prop is passed (new `[]` literal each time).
const EMPTY_MUIDS: string[] = [];

export function MuidSearchInput({
  value = EMPTY_MUIDS,
  onChange,
  onSelectUser,
  placeholder = "Search by muid…",
  disabled = false,
  keepOpen = false,
  selectedUser = null,
  onClear,
}: MuidSearchInputProps) {
  const [open, setOpen] = React.useState(false);
  const { query, results, isLoading, handleSearch, clearResults } =
    useSearch(value);

  const selectUser = (user: UserResult) => {
    if (onSelectUser) {
      onSelectUser(user);
      if (!keepOpen) {
        clearResults();
        setOpen(false);
      }
      // keepOpen: leave popover + results visible; selected row highlights via prop.
      return;
    }
    // multi-select tag mode
    if (onChange && !value.includes(user.muid)) {
      onChange([...value, user.muid]);
    }
    clearResults();
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClear?.();
    clearResults();
  };

  const removeTag = (index: number) => {
    onChange?.(value.filter((_, i) => i !== index));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="space-y-1.5">
        {/* Selected tags — only shown in multi-select (non-keepOpen) mode */}
        {!keepOpen && value.length > 0 && (
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

        {/* Trigger + optional clear button side-by-side in a wrapper div.
            The X button is a SIBLING of the trigger button (not nested inside)
            to avoid the invalid <button><button> HTML structure. */}
        <div className="relative flex items-center">
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              className="flex h-9 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="flex min-w-0 flex-1 items-center gap-2">
                <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                {keepOpen && selectedUser ? (
                  <span className="flex min-w-0 items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    <span className="truncate text-sm font-semibold text-foreground">
                      {selectedUser.name}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">
                      ({selectedUser.muid})
                    </span>
                  </span>
                ) : (
                  <span className="text-muted-foreground">{placeholder}</span>
                )}
              </span>
              {/* Reserve space for the X button so text doesn't overflow under it */}
              {keepOpen && selectedUser && !disabled && (
                <span className="ml-2 w-5 shrink-0" aria-hidden />
              )}
            </button>
          </PopoverTrigger>

          {/* Clear button — rendered OUTSIDE the trigger button to avoid nested <button> */}
          {keepOpen && selectedUser && !disabled && (
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm opacity-60 transition-opacity hover:opacity-100"
              onClick={handleClear}
              aria-label="Clear selection"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

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
            <CommandList className="max-h-[260px]">
              {!query && (
                <p className="p-3 text-xs text-muted-foreground">
                  Type at least 2 characters
                </p>
              )}
              {query && query.length < 2 && (
                <p className="p-3 text-xs text-muted-foreground">
                  Type at least 2 characters
                </p>
              )}
              {isLoading && query.length >= 2 && (
                <div className="flex items-center gap-2 p-3 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading
                  users...
                </div>
              )}
              {!isLoading && query.length >= 2 && results.length === 0 && (
                <CommandEmpty>No users found.</CommandEmpty>
              )}
              {!isLoading && results.length > 0 && (
                <CommandGroup>
                  {results.map((user) => {
                    const isSelected =
                      keepOpen && selectedUser?.muid === user.muid;
                    return (
                      <CommandItem
                        key={user.id}
                        value={user.muid}
                        onSelect={() => selectUser(user)}
                        className={`flex items-center justify-between gap-3 cursor-pointer p-2 ${
                          isSelected
                            ? "bg-emerald-50 dark:bg-emerald-950/30"
                            : ""
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage src={user.profile_pic ?? undefined} />
                            <AvatarFallback>
                              {getInitials(user.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {user.full_name}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {user.muid}
                            </p>
                          </div>
                        </div>
                        {isSelected ? (
                          <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-emerald-600">
                            <Check className="h-3.5 w-3.5" /> Selected
                          </span>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              selectUser(user);
                            }}
                          >
                            <Plus className="mr-1 h-3.5 w-3.5" /> Add
                          </Button>
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </div>
    </Popover>
  );
}
