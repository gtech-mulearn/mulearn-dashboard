"use client";

import {
  CheckCircle2,
  Loader2,
  Search,
  Send,
  ShieldOff,
  X,
} from "lucide-react";
import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useSearch } from "@/hooks/use-search";
import {
  useManualIssue,
  useRevokeAchievement,
} from "../hooks/use-achievement-mutations";
import {
  ACHIEVEMENT_KEYS,
  useAchievementQueryClient,
  useAllAchievementsForUser,
} from "../hooks/use-achievements";
import type { UserAchievement } from "../schemas";
import { AchievementIcon } from "./achievement-icon";

// ─────────────────────────────────────────────────────────────────────────────
// Action Dialog
// ─────────────────────────────────────────────────────────────────────────────

interface ActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: "issue" | "revoke" | null;
  achievement: UserAchievement | null;
  muid: string;
  userId: string;
  onSuccess: () => void;
}

function ActionDialog({
  open,
  onOpenChange,
  action,
  achievement,
  muid,
  userId,
  onSuccess,
}: ActionDialogProps) {
  const [message, setMessage] = React.useState("");
  const issueMutation = useManualIssue();
  const revokeMutation = useRevokeAchievement();
  const queryClient = useAchievementQueryClient();

  const isPending = issueMutation.isPending || revokeMutation.isPending;
  const isIssue = action === "issue";

  const handleSubmit = () => {
    if (!achievement || !muid) return;

    if (isIssue) {
      issueMutation.mutate(
        { muid, achievement_id: achievement.id },
        {
          onSuccess: () => {
            setMessage("");
            onOpenChange(false);
            queryClient.invalidateQueries({
              queryKey: ACHIEVEMENT_KEYS.allForUser(userId),
            });
            onSuccess();
          },
        },
      );
    } else {
      revokeMutation.mutate(
        {
          muid,
          achievement_id: achievement.id,
          reason: message.trim() || undefined,
        },
        {
          onSuccess: () => {
            setMessage("");
            onOpenChange(false);
            queryClient.invalidateQueries({
              queryKey: ACHIEVEMENT_KEYS.allForUser(userId),
            });
            onSuccess();
          },
        },
      );
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!isPending) {
          setMessage("");
          onOpenChange(v);
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isIssue ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            ) : (
              <ShieldOff className="h-5 w-5 text-destructive" />
            )}
            {isIssue ? "Issue Achievement" : "Revoke Achievement"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg border bg-muted/40 p-4 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              Achievement
            </p>
            <p className="font-semibold">{achievement?.name}</p>
            {achievement?.description && (
              <p className="text-sm text-muted-foreground">
                {achievement.description}
              </p>
            )}
          </div>

          {!isIssue && (
            <div className="space-y-2">
              <Label htmlFor="action-message">
                Reason for revocation (optional)
              </Label>
              <Textarea
                id="action-message"
                placeholder="Why is this achievement being revoked?"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isPending}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setMessage("");
              onOpenChange(false);
            }}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant={isIssue ? "default" : "destructive"}
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending
              ? isIssue
                ? "Issuing..."
                : "Revoking..."
              : isIssue
                ? "Confirm Issue"
                : "Confirm Revoke"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Achievement Row Card
// ─────────────────────────────────────────────────────────────────────────────

interface AchievementRowProps {
  achievement: UserAchievement;
  onIssue?: (a: UserAchievement) => void;
  onRevoke?: (a: UserAchievement) => void;
}

function AchievementRow({
  achievement,
  onIssue,
  onRevoke,
}: AchievementRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border p-3 hover:bg-muted/40 transition-colors">
      <div className="flex items-center gap-3 min-w-0 w-full">
        {/* Icon — use shared AchievementIcon which correctly handles /media/ prefix */}
        <div className="shrink-0">
          <AchievementIcon
            imageUrl={achievement.icon_url ?? achievement.icon}
            name={achievement.name}
            size={40}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm truncate block">
              {achievement.name}
            </span>
            {achievement.type && (
              <Badge variant="secondary" className="text-xs shrink-0">
                {achievement.type}
              </Badge>
            )}
          </div>
          {achievement.description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {achievement.description}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 min-w-0">
        {!achievement.has_achievement ? (
          <Button
            size="sm"
            variant="outline"
            className="flex-1 sm:flex-none text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
            onClick={() => onIssue?.(achievement)}
            data-testid={`issue-btn-${achievement.id}`}
          >
            Issue
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="flex-1 sm:flex-none text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={() => onRevoke?.(achievement)}
            data-testid={`revoke-btn-${achievement.id}`}
          >
            Revoke
          </Button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Panel
// ─────────────────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function IssueRevokePanel() {
  const [selectedUser, setSelectedUser] = React.useState<{
    id: string; // UUID — used with GET /list/?user_id=<uuid>
    muid: string;
    name: string;
    profile_pic?: string | null;
  } | null>(null);
  const userId = selectedUser?.id ?? "";
  const muid = selectedUser?.muid ?? "";

  // Use the correct endpoint: returns ALL achievements with has_achievement flag
  const { data: achievements = [], isLoading: isLoadingAchievements } =
    useAllAchievementsForUser(userId);

  const [search, setSearch] = React.useState("");
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const {
    results: searchResults,
    isLoading: isSearching,
    handleSearch,
    clearResults,
  } = useSearch();

  // Dialog state
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogAction, setDialogAction] = React.useState<
    "issue" | "revoke" | null
  >(null);
  const [dialogAchievement, setDialogAchievement] =
    React.useState<UserAchievement | null>(null);

  const [selectedType, setSelectedType] = React.useState<string>("all");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all");

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset filters when user changes
  React.useEffect(() => {
    setSelectedType("all");
    setSelectedStatus("all");
    setSearch("");
  }, [userId]);

  const uniqueTypes = React.useMemo(() => {
    const list = Array.isArray(achievements) ? achievements : [];
    const typesSet = new Set<string>();
    for (const a of list) {
      if (a.type?.trim()) {
        typesSet.add(a.type.trim());
      }
    }
    return Array.from(typesSet).sort();
  }, [achievements]);

  const filteredAchievements = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = Array.isArray(achievements) ? achievements : [];
    return list.filter((a) => {
      const matchesSearch =
        a.name.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.type?.toLowerCase().includes(q);

      const matchesType =
        selectedType === "all" ||
        a.type?.trim().toLowerCase() === selectedType.toLowerCase();

      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "issued" && a.has_achievement) ||
        (selectedStatus === "unissued" && !a.has_achievement);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [achievements, search, selectedType, selectedStatus]);

  const openDialog = (
    action: "issue" | "revoke",
    achievement: UserAchievement,
  ) => {
    setDialogAction(action);
    setDialogAchievement(achievement);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6" data-testid="issue-revoke-panel">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Issue / Revoke</h2>
        <p className="text-sm text-muted-foreground">
          Select a user to view all achievements, then issue or revoke
          individually.
        </p>
      </div>

      {/* User Search */}
      <div className="max-w-md space-y-2">
        <Label>Select User</Label>
        {!selectedUser ? (
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
                setSearchOpen(e.target.value.length >= 2);
              }}
              onFocus={() => {
                if (searchQuery.length >= 2) setSearchOpen(true);
              }}
              onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
              placeholder="Search by name or MUID..."
              className="pl-11 h-11 bg-background/50 border-border/50 font-medium rounded-xl focus-visible:ring-brand-blue transition-all duration-200"
            />
            {searchOpen && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-md">
                {isSearching && (
                  <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                    <Loader2 className="size-3.5 animate-spin" /> Searching…
                  </div>
                )}
                {!isSearching && searchResults.length === 0 && (
                  <p className="px-3 py-2 text-sm text-muted-foreground">
                    No users found.
                  </p>
                )}
                {!isSearching &&
                  searchResults.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setSelectedUser({
                          id: user.id,
                          muid: user.muid,
                          name: user.full_name,
                          profile_pic: user.profile_pic,
                        });
                        setSearchQuery("");
                        clearResults();
                        setSearchOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-muted/60 transition-colors"
                    >
                      <Avatar className="size-8 shrink-0">
                        <AvatarImage src={user.profile_pic ?? undefined} />
                        <AvatarFallback>
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {user.full_name}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {user.muid}
                        </p>
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
            <Avatar className="size-9 shrink-0">
              <AvatarImage src={selectedUser.profile_pic ?? undefined} />
              <AvatarFallback>{getInitials(selectedUser.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {selectedUser.name}
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                {selectedUser.muid}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-lg shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={() => {
                setSelectedUser(null);
                setSearchQuery("");
              }}
            >
              <X className="size-4" />
              <span className="sr-only">Clear user selection</span>
            </Button>
          </div>
        )}
      </div>

      {/* Placeholder empty state when no user is selected */}
      {!selectedUser && (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed rounded-3xl bg-muted/10 space-y-3 mt-6">
          <Send
            className="size-12 text-muted-foreground/60"
            aria-hidden="true"
          />
          <h3 className="text-lg font-semibold text-foreground">
            Issue or Revoke Achievements
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Select a user above to view their achievements and manually issue or
            revoke them.
          </p>
        </div>
      )}

      {/* Achievement List — shown only after user is selected */}
      {selectedUser && (
        <>
          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-semibold text-foreground">
                Achievements List
              </span>
              <span className="text-xs text-muted-foreground">
                {filteredAchievements.length} of {achievements?.length ?? 0}
              </span>
            </div>

            {/* Filters (Search, Type, & Status Select) */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
              {/* Search Filter */}
              <Input
                placeholder="Filter achievements by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1"
                data-testid="achievement-filter-input"
              />

              {/* Type Filter */}
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full sm:w-[150px] shrink-0">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-[150px] shrink-0">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="issued">Already Issued</SelectItem>
                  <SelectItem value="unissued">Available to Issue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* List */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {isLoadingAchievements ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: static skeletons
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              ) : filteredAchievements.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  {search
                    ? "No achievements match your filter."
                    : "No achievements found."}
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredAchievements.map((achievement) => (
                    <AchievementRow
                      key={achievement.id}
                      achievement={achievement}
                      onIssue={(a) => openDialog("issue", a)}
                      onRevoke={(a) => openDialog("revoke", a)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Action Dialog */}
      <ActionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        action={dialogAction}
        achievement={dialogAchievement}
        muid={muid}
        userId={userId}
        onSuccess={() => {
          // Optionally reset state after success
        }}
      />
    </div>
  );
}
