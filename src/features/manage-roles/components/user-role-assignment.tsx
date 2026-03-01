"use client";

import { Search, UserMinus, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAssignUserRole,
  useBulkAssignRole,
  useBulkRemoveRole,
  useBulkRoleUsers,
  useRemoveUserRole,
  useUsersByRole,
  useUsersWithoutRole,
} from "../hooks/use-role-users";
import type { Role, RoleUser } from "../schemas";

interface UserRoleAssignmentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
}

// ─── Single Tab ───────────────────────────────────────────────────────────────

function SingleTab({ role }: { role: Role }) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const assignMutation = useAssignUserRole(role.id);
  const removeMutation = useRemoveUserRole(role.id);

  const { data: users, isLoading } = useUsersByRole(role.id, debouncedSearch);

  // Proper debounce implementation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [search]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or MUID…"
          className="pl-9"
        />
      </div>

      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
        {isLoading && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Loading…
          </p>
        )}
        {!isLoading && (!users || users.length === 0) && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            {debouncedSearch ? "No users found" : "No users available"}
          </p>
        )}
        {users?.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-3 py-2"
          >
            <div>
              <p className="text-sm font-medium text-foreground">
                {user.full_name || "—"}
              </p>
              <p className="text-xs text-muted-foreground">{user.muid}</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="size-8 rounded-xl text-green-600 hover:bg-green-50 hover:text-green-700"
                disabled={assignMutation.isPending}
                title="Assign role"
                onClick={() =>
                  assignMutation.mutate({ user_id: user.id, role_id: role.id })
                }
              >
                <UserPlus className="size-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="size-8 rounded-xl text-destructive hover:bg-destructive/10"
                disabled={removeMutation.isPending}
                title="Remove role"
                onClick={() =>
                  removeMutation.mutate({ user_id: user.id, role_id: role.id })
                }
              >
                <UserMinus className="size-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Bulk Add Tab ─────────────────────────────────────────────────────────────

function BulkAddTab({ role }: { role: Role }) {
  const [selected, setSelected] = useState<string[]>([]);
  const { data: users, isLoading } = useUsersWithoutRole(role.id);
  const bulkAssign = useBulkAssignRole(role.id);

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handleAssign = async () => {
    if (!selected.length) return;
    await bulkAssign.mutateAsync(selected);
    setSelected([]);
  };

  return (
    <div className="space-y-4">
      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
        {isLoading && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Loading…
          </p>
        )}
        {!isLoading && (!users || users.length === 0) && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            All users already have this role
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
        className="w-full rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90"
        disabled={!selected.length || bulkAssign.isPending}
        onClick={handleAssign}
      >
        {bulkAssign.isPending
          ? "Assigning…"
          : `Assign to ${selected.length} user${selected.length !== 1 ? "s" : ""}`}
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
      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
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
        className="w-full rounded-2xl"
        disabled={!selected.length || bulkRemove.isPending}
        onClick={handleRemove}
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
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2">
            Assign Role
            {role && (
              <Badge variant="secondary" className="text-xs">
                {role.title}
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            Manage users who have the <strong>{role?.title}</strong> role.
          </SheetDescription>
        </SheetHeader>

        {role && (
          <Tabs defaultValue="single" className="w-full">
            <TabsList className="mb-4 w-full rounded-xl">
              <TabsTrigger value="single" className="flex-1 rounded-xl">
                Single
              </TabsTrigger>
              <TabsTrigger value="bulk-add" className="flex-1 rounded-xl">
                Bulk Add
              </TabsTrigger>
              <TabsTrigger value="bulk-remove" className="flex-1 rounded-xl">
                Bulk Remove
              </TabsTrigger>
            </TabsList>

            <TabsContent value="single">
              <SingleTab role={role} />
            </TabsContent>
            <TabsContent value="bulk-add">
              <BulkAddTab role={role} />
            </TabsContent>
            <TabsContent value="bulk-remove">
              <BulkRemoveTab role={role} />
            </TabsContent>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
}
