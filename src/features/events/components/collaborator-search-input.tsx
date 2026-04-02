"use client";

import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCollaborationTargets, useInviteCollaborator } from "../hooks";
import type { CollaboratorType } from "../types";

interface CollaboratorSearchInputProps {
  eventId: string;
  onInvited?: () => void;
}

const typeOptions: Array<{ label: string; value: CollaboratorType | "all" }> = [
  { label: "All", value: "all" },
  { label: "IG", value: "ig" },
  { label: "Campus", value: "campus" },
  { label: "Campus IG", value: "campus_ig" },
  { label: "Company", value: "company" },
];

function toInviteType(type: CollaboratorType) {
  if (type === "ig") return "collab_ig" as const;
  if (type === "campus") return "collab_campus" as const;
  if (type === "campus_ig") return "collab_campus_ig" as const;
  return "collab_company" as const;
}

export function CollaboratorSearchInput({
  eventId,
  onInvited,
}: CollaboratorSearchInputProps) {
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState<CollaboratorType | "all">(
    "all",
  );
  const [roleLabelById, setRoleLabelById] = useState<Record<string, string>>(
    {},
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading } = useCollaborationTargets(
    query,
    selectedType === "all" ? undefined : selectedType,
  );

  const inviteCollaborator = useInviteCollaborator(eventId);

  const targets = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data;
  }, [data]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {typeOptions.map((option) => {
          const isActive = selectedType === option.value;
          return (
            <Button
              key={option.value}
              type="button"
              size="sm"
              variant={isActive ? "default" : "outline"}
              className={
                isActive ? "bg-pink-600 text-white hover:bg-pink-700" : ""
              }
              onClick={() => setSelectedType(option.value)}
            >
              {option.label}
            </Button>
          );
        })}
      </div>

      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name..."
      />

      <div className="rounded-md border">
        {query.trim().length < 2 ? (
          <p className="p-3 text-xs text-muted-foreground">
            Type at least 2 characters
          </p>
        ) : isLoading ? (
          <div className="flex items-center gap-2 p-3 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading results...
          </div>
        ) : targets.length === 0 ? (
          <p className="p-3 text-xs text-muted-foreground">No results found</p>
        ) : (
          <div className="max-h-72 space-y-2 overflow-y-auto p-2">
            {targets.map((target) => {
              const isExpanded = expandedId === target.id;
              return (
                <div
                  key={target.id}
                  className="space-y-2 rounded-md border p-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {target.name}
                      </p>
                      <Badge variant="outline" className="mt-1 capitalize">
                        {target.collaborator_type.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : target.id)
                      }
                    >
                      Invite
                    </Button>
                  </div>

                  {isExpanded ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <Input
                        className="max-w-xs"
                        placeholder="Role label (optional)"
                        value={roleLabelById[target.id] ?? ""}
                        onChange={(e) =>
                          setRoleLabelById((prev) => ({
                            ...prev,
                            [target.id]: e.target.value,
                          }))
                        }
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={async () => {
                          await inviteCollaborator.mutateAsync({
                            entity_type: toInviteType(target.collaborator_type),
                            entity_id: target.id,
                            role_label: roleLabelById[target.id] || undefined,
                          });
                          setExpandedId(null);
                          setRoleLabelById((prev) => ({
                            ...prev,
                            [target.id]: "",
                          }));
                          onInvited?.();
                        }}
                        disabled={inviteCollaborator.isPending}
                      >
                        Confirm Invite
                      </Button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
