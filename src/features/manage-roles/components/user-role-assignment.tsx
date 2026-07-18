"use client";

import { Check, Loader2, Search, UserMinus, UserPlus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInterestGroupsList } from "@/features/interest-groups";
import { useGuilds } from "@/features/intern";
import { useColleges } from "@/features/onboarding";
import { useDebounce } from "@/hooks/use-debounce";
import type { BulkAssignExtraPayload } from "../api/manage-roles.api";
import {
  useAssignUserRole,
  useBulkAssignRole,
  useBulkRemoveRole,
  useBulkRoleUsers,
  useRemoveUserRole,
  useRoleUserSearch,
} from "../hooks/use-role-users";
import type { Role, RoleUser } from "../schemas";

interface UserRoleAssignmentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
}

// ─── Single Tab ───────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function SingleTab({ role }: { role: Role }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<RoleUser | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 350);
  const assignMutation = useAssignUserRole(role.id);
  const removeMutation = useRemoveUserRole(role.id);

  // Search all users in the system via the global user search API
  const { data: searchData, isLoading } = useRoleUserSearch(debouncedQuery, 30);
  const results: RoleUser[] = (searchData?.data ?? []).map((u) => ({
    id: String(u.id),
    full_name: u.full_name,
    muid: u.muid,
  }));

  // Extra details state
  const [guild, setGuild] = useState("");
  const [mentorTier, setMentorTier] = useState("");
  const [selectedIgs, setSelectedIgs] = useState<string[]>([]);
  const [orgId, setOrgId] = useState("");

  const lowerTitle = role.title.toLowerCase();
  const isIntern = lowerTitle.includes("intern");
  const isMentor = lowerTitle.includes("mentor");

  // Sync: Reset form fields when selectedUser or role changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional reactive reset; setters are stable; orgId read to conditionally clear
  useEffect(() => {
    setGuild("");
    setMentorTier("");
    setSelectedIgs([]);
    orgId && setOrgId("");
  }, [selectedUser?.id, role.id, orgId]);

  // Sync: Reset IG/org selections when mentorTier changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional reactive reset — must re-run when mentorTier changes
  useEffect(() => {
    setSelectedIgs([]);
    setOrgId("");
  }, [mentorTier]);

  // Queries for dynamic dropdowns (enabled conditionally based on role/tier)
  const { data: colleges = [], isLoading: isLoadingColleges } = useColleges();
  const { data: igsResponse, isLoading: isLoadingIgs } =
    useInterestGroupsList();
  const { data: guilds = [], isLoading: isLoadingGuilds } = useGuilds();

  // Map guilds to Combobox options format
  const guildOptions = useMemo(() => {
    return guilds.map((guildName) => ({
      id: guildName,
      title: guildName,
    }));
  }, [guilds]);

  // Map IGs to MultiSelect options format
  const igOptions = useMemo(() => {
    const list = igsResponse?.response?.interestGroup || [];
    return list.map((ig) => ({
      value: ig.id,
      label: ig.name || ig.code || "Unnamed Group",
    }));
  }, [igsResponse]);

  // Validation
  const isExtraValid = useMemo(() => {
    if (!selectedUser) return false;
    if (isIntern && isMentor) {
      const guildOk = guild.trim().length > 0;
      const tierOk =
        mentorTier === "IG_MENTOR"
          ? selectedIgs.length > 0
          : mentorTier === "CAMPUS_MENTOR"
            ? orgId.trim().length > 0
            : false;
      return guildOk && tierOk;
    }
    if (isIntern) return guild.trim().length > 0;
    if (isMentor) {
      if (mentorTier === "IG_MENTOR") return selectedIgs.length > 0;
      if (mentorTier === "CAMPUS_MENTOR") return orgId.trim().length > 0;
      return false;
    }
    return true; // Not special role
  }, [selectedUser, isIntern, isMentor, guild, mentorTier, selectedIgs, orgId]);

  const handleSelect = (user: RoleUser) => {
    setSelectedUser(user);
    setQuery("");
    setOpen(false);
  };

  const handleAssign = () => {
    if (!selectedUser || !isExtraValid) return;

    const extra: Record<string, any> = {};
    if (isIntern) {
      extra.guild = guild.trim();
    }
    if (isMentor) {
      extra.mentor_tier = mentorTier;
      if (mentorTier === "IG_MENTOR") {
        extra.ig_ids = selectedIgs;
      } else if (mentorTier === "CAMPUS_MENTOR") {
        extra.org_id = orgId;
      }
    }

    assignMutation.mutate(
      { user_id: selectedUser.id, role_id: role.id, ...extra },
      { onSuccess: () => setSelectedUser(null) },
    );
  };

  const handleRemove = () => {
    if (!selectedUser) return;
    removeMutation.mutate(
      { user_id: selectedUser.id, role_id: role.id },
      { onSuccess: () => setSelectedUser(null) },
    );
  };
  return (
    <div className="space-y-4">
      {/* Single search input */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(e.target.value.length >= 2);
          }}
          onFocus={() => {
            if (query.length >= 2) setOpen(true);
          }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search by name or MUID…"
          className="pl-11 h-11 bg-background/50 border-border/50 font-medium rounded-xl focus-visible:ring-brand-blue transition-all duration-200"
        />
      </div>

      {/* Search results — rendered in normal flow so they don't overlay buttons */}
      {open && (
        <div className="overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-md max-h-52 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" /> Searching…
            </div>
          )}
          {!isLoading && results.length === 0 && (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              No users found.
            </p>
          )}
          {!isLoading &&
            results.map((user) => (
              <button
                key={user.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(user)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-muted/60 transition-colors"
              >
                <Avatar className="size-8 shrink-0">
                  <AvatarFallback>
                    {getInitials(user.full_name ?? "")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {user.full_name || "—"}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {user.muid}
                  </p>
                </div>
              </button>
            ))}
        </div>
      )}

      {/* Selected user card */}
      {selectedUser && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2">
          <Avatar className="size-8 shrink-0">
            <AvatarFallback>
              {getInitials(selectedUser.full_name ?? "")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {selectedUser.full_name || "—"}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              {selectedUser.muid}
            </p>
          </div>
          <Check className="size-4 shrink-0 text-success" />
        </div>
      )}

      {/* Inline extra assignment fields panel */}
      {selectedUser && (isIntern || isMentor) && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Additional Details Required
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Fill in the required fields to assign the role.
            </p>
          </div>

          {/* Guild Name (intern / both) */}
          {isIntern && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Guild Name <span className="text-destructive">*</span>
              </Label>
              <Combobox
                options={guildOptions}
                value={guild}
                onValueChange={setGuild}
                placeholder={
                  isLoadingGuilds ? "Loading guilds..." : "Select a guild..."
                }
                searchPlaceholder="Search guilds..."
                emptyText="No guilds found."
                disabled={assignMutation.isPending || isLoadingGuilds}
                className="h-11 rounded-xl"
              />
            </div>
          )}

          {/* Mentor Tier (mentor / both) */}
          {isMentor && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Mentor Tier <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={mentorTier}
                  onValueChange={setMentorTier}
                  disabled={assignMutation.isPending}
                >
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="IG_MENTOR">
                      Interest Group Mentor
                    </SelectItem>
                    <SelectItem value="CAMPUS_MENTOR">Campus Mentor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Interest Groups (IG_MENTOR) */}
              {mentorTier === "IG_MENTOR" && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Interest Groups <span className="text-destructive">*</span>
                  </Label>
                  <MultiSelect
                    options={igOptions}
                    value={selectedIgs}
                    onChange={setSelectedIgs}
                    placeholder={
                      isLoadingIgs
                        ? "Loading groups..."
                        : "Select interest groups..."
                    }
                    disabled={assignMutation.isPending || isLoadingIgs}
                  />
                </div>
              )}

              {/* Campus College (CAMPUS_MENTOR) */}
              {mentorTier === "CAMPUS_MENTOR" && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Campus College <span className="text-destructive">*</span>
                  </Label>
                  <Combobox
                    options={colleges}
                    value={orgId}
                    onValueChange={setOrgId}
                    placeholder={
                      isLoadingColleges
                        ? "Loading colleges..."
                        : "Search college..."
                    }
                    searchPlaceholder="Search colleges..."
                    emptyText="No colleges found."
                    disabled={assignMutation.isPending || isLoadingColleges}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          className="flex-1"
          disabled={!selectedUser || assignMutation.isPending || !isExtraValid}
          onClick={handleAssign}
        >
          <UserPlus className="mr-2 size-4" />
          Assign Role
        </Button>
        <Button
          variant="destructive"
          className="flex-1"
          disabled={!selectedUser || removeMutation.isPending}
          onClick={handleRemove}
        >
          <UserMinus className="mr-2 size-4" />
          Remove Role
        </Button>
      </div>
    </div>
  );
}

