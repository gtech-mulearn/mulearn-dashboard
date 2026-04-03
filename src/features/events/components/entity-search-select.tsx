"use client";

import { Loader2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCollaborationTargets } from "../hooks";
import type { CollaborationTarget, CollaboratorType } from "../types";

interface EntitySearchSelectProps {
  type: CollaboratorType;
  value: string | null;
  onChange: (id: string, name: string) => void;
  selectedName?: string | null;
  placeholder?: string;
  disabled?: boolean;
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

export function EntitySearchSelect({
  type,
  value,
  onChange,
  selectedName,
  placeholder,
  disabled,
}: EntitySearchSelectProps) {
  const [query, setQuery] = useState("");
  const [internalSelectedName, setInternalSelectedName] = useState(
    selectedName ?? "",
  );

  useEffect(() => {
    setInternalSelectedName(selectedName ?? "");
  }, [selectedName]);

  const { data, isLoading } = useCollaborationTargets(query, type);

  const targets = useMemo(() => {
    if (Array.isArray(data)) return data as CollaborationTarget[];
    if (data && typeof data === "object") {
      const shaped = data as {
        data?: unknown;
        response?: unknown;
        results?: unknown;
      };
      if (Array.isArray(shaped.data)) {
        return shaped.data as CollaborationTarget[];
      }
      if (Array.isArray(shaped.results)) {
        return shaped.results as CollaborationTarget[];
      }
      if (
        shaped.response &&
        typeof shaped.response === "object" &&
        Array.isArray((shaped.response as { data?: unknown }).data)
      ) {
        return (shaped.response as { data: CollaborationTarget[] }).data;
      }
    }
    return [];
  }, [data]);

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
                    {target.collaborator_type.replace(/_/g, " ")}
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
