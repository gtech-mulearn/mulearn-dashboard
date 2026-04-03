"use client";

import { Loader2, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserSearch } from "../hooks";
import type { MinimalUser } from "../types";

interface UserSearchInputProps {
  onSelect: (user: MinimalUser) => void;
  placeholder?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function UserSearchInput({
  onSelect,
  placeholder,
}: UserSearchInputProps) {
  const [query, setQuery] = useState("");
  const { data, isLoading } = useUserSearch(query);

  const users = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object" && "data" in data) {
      const maybeData = (data as { data?: unknown }).data;
      if (Array.isArray(maybeData)) {
        return maybeData as MinimalUser[];
      }
    }
    return [];
  }, [data]);

  return (
    <div className="space-y-2">
      <Input
        placeholder={placeholder ?? "Search users"}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="rounded-md border">
        {query.trim().length < 2 ? (
          <p className="p-3 text-xs text-muted-foreground">
            Type at least 2 characters
          </p>
        ) : isLoading ? (
          <div className="flex items-center gap-2 p-3 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading users...
          </div>
        ) : users.length === 0 ? (
          <p className="p-3 text-xs text-muted-foreground">No results</p>
        ) : (
          <div className="max-h-64 space-y-1 overflow-y-auto p-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between gap-3 rounded-md border p-2"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profile_pic ?? undefined} />
                    <AvatarFallback>
                      {getInitials(user.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {user.full_name}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.muid}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onSelect(user);
                    setQuery("");
                  }}
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Add
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