// ─── Bulk Add Tab ─────────────────────────────────────────────────────────────

function BulkAddTab({ role }: { role: Role }) {
  const [selectedUsers, setSelectedUsers] = useState<RoleUser[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);

  const isSearchActive = debouncedSearch.length >= 2;

  const { data: searchData, isLoading } = useRoleUserSearch(
    debouncedSearch,
    50,
  );

  const users: RoleUser[] = isSearchActive
    ? (searchData?.data ?? []).map((u) => ({
        id: String(u.id),
        full_name: u.full_name,
        muid: u.muid,
      }))
    : [];

  const bulkAssign = useBulkAssignRole(role.id);

  // Extra details state
  const [guild, setGuild] = useState("");
  const [mentorTier, setMentorTier] = useState("");
  const [selectedIgs, setSelectedIgs] = useState<string[]>([]);
  const [orgId, setOrgId] = useState("");

  const lowerTitle = role.title.toLowerCase();
  const isIntern = lowerTitle.includes("intern");
  const isMentor = lowerTitle.includes("mentor");

  // Sync: Reset form fields when role or selectedUsers becomes empty
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional reactive reset — must re-run when role.id or selectedUsers empties
  useEffect(() => {
    setGuild("");
    setMentorTier("");
    setSelectedIgs([]);
    setOrgId("");
  }, [role.id, selectedUsers.length === 0]);

  // Sync: Reset IG/org selections when mentorTier changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional reactive reset — must re-run when mentorTier changes
  useEffect(() => {
    setSelectedIgs([]);
    setOrgId("");
  }, [mentorTier]);

  // Queries for dynamic dropdowns (enabled conditionally based on role/tier)
  const { data: colleges = [], isLoading: isLoadingColleges } = useColleges();
  const { data: igsResponse, isLoading: isLoadingIgs } =
    useInterestGroupsList();
  const { data: guilds = [], isLoading: isLoadingGuilds } = useGuilds();

  // Map guilds to Combobox options format
  const guildOptions = useMemo(() => {
    return guilds.map((guildName) => ({
      id: guildName,
      title: guildName,
    }));
  }, [guilds]);

  // Map IGs to MultiSelect options format
  const igOptions = useMemo(() => {
    const list = igsResponse?.response?.interestGroup || [];
    return list.map((ig) => ({
      value: ig.id,
      label: ig.name || ig.code || "Unnamed Group",
    }));
  }, [igsResponse]);

  // Validation
  const isExtraValid = useMemo(() => {
    if (selectedUsers.length === 0) return false;
    if (isIntern && isMentor) {
      const guildOk = guild.trim().length > 0;
      const tierOk =
        mentorTier === "IG_MENTOR"
          ? selectedIgs.length > 0
          : mentorTier === "CAMPUS_MENTOR"
            ? orgId.trim().length > 0
            : false;
      return guildOk && tierOk;
    }
    if (isIntern) return guild.trim().length > 0;
    if (isMentor) {
      if (mentorTier === "IG_MENTOR") return selectedIgs.length > 0;
      if (mentorTier === "CAMPUS_MENTOR") return orgId.trim().length > 0;
      return false;
    }
    return true; // Not special role
  }, [
    selectedUsers,
    isIntern,
    isMentor,
    guild,
    mentorTier,
    selectedIgs,
    orgId,
  ]);

  const toggle = (user: RoleUser) =>
    setSelectedUsers((prev) =>
      prev.some((x) => x.id === user.id)
        ? prev.filter((x) => x.id !== user.id)
        : [...prev, user],
    );

  const handleAssign = async () => {
    const ids = selectedUsers.map((u) => u.id);
    if (!ids.length || !isExtraValid) return;

    const extra: BulkAssignExtraPayload = {};
    if (isIntern) {
      extra.guild = guild.trim();
    }
    if (isMentor) {
      extra.mentor_tier = mentorTier;
      if (mentorTier === "IG_MENTOR") {
        extra.ig_ids = selectedIgs;
      } else if (mentorTier === "CAMPUS_MENTOR") {
        extra.org_id = orgId;
      }
    }

    await bulkAssign.mutateAsync({ users: ids, extra });
    setSelectedUsers([]);
  };

  const displayUsers = isSearchActive ? users : selectedUsers;

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or MUID…"
          className="pl-11 h-11 bg-background/50 border-border/50 font-medium rounded-xl focus-visible:ring-brand-blue transition-all duration-200"
        />
      </div>

      <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
        {isLoading && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Loading…
          </p>
        )}
        {!isLoading &&
          displayUsers.map((user) => (
            <BulkUserRow
              key={user.id}
              user={user}
              checked={selectedUsers.some((x) => x.id === user.id)}
              onToggle={() => toggle(user)}
            />
          ))}
      </div>

      {/* Inline extra assignment fields panel */}
      {selectedUsers.length > 0 && (isIntern || isMentor) && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Additional Details Required
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Fill in the required fields to assign the role in bulk.
            </p>
          </div>

          {/* Guild Name (intern / both) */}
          {isIntern && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Guild Name <span className="text-destructive">*</span>
              </Label>
              <Combobox
                options={guildOptions}
                value={guild}
                onValueChange={setGuild}
                placeholder={
                  isLoadingGuilds ? "Loading guilds..." : "Select a guild..."
                }
                searchPlaceholder="Search guilds..."
                emptyText="No guilds found."
                disabled={bulkAssign.isPending || isLoadingGuilds}
                className="h-11 rounded-xl"
              />
            </div>
          )}

          {/* Mentor Tier (mentor / both) */}
          {isMentor && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Mentor Tier <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={mentorTier}
                  onValueChange={setMentorTier}
                  disabled={bulkAssign.isPending}
                >
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="IG_MENTOR">
                      Interest Group Mentor
                    </SelectItem>
                    <SelectItem value="CAMPUS_MENTOR">Campus Mentor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Interest Groups (IG_MENTOR) */}
              {mentorTier === "IG_MENTOR" && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Interest Groups <span className="text-destructive">*</span>
                  </Label>
                  <MultiSelect
                    options={igOptions}
                    value={selectedIgs}
                    onChange={setSelectedIgs}
                    placeholder={
                      isLoadingIgs
                        ? "Loading groups..."
                        : "Select interest groups..."
                    }
                    disabled={bulkAssign.isPending || isLoadingIgs}
                  />
                </div>
              )}

              {/* Campus College (CAMPUS_MENTOR) */}
              {mentorTier === "CAMPUS_MENTOR" && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Campus College <span className="text-destructive">*</span>
                  </Label>
                  <Combobox
                    options={colleges}
                    value={orgId}
                    onValueChange={setOrgId}
                    placeholder={
                      isLoadingColleges
                        ? "Loading colleges..."
                        : "Search college..."
                    }
                    searchPlaceholder="Search colleges..."
                    emptyText="No colleges found."
                    disabled={bulkAssign.isPending || isLoadingColleges}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <Button
        variant="default"
        className="w-full"
        disabled={
          !selectedUsers.length || !isExtraValid || bulkAssign.isPending
        }
        onClick={handleAssign}
        aria-label="Assign selected users"
      >
        {bulkAssign.isPending
          ? "Assigning…"
          : `Assign to ${selectedUsers.length} user${selectedUsers.length !== 1 ? "s" : ""}`}
      </Button>
    </div>
  );
}

