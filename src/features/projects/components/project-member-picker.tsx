"use client";
import { useEffect, useState } from "react";
import { z } from "zod";
import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const UserMatchSchema = z.object({
  muid: z.string(),
  full_name: z.string(),
  profile_pic: z.string().nullable().optional(),
});

interface PickerProps {
  excludeMuids: string[];
  onPickLinked: (muid: string, fullName: string) => void;
  onPickExternal: (name: string) => void;
}

export function ProjectMemberPicker({
  excludeMuids,
  onPickLinked,
  onPickExternal,
}: PickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<z.infer<typeof UserMatchSchema>[]>([]);
  const [loading, setLoading] = useState(false);
  const [externalOpen, setExternalOpen] = useState(false);
  const [externalName, setExternalName] = useState("");

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const raw = await apiClient.get(
          `${endpoints.search.users}?search=${encodeURIComponent(query.trim())}&perPage=10`,
        );
        const data =
          (raw as Record<string, unknown>)?.data ??
          (raw as Record<string, unknown>)?.response ??
          [];
        const parsed = z.array(UserMatchSchema).safeParse(data);
        const items = parsed.success ? parsed.data : [];
        setResults(items.filter((u) => !excludeMuids.includes(u.muid)));
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query, excludeMuids]);

  const trimmed = query.trim();
  const exactMatch = results.some(
    (u) => u.full_name.toLowerCase() === trimmed.toLowerCase(),
  );
  const showExternalSuggestion = trimmed.length >= 2 && !exactMatch && !loading;

  return (
    <div className="space-y-2">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search mulearn users by name or muid (min 2 chars)"
      />
      {loading && <p className="text-xs text-muted-foreground">Searching…</p>}
      <ul className="max-h-48 overflow-y-auto rounded-md border divide-y">
        {results.length === 0 && !loading && trimmed.length >= 2 && (
          <li className="p-2 text-xs text-muted-foreground">
            No mulearn users matched.
          </li>
        )}
        {results.map((u) => (
          <li
            key={u.muid}
            className="flex items-center justify-between p-2 hover:bg-muted/50"
          >
            <div>
              <p className="text-sm font-medium">{u.full_name}</p>
              <p className="text-xs text-muted-foreground">{u.muid}</p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onPickLinked(u.muid, u.full_name)}
            >
              Add
            </Button>
          </li>
        ))}
        {showExternalSuggestion && (
          <li className="flex items-center justify-between p-2 bg-muted/30">
            <p className="text-sm">
              Add <span className="font-medium">&ldquo;{trimmed}&rdquo;</span>{" "}
              as external contributor
            </p>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                onPickExternal(trimmed);
                setQuery("");
              }}
            >
              + External
            </Button>
          </li>
        )}
      </ul>

      {externalOpen ? (
        <div className="flex items-center gap-2 rounded-md border p-2">
          <Input
            autoFocus
            value={externalName}
            onChange={(e) => setExternalName(e.target.value)}
            placeholder="External member name"
          />
          <Button
            type="button"
            size="sm"
            disabled={externalName.trim().length === 0}
            onClick={() => {
              onPickExternal(externalName.trim());
              setExternalName("");
              setExternalOpen(false);
            }}
          >
            Add
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setExternalOpen(false);
              setExternalName("");
            }}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setExternalOpen(true)}
        >
          + Add external member
        </Button>
      )}
    </div>
  );
}
