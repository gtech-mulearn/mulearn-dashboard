"use client";

import { X } from "lucide-react";
import { MuidSearchInput } from "@/components/ui/muid-search-input";
import { Switch } from "@/components/ui/switch";
import type { UserResult } from "@/hooks/use-search";

export interface TeamMemberEntry {
  muid: string;
  name: string;
  is_lead: boolean;
}

interface ImpactProjectTeamPickerProps {
  value: TeamMemberEntry[];
  onChange: (value: TeamMemberEntry[]) => void;
}

export function ImpactProjectTeamPicker({
  value,
  onChange,
}: ImpactProjectTeamPickerProps) {
  const handleSelectUser = (user: UserResult) => {
    if (value.some((m) => m.muid === user.muid)) return;
    onChange([
      ...value,
      { muid: user.muid, name: user.full_name, is_lead: value.length === 0 },
    ]);
  };

  const removeMember = (muid: string) => {
    onChange(value.filter((m) => m.muid !== muid));
  };

  const toggleLead = (muid: string) => {
    onChange(
      value.map((m) => (m.muid === muid ? { ...m, is_lead: !m.is_lead } : m)),
    );
  };

  return (
    <div className="space-y-2">
      <MuidSearchInput
        onSelectUser={handleSelectUser}
        placeholder="Search users by muid…"
        searchOptions={{ excludedMuids: value.map((m) => m.muid) }}
      />

      {value.length > 0 && (
        <ul className="max-h-48 space-y-1.5 overflow-y-auto rounded-md border border-border p-2">
          {value.map((member) => (
            <li
              key={member.muid}
              className="flex items-center justify-between gap-2 rounded-md bg-muted/40 px-2.5 py-1.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {member.name}
                </p>
                <p className="truncate font-mono text-xs text-muted-foreground">
                  {member.muid}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Lead
                </span>
                <Switch
                  checked={member.is_lead}
                  onCheckedChange={() => toggleLead(member.muid)}
                  aria-label={
                    member.is_lead ? "Unmark as team lead" : "Mark as team lead"
                  }
                />
                <button
                  type="button"
                  onClick={() => removeMember(member.muid)}
                  aria-label="Remove member"
                  className="rounded-sm p-1 text-muted-foreground/60 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
