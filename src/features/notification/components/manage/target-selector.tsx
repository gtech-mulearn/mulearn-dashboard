"use client";

import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTargetOptions } from "../../hooks";
import {
  TARGET_TYPE_LABELS,
  TARGET_TYPES,
  type TargetType,
} from "../../schemas";

interface TargetSelectorProps {
  targetType: TargetType;
  targetId: string | null | undefined;
  onTargetTypeChange: (type: TargetType) => void;
  onTargetIdChange: (id: string | null) => void;
  disabled?: boolean;
}

export function TargetSelector({
  targetType,
  targetId,
  onTargetTypeChange,
  onTargetIdChange,
  disabled,
}: TargetSelectorProps) {
  const [comboOpen, setComboOpen] = useState(false);
  const { data: options, isLoading } = useTargetOptions(
    targetType !== "global" ? targetType : undefined,
  );

  const selectedOption = options?.find((o) => o.id === targetId);

  function handleTypeChange(val: string) {
    onTargetTypeChange(val as TargetType);
    onTargetIdChange(null);
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Target Audience</Label>
        <Select
          value={targetType}
          onValueChange={handleTypeChange}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select audience" />
          </SelectTrigger>
          <SelectContent>
            {TARGET_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {TARGET_TYPE_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {targetType !== "global" && (
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">
            {TARGET_TYPE_LABELS[targetType]}
          </Label>
          <Popover open={comboOpen} onOpenChange={setComboOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                disabled={disabled || isLoading}
                className="w-full justify-between font-normal"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </span>
                ) : selectedOption ? (
                  selectedOption.name
                ) : (
                  <span className="text-muted-foreground">
                    Select {TARGET_TYPE_LABELS[targetType].toLowerCase()}...
                  </span>
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput placeholder="Search..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {(options ?? []).map((opt) => (
                      <CommandItem
                        key={opt.id}
                        value={opt.name}
                        onSelect={() => {
                          onTargetIdChange(opt.id);
                          setComboOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            targetId === opt.id ? "opacity-100" : "opacity-0",
                          )}
                        />
                        {opt.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {targetType === "campus_ig" && (
            <p className="text-xs text-muted-foreground">
              Shows IG chapters for your campus only.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
