"use client";

import { Check } from "lucide-react";
import { useEffect, useRef } from "react";
import type { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { ManageUserFormValues, UiOption } from "../schemas";

interface LocationSearchDropdownProps {
  control: Control<ManageUserFormValues>;
  isBusy: boolean;
  locationSearch: string;
  isLocationMenuOpen: boolean;
  isLocationFetching: boolean;
  locationOptions: UiOption[];
  onLocationSearchChange: (value: string) => void;
  onLocationMenuOpenChange: (value: boolean) => void;
}

export function LocationSearchDropdown({
  control,
  isBusy,
  locationSearch,
  isLocationMenuOpen,
  isLocationFetching,
  locationOptions,
  onLocationSearchChange,
  onLocationMenuOpenChange,
}: LocationSearchDropdownProps) {
  const locationMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!locationMenuRef.current) return;
      if (!locationMenuRef.current.contains(event.target as Node)) {
        onLocationMenuOpenChange(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [onLocationMenuOpenChange]);

  return (
    <div className="space-y-2" ref={locationMenuRef}>
      <FormField
        control={control}
        name="location_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Search & Select Location</FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  value={locationSearch}
                  onFocus={() => onLocationMenuOpenChange(true)}
                  onChange={(event) => {
                    onLocationSearchChange(event.target.value);
                    onLocationMenuOpenChange(true);
                  }}
                  placeholder="Type location and select from dropdown"
                  disabled={isBusy}
                />
                {isLocationMenuOpen && (
                  <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-md">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded px-2 py-2 text-left text-sm hover:bg-muted"
                      onClick={() => {
                        field.onChange("");
                        onLocationMenuOpenChange(false);
                      }}
                    >
                      <span>None</span>
                      {!field.value && (
                        <Check className="size-4 text-muted-foreground" />
                      )}
                    </button>
                    {isLocationFetching && (
                      <div className="px-2 py-2 text-sm text-muted-foreground">
                        Searching...
                      </div>
                    )}
                    {!isLocationFetching && locationOptions.length === 0 && (
                      <div className="px-2 py-2 text-sm text-muted-foreground">
                        No location found
                      </div>
                    )}
                    {!isLocationFetching &&
                      locationOptions.map((option) => {
                        const selected = field.value === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            className="flex w-full items-center justify-between rounded px-2 py-2 text-left text-sm hover:bg-muted"
                            onClick={() => {
                              field.onChange(option.value);
                              onLocationSearchChange(option.label);
                              onLocationMenuOpenChange(false);
                            }}
                          >
                            <span>{option.label}</span>
                            {selected && (
                              <Check className="size-4 text-muted-foreground" />
                            )}
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>
            </FormControl>
            <p className="text-xs text-muted-foreground">
              Selected location id: {field.value || "None"}
            </p>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