// ─── Bulk Remove Tab ──────────────────────────────────────────────────────────

function BulkRemoveTab({ role }: { role: Role }) {
  const [selected, setSelected] = useState<string[]>([]);
  const { data: users, isLoading } = useBulkRoleUsers(role.id);
  const bulkRemove = useBulkRemoveRole(role.id);

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handleRemove = async () => {
    if (!selected.length) return;
    await bulkRemove.mutateAsync(selected);
    setSelected([]);
  };

  return (
    <div className="space-y-4">
      <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
        {isLoading && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Loading…
          </p>
        )}
        {!isLoading && (!users || users.length === 0) && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No users with this role
          </p>
        )}
        {users?.map((user) => (
          <BulkUserRow
            key={user.id}
            user={user}
            checked={selected.includes(user.id)}
            onToggle={() => toggle(user.id)}
          />
        ))}
      </div>
      <Button
        variant="destructive"
        className="w-full"
        disabled={!selected.length || bulkRemove.isPending}
        onClick={handleRemove}
        aria-label="Remove selected users"
      >
        {bulkRemove.isPending
          ? "Removing…"
          : `Remove from ${selected.length} user${selected.length !== 1 ? "s" : ""}`}
      </Button>
    </div>
  );
}

// ─── Shared row ───────────────────────────────────────────────────────────────

