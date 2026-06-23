"use client";

import { Check, Plus, Search, X } from "lucide-react";
import type * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useDebounce } from "@/hooks/use-debounce";
import { getApiResponseError } from "@/hooks/use-get-error";
import type { UserResult } from "@/hooks/use-search";
import {
  useManageInternsList,
  useOnboardIntern,
} from "../hooks/use-manage-interns";

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

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { data: internsListData } = useManageInternsList({
    page: 1,
    perPage: 1000,
  });

  const excludedMuids = useMemo(() => {
    return (internsListData?.data ?? []).map((i) => i.muid).filter(Boolean);
  }, [internsListData]);

  // Serialize and stabilize excludedMuids to prevent reference changes from triggering useEffect
  const serializedExcluded = excludedMuids.join(",");
  const stableExcluded = useMemo(() => {
    return [...excludedMuids];
  }, [serializedExcluded]);

  useEffect(() => {
    let cancelled = false;
    setIsSearchLoading(true);

    const params = new URLSearchParams({
      search: debouncedSearchQuery.trim(),
      perPage: "15",
      pageIndex: "1",
      sortBy: "",
    });

    apiClient
      .get<{ data: UserResult[] }>(`${endpoints.search.users}?${params}`)
      .then((response) => {
        if (!cancelled) {
          const users = response.data ?? [];
          setSearchResults(
            users.filter((u) => !stableExcluded.includes(u.muid)),
          );
        }
      })
      .catch((error) => {
        if (!cancelled) {
          toast.error(
            getApiResponseError(error, { fallback: "Search failed" }),
          );
          setSearchResults([]);
        }
      })
      .finally(() => {
        if (!cancelled) setIsSearchLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearchQuery, stableExcluded]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  const statusColorClass: Record<string, string> = {
    ACTIVE: "text-success",
    AT_RISK: "text-warning",
    INACTIVE: "text-muted-foreground",
  };

  const onboardMutation = useOnboardIntern();

  const handleSelectUser = (user: UserResult) => {
    setOnboardUser(user);
    clearSearch();
    setPopoverOpen(false);
  };

  const handleClearUser = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOnboardUser(null);
    clearSearch();
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
      <DialogContent
        className="bg-card/95 backdrop-blur-xl border-border/60 w-full max-w-[calc(100%-2rem)] sm:max-w-md p-4 sm:p-6 rounded-2xl max-h-[calc(100vh-2rem)] flex flex-col"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="pr-8">
          <DialogTitle className="text-xl font-black uppercase tracking-wider text-foreground">
            Onboard Intern
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Search for a user by MUID and assign their guild and base status.
            Leave state is handled from approved leave requests.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 w-full">
          <div className="space-y-5 pt-2 my-2 pr-1 overflow-y-auto w-full min-w-0 flex-1">
            {/* Select User (MUID) */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Select User (MUID) <span className="text-destructive">*</span>
              </Label>
              {onboardUser ? (
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-brand-blue/10 to-brand-blue/5 border border-brand-blue/20 rounded-2xl shadow-sm transition-all duration-300">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <Avatar className="h-12 w-12 shrink-0 shadow-inner">
                      <AvatarImage src={onboardUser.profile_pic ?? undefined} />
                      <AvatarFallback className="bg-brand-blue/20 text-base font-black text-brand-blue">
                        {getInitials(onboardUser.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-foreground truncate">
                        {onboardUser.full_name}
                      </p>
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate flex items-center gap-1.5 mt-0.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-blue/60" />
                        @{onboardUser.muid}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClearUser}
                    className="text-xs font-bold text-muted-foreground hover:text-destructive hover:border-destructive/30 shrink-0 px-3.5 h-9 rounded-xl transition-all duration-200"
                  >
                    Change User
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                  <Input
                    placeholder="Search intern by name or MUID..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => setPopoverOpen(true)}
                    onBlur={() => {
                      setTimeout(() => setPopoverOpen(false), 200);
                    }}
                    className="pl-11 h-11 bg-background/50 border-border/50 font-medium rounded-xl focus-visible:ring-brand-blue transition-all duration-200"
                  />
                  {isSearchLoading && (
                    <Spinner className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-blue animate-spin" />
                  )}
                  {popoverOpen && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-card/95 backdrop-blur-md border border-border/40 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto animate-in fade-in-50 slide-in-from-top-2 duration-200">
                      {searchResults.length === 0 && !isSearchLoading ? (
                        <p className="p-3 text-xs text-muted-foreground text-center">
                          No users found.
                        </p>
                      ) : (
                        searchResults.map((user) => {
                          const isSelected =
                            (onboardUser as UserResult | null)?.muid ===
                            user.muid;
                          return (
                            <button
                              key={user.id}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelectUser(user);
                              }}
                              className={`w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-brand-blue/5 text-left transition-colors border-b border-border/10 last:border-0 ${
                                isSelected ? "bg-success/10" : ""
                              }`}
                            >
                              <div className="flex min-w-0 items-center gap-2.5">
                                <Avatar className="h-8 w-8 shrink-0">
                                  <AvatarImage
                                    src={user.profile_pic ?? undefined}
                                  />
                                  <AvatarFallback>
                                    {getInitials(user.full_name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-bold text-foreground">
                                    {user.full_name}
                                  </p>
                                  <p className="text-xs text-muted-foreground font-mono">
                                    @{user.muid}
                                  </p>
                                </div>
                              </div>
                              {isSelected && (
                                <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-success">
                                  <Check className="h-3.5 w-3.5" /> Selected
                                </span>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Guild */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Guild
              </Label>
              <Select value={onboardGuild} onValueChange={setOnboardGuild}>
                <SelectTrigger className="w-full h-10 font-bold uppercase text-xs border-border/40 bg-background/50 rounded-xl">
                  <SelectValue placeholder="Select Guild" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  className="bg-card/95 backdrop-blur-xl border-border/60 rounded-xl"
                >
                  {guildOptions.map((g) => (
                    <SelectItem
                      key={g}
                      value={g}
                      className="font-bold uppercase text-xs text-foreground"
                    >
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Initial Status */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Initial Status
              </Label>
              <Select value={onboardStatus} onValueChange={setOnboardStatus}>
                <SelectTrigger
                  className={`w-full h-10 font-bold uppercase text-xs border-border/40 bg-background/50 rounded-xl ${statusColorClass[onboardStatus] ?? ""}`}
                >
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  className="bg-card/95 backdrop-blur-xl border-border/60 rounded-xl"
                >
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
          </div>

          <DialogFooter className="pt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={onboardMutation.isPending}
              className="gap-2 text-[10px] tracking-widest h-10 shadow-lg rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={onboardMutation.isPending}
              className="gap-2 text-[10px] tracking-widest h-10 shadow-lg rounded-full bg-brand-blue text-primary-foreground hover:bg-brand-blue/90"
            >
              {onboardMutation.isPending ? "Onboarding..." : "Onboard"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
