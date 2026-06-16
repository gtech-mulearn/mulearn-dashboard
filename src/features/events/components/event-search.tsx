"use client";

import { Loader2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  COLLABORATOR_INVITE_TYPE_MAP,
  COLLABORATOR_TYPE_OPTIONS,
} from "../constants/events.constants";
import {
  normalizeCollaborationTargets,
  useCampusSearch,
  useCollaborationTargets,
  useIGSearch,
  useInviteCollaborator,
} from "../hooks";
import type { CollaborationTarget, CollaboratorType } from "../types";

interface EventSearchSelectProps {
  mode: "select";
  type: CollaboratorType;
  value: string | null;
  onChange: (id: string, name: string) => void;
  selectedName?: string | null;
  placeholder?: string;
  disabled?: boolean;
}

interface EventSearchInviteProps {
  mode: "invite";
  eventId: string;
  onInvited?: (target: CollaborationTarget) => void;
}

type EventSearchProps = EventSearchSelectProps | EventSearchInviteProps;

function toInviteType(type: CollaboratorType | undefined) {
  return COLLABORATOR_INVITE_TYPE_MAP[type ?? "ig"];
}

function formatTargetLabel(target: CollaborationTarget): string {
  if (target.collaborator_type !== "campus_ig") return target.name;

  const maybeCampusIg = target as CollaborationTarget & {
    ig?: { name?: string };
    campus?: { name?: string };
  };

  const igName = maybeCampusIg.ig?.name;
  const campusName = maybeCampusIg.campus?.name;
  if (igName && campusName) {
    return `${igName} @ ${campusName}`;
  }

  return target.name;
}

function normalizeScopeTargets(
  data: unknown,
  type: CollaboratorType,
): CollaborationTarget[] {
  const paginated = data as {
    data?: unknown[];
    interestGroup?: unknown[];
    colleges?: unknown[];
  } | null;
  const items = Array.isArray(paginated?.data)
    ? paginated!.data!
    : Array.isArray(paginated?.interestGroup)
      ? paginated!.interestGroup!
      : Array.isArray(paginated?.colleges)
        ? paginated!.colleges!
        : Array.isArray(data)
          ? data
          : [];

  const uniqueTargets = new Map<string, CollaborationTarget>();

  items
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const value = item as Record<string, unknown>;
      const id = value.id as string | undefined;
      const name =
        (value.name as string | undefined) ??
        (value.title as string | undefined) ??
        null;
      if (!id || !name) return null;
      return {
        id,
        name,
        collaborator_type: type,
        logo:
          (value.icon as string | undefined) ??
          (value.logo as string | undefined) ??
          null,
      } as CollaborationTarget;
    })
    .filter((target): target is CollaborationTarget => Boolean(target))
    .forEach((target) => {
      if (!uniqueTargets.has(target.id)) {
        uniqueTargets.set(target.id, target);
      }
    });

  return Array.from(uniqueTargets.values());
}

function SelectMode(props: EventSearchSelectProps) {
  const { type, value, onChange, selectedName, placeholder, disabled } = props;
  const [query, setQuery] = useState("");
  const [internalSelectedName, setInternalSelectedName] = useState(
    selectedName ?? "",
  );

  useEffect(() => {
    setInternalSelectedName(selectedName ?? "");
  }, [selectedName]);

  const campusQuery = useCampusSearch(type === "campus" ? query : "");
  const igQuery = useIGSearch(type === "ig" ? query : "");
  const genericQuery = useCollaborationTargets(
    type === "campus_ig" || type === "company" ? query : "",
    type === "campus_ig" || type === "company" ? type : undefined,
  );

  const activeQuery =
    type === "campus" ? campusQuery : type === "ig" ? igQuery : genericQuery;

  const { data, isLoading } = activeQuery;

  const targets = useMemo(() => {
    if (type === "campus" || type === "ig") {
      return normalizeScopeTargets(data, type);
    }
    return normalizeCollaborationTargets(data);
  }, [data, type]);

  const selectedId = value ?? "";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          value={query || internalSelectedName}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!e.target.value.trim()) {
              setInternalSelectedName(selectedName ?? "");
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={disabled || (!selectedId && !query)}
          onClick={() => {
            setQuery("");
            setInternalSelectedName("");
            onChange("", "");
          }}
          aria-label="Clear selection"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="rounded-md border">
        {query.trim().length < 2 ? (
          <p className="p-3 text-xs text-muted-foreground">
            Type at least 2 characters to search
          </p>
        ) : isLoading ? (
          <div className="flex items-center gap-2 p-3 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading results...
          </div>
        ) : targets.length === 0 ? (
          <p className="p-3 text-xs text-muted-foreground">No results found</p>
        ) : (
          <div className="max-h-64 space-y-1 overflow-y-auto p-2">
            {targets.map((target) => {
              const label = formatTargetLabel(target);
              const isActive = selectedId === target.id;
              return (
                <button
                  key={target.id}
                  type="button"
                  className={`w-full rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                    isActive
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => {
                    setInternalSelectedName(label);
                    setQuery("");
                    onChange(target.id, label);
                  }}
                >
                  <p className="font-medium">{label}</p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {(target.collaborator_type ?? "ig").replace(/_/g, " ")}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function InviteMode(props: EventSearchInviteProps) {
  const { eventId, onInvited } = props;
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
    return normalizeCollaborationTargets(data);
  }, [data]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {COLLABORATOR_TYPE_OPTIONS.map((option) => {
          const isActive = selectedType === option.value;
          return (
            <Button
              key={option.value}
              size="sm"
              variant={isActive ? "default" : "outline"}
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
                        {(target.collaborator_type ?? "ig").replace(/_/g, " ")}
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
                          onInvited?.(target);
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

export function EventSearch(props: EventSearchProps) {
  if (props.mode === "invite") {
    return <InviteMode {...props} />;
  }

  return <SelectMode {...props} />;
}