function BulkUserRow({
  user,
  checked,
  onToggle,
}: {
  user: RoleUser;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label
      htmlFor={`bulk-user-${user.id}`}
      className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2 hover:bg-muted/60"
    >
      <Checkbox
        id={`bulk-user-${user.id}`}
        checked={checked}
        onCheckedChange={onToggle}
      />
      <div>
        <p className="text-sm font-medium text-foreground">
          {user.full_name || "—"}
        </p>
        <p className="text-xs text-muted-foreground">{user.muid}</p>
      </div>
    </label>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export function UserRoleAssignment({
  open,
  onOpenChange,
  role,
}: UserRoleAssignmentProps) {
  const isMentorRole = role?.title.toLowerCase().includes("mentor") ?? false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-0 p-0 rounded-3xl border border-border bg-card sm:max-w-md overflow-visible">
        <DialogHeader className="p-6 pb-0 mb-4">
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
            Assign Role
            {role && (
              <Badge variant="secondary" className="text-xs">
                {role.title}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Manage users who have the <strong>{role?.title}</strong> role.
          </DialogDescription>
        </DialogHeader>

        {role && (
          <div className="px-6 pb-6 max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-thin">
            <Tabs defaultValue="single" className="w-full">
              <TabsList className="mb-4 w-full rounded-xl">
                <TabsTrigger value="single" className="flex-1 rounded-xl">
                  Single
                </TabsTrigger>
                {!isMentorRole && (
                  <TabsTrigger value="bulk-add" className="flex-1 rounded-xl">
                    Bulk Add
                  </TabsTrigger>
                )}
                <TabsTrigger value="bulk-remove" className="flex-1 rounded-xl">
                  Bulk Remove
                </TabsTrigger>
              </TabsList>

              <TabsContent value="single">
                <SingleTab role={role} />
              </TabsContent>
              {!isMentorRole && (
                <TabsContent value="bulk-add">
                  <BulkAddTab role={role} />
                </TabsContent>
              )}
              <TabsContent value="bulk-remove">
                <BulkRemoveTab role={role} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
