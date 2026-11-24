"use client";

import { Check, Loader2, Plus, Search, Sparkles, X } from "lucide-react";
import * as React from "react";
import {
  type SkillResult,
  type SkillSearchOptions,
  useSkillSearch,
} from "@/hooks/use-skill-search";
import { Badge } from "./badge";
import { Button } from "./button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export type { SkillResult } from "@/hooks/use-skill-search";

interface SkillSearchInputProps {
  /** Selected skills — for multi-select tag mode */
  value?: SkillResult[];
  /** Called with updated skill array in multi-select mode */
  onChange?: (skills: SkillResult[]) => void;
  /** Called with the picked skill — for single-select / callback mode */
  onSelectSkill?: (skill: SkillResult) => void;
  placeholder?: string;
  disabled?: boolean;
  /**
   * When true: keeps the dropdown open after selection so the selected row
   * stays visible and highlighted. The trigger shows the selected skill inline.
   */
  keepOpen?: boolean;
  /** Currently selected skill — used to highlight the row and show in trigger */
  selectedSkill?: Pick<SkillResult, "id" | "name" | "code"> | null;
  /** Called when the user explicitly clears the selection */
  onClear?: () => void;
  /** Options passed to useSkillSearch (excludedIds merged with `value`) */
  searchOptions?: SkillSearchOptions;
  /**
   * Show a "Create skill" option when no skill matches the query. Creation
   * hits POST /skill/create/ which is ADMIN-only — pass only for admins.
   * Default false.
   */
  creatable?: boolean;
  /** Called after a skill is created (before it is selected) */
  onCreated?: (skill: SkillResult) => void;
  /** Multi-select cap — trigger disables once reached (tags stay removable) */
  maxSelected?: number;
}

// Stable reference — avoids re-running the search effect on every render.
const EMPTY_SKILLS: SkillResult[] = [];

export function SkillSearchInput({
  value = EMPTY_SKILLS,
  onChange,
  onSelectSkill,
  placeholder = "Search skills…",
  disabled = false,
  keepOpen = false,
  selectedSkill = null,
  onClear,
  creatable = false,
  onCreated,
  searchOptions,
  maxSelected,
}: SkillSearchInputProps) {
  const [open, setOpen] = React.useState(false);
  const atMax = maxSelected !== undefined && value.length >= maxSelected;

  const mergedOptions = React.useMemo<SkillSearchOptions>(
    () => ({
      ...searchOptions,
      excludedIds: searchOptions?.excludedIds ?? value.map((s) => s.id),
      excludedNames: searchOptions?.excludedNames ?? value.map((s) => s.name),
    }),
    [searchOptions, value],
  );

  const {
    query,
    results,
    isLoading,
    isSettled,
    isCreating,
    hasExactMatch,
    handleSearch,
    clearResults,
    createSkill,
  } = useSkillSearch(mergedOptions);

  const trimmedQuery = query.trim();
  const showCreate =
    creatable && !disabled && !!trimmedQuery && isSettled && !hasExactMatch;

  const selectSkill = (skill: SkillResult) => {
    if (onSelectSkill) {
      onSelectSkill(skill);
      if (!keepOpen) {
        clearResults();
        setOpen(false);
      }
      return;
    }
    // multi-select tag mode
    if (onChange && !value.some((s) => s.id === skill.id)) {
      onChange([...value, skill]);
    }
    clearResults();
    setOpen(false);
  };

  const handleCreate = async () => {
    if (!trimmedQuery || isCreating) return;
    const created = await createSkill(trimmedQuery);
    if (!created) return;
    onCreated?.(created);
    selectSkill(created);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClear?.();
    clearResults();
  };

  const removeTag = (id: string) => {
    onChange?.(value.filter((s) => s.id !== id));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="space-y-1.5">
        {/* Selected tags — only shown in multi-select (non-keepOpen) mode */}
        {!keepOpen && value.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {value.map((skill) => (
              <Badge key={skill.id} variant="secondary" className="gap-1 pr-1">
                {skill.name}
                {!disabled && (
                  <button
                    type="button"
                    className="rounded-sm opacity-60 transition-opacity hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTag(skill.id);
                    }}
                    aria-label={`Remove ${skill.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
        )}

        {/* Trigger + clear button as siblings (avoid nested <button>) */}
        <div className="relative flex items-center">
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled || atMax}
              className="flex h-9 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="flex min-w-0 flex-1 items-center gap-2">
                <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                {keepOpen && selectedSkill ? (
                  <span className="flex min-w-0 items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 shrink-0 text-success" />
                    <span className="truncate text-sm font-semibold text-foreground">
                      {selectedSkill.name}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">
                      ({selectedSkill.code})
                    </span>
                  </span>
                ) : (
                  <span className="text-muted-foreground">{placeholder}</span>
                )}
              </span>
              {keepOpen && selectedSkill && !disabled && (
                <span className="ml-2 w-5 shrink-0" aria-hidden />
              )}
            </button>
          </PopoverTrigger>

          {keepOpen && selectedSkill && !disabled && (
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
              {!trimmedQuery && (
                <p className="p-3 text-xs text-muted-foreground">
                  Start typing to search skills
                </p>
              )}
              {trimmedQuery && isLoading && (
                <div className="flex items-center gap-2 p-3 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading
                  skills...
                </div>
              )}
              {trimmedQuery &&
                isSettled &&
                results.length === 0 &&
                !showCreate && (
                  <p className="p-3 text-xs text-muted-foreground">
                    No skills found.
                  </p>
                )}
              {!isLoading && results.length > 0 && (
                <CommandGroup>
                  {results.map((skill) => {
                    const isSelected =
                      keepOpen && selectedSkill?.id === skill.id;
                    return (
                      <CommandItem
                        key={skill.id}
                        value={skill.id}
                        onSelect={() => selectSkill(skill)}
                        className={`flex cursor-pointer items-center justify-between gap-3 p-2 ${
                          isSelected ? "bg-success/10" : ""
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {skill.name}
                          </p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {skill.code}
                          </p>
                        </div>
                        {isSelected ? (
                          <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-success">
                            <Check className="h-3.5 w-3.5" /> Selected
                          </span>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              selectSkill(skill);
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
              {showCreate && (
                <CommandGroup>
                  <CommandItem
                    value={`__create__${trimmedQuery}`}
                    onSelect={handleCreate}
                    disabled={isCreating}
                    className="flex cursor-pointer items-center gap-2 p-2"
                  >
                    {isCreating ? (
                      <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" />
                    )}
                    <span className="truncate text-sm">
                      Create skill{" "}
                      <span className="font-semibold">"{trimmedQuery}"</span>
                    </span>
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </div>
    </Popover>
  );
}
