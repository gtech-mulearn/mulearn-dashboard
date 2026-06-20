"use client";

import { Check, Loader2, Plus, X } from "lucide-react";
import type * as React from "react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useManageInternsList, useOnboardIntern } from "@/features/intern";
import { type UserResult, useSearch } from "@/hooks/use-search";

interface OnboardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guildOptions: string[];
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function OnboardDialog({
  open,
  onOpenChange,
  guildOptions,
}: OnboardDialogProps) {
  const [onboardUser, setOnboardUser] = useState<UserResult | null>(null);
  const [onboardGuild, setOnboardGuild] = useState("");
  const [onboardStatus, setOnboardStatus] = useState("ACTIVE");
  const [popoverOpen, setPopoverOpen] = useState(false);

  const { data: internsListData } = useManageInternsList({
    page: 1,
    perPage: 1000,
  });

  const excludedMuids = useMemo(() => {
    return (internsListData?.data ?? []).map((i) => i.muid).filter(Boolean);
  }, [internsListData]);

  const { query, results, isLoading, handleSearch, clearResults } =
    useSearch(excludedMuids);

  const statusColorClass: Record<string, string> = {
    ACTIVE: "text-success",
    AT_RISK: "text-warning",
    INACTIVE: "text-muted-foreground",
  };

  const onboardMutation = useOnboardIntern();

  const handleSelectUser = (user: UserResult) => {
    setOnboardUser(user);
    clearResults();
    setPopoverOpen(false);
  };

  const handleClearUser = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOnboardUser(null);
    clearResults();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardUser) {
      toast.error("Please select a user");
      return;
    }
    if (!onboardGuild) {
      toast.error("Please select a guild");
      return;
    }
    onboardMutation.mutate(
      {
        mu_id: onboardUser.muid,
        user_id: onboardUser.id,
        guild: onboardGuild,
        status: onboardStatus,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setOnboardUser(null);
          setOnboardGuild("");
          setOnboardStatus("ACTIVE");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/95 backdrop-blur-xl border-border/60 w-full max-w-[calc(100%-2rem)] sm:max-w-md p-4 sm:p-6">
        <DialogHeader className="pr-8">
          <DialogTitle className="text-xl font-black uppercase tracking-wider text-foreground">
            Onboard Intern
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Search for a user by MUID and assign their guild and base status.
            Leave state is handled from approved leave requests.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4 w-full min-w-0">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Select User (MUID)
            </Label>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <Command
                shouldFilter={false}
                className="overflow-visible bg-transparent"
              >
                <div className="relative flex items-center">
                  <PopoverTrigger asChild>
                    {/* biome-ignore lint/a11y/useKeyWithClickEvents: trigger is handled by Popover */}
                    {/* biome-ignore lint/a11y/noStaticElementInteractions: trigger is handled by Popover */}
                    <div
                      className={`flex h-9 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                        onboardUser ? "cursor-default" : "cursor-text"
                      }`}
                      onClick={() => {
                        if (!onboardUser) {
                          setPopoverOpen(true);
                        }
                      }}
                    >
                      <span className="flex min-w-0 flex-1 items-center gap-2">
                        {onboardUser ? (
                          <span className="flex min-w-0 items-center gap-1.5 w-full">
                            <Check className="h-3.5 w-3.5 shrink-0 text-success" />
                            <span className="truncate text-sm font-semibold text-foreground">
                              {onboardUser.full_name}
                            </span>
                            <span className="shrink-0 font-mono text-xs text-muted-foreground">
                              ({onboardUser.muid})
                            </span>
                          </span>
                        ) : (
                          <input
                            type="text"
                            placeholder="Search by MUID..."
                            value={query}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full bg-transparent outline-hidden border-hidden p-0 text-sm placeholder:text-muted-foreground focus:ring-0 focus-visible:outline-hidden"
                            onFocus={() => setPopoverOpen(true)}
                          />
                        )}
                      </span>
                      {onboardUser && (
                        <span className="ml-2 w-5 shrink-0" aria-hidden />
                      )}
                    </div>
                  </PopoverTrigger>

                  {onboardUser && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm opacity-60 transition-opacity hover:opacity-100"
                      onClick={handleClearUser}
                      aria-label="Clear selection"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>

                <PopoverContent
                  className="w-[var(--radix-popover-trigger-width)] p-0"
                  align="start"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
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
                    {!isLoading &&
                      query.length >= 2 &&
                      results.length === 0 && (
                        <CommandEmpty>No users found.</CommandEmpty>
                      )}
                    {!isLoading && results.length > 0 && (
                      <CommandGroup>
                        {results.map((user) => {
                          const isSelected = onboardUser?.muid === user.muid;
                          return (
                            <CommandItem
                              key={user.id}
                              value={user.muid}
                              onSelect={() => handleSelectUser(user)}
                              className={`flex items-center justify-between gap-3 cursor-pointer p-2 ${
                                isSelected ? "bg-success/10" : ""
                              }`}
                            >
                              <div className="flex min-w-0 items-center gap-2">
                                <Avatar className="h-8 w-8 shrink-0">
                                  <AvatarImage
                                    src={user.profile_pic ?? undefined}
                                  />
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
                                    handleSelectUser(user);
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
                </PopoverContent>
              </Command>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Guild
            </Label>
            <Select value={onboardGuild} onValueChange={setOnboardGuild}>
              <SelectTrigger className="w-full h-10 font-bold uppercase text-xs border-border/40 bg-background/50">
                <SelectValue placeholder="Select Guild" />
              </SelectTrigger>
              <SelectContent className="bg-card/95 backdrop-blur-xl border-border/60">
                {guildOptions.map((g) => (
                  <SelectItem
                    key={g}
                    value={g}
                    className="font-bold uppercase text-xs"
                  >
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Initial Status
            </Label>
            <Select value={onboardStatus} onValueChange={setOnboardStatus}>
              <SelectTrigger
                className={`w-full h-10 font-bold uppercase text-xs border-border/40 bg-background/50 ${statusColorClass[onboardStatus] ?? ""}`}
              >
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent className="bg-card/95 backdrop-blur-xl border-border/60">
                <SelectItem
                  value="ACTIVE"
                  className="font-bold uppercase text-xs text-success"
                >
                  Active
                </SelectItem>
                <SelectItem
                  value="AT_RISK"
                  className="font-bold uppercase text-xs text-warning"
                >
                  At Risk
                </SelectItem>
                <SelectItem
                  value="INACTIVE"
                  className="font-bold uppercase text-xs text-muted-foreground"
                >
                  Inactive
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={onboardMutation.isPending}
              className="gap-2 text-[10px] tracking-widest h-10 shadow-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={onboardMutation.isPending}
              className="gap-2 text-[10px] tracking-widest h-10 shadow-lg"
            >
              {onboardMutation.isPending ? "Onboarding..." : "Onboard"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
