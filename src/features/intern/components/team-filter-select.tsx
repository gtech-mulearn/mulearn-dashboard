"use client";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsInternAdmin, useManageTeams } from "../hooks/use-manage-interns";
import type { TTeamRef } from "../types";

/** Team code badge (name on hover). */
export function TeamBadge({ team }: { team?: TTeamRef | null }) {
  return (
    <Badge
      variant="outline"
      className="font-bold uppercase tracking-wider"
      title={team?.name}
    >
      {team?.code ?? "-"}
    </Badge>
  );
}

/**
 * Teams the manage pages can pick from. Works for Admins (every active team)
 * and Leads (only their own team) — `intern/teams/` refuses Leads.
 */
export function useManageTeamOptions() {
  const { data, isLoading } = useManageTeams({ page: 1, perPage: 1000 });
  return { teams: data?.data ?? [], isLoading };
}

/** "All Teams" + each team. Renders nothing for Leads (the server ignores `team_id` for them). */
export function TeamFilterSelect({
  value,
  onChange,
  className,
}: {
  /** `"ALL"` or a team id. */
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const isAdmin = useIsInternAdmin();
  const { teams } = useManageTeamOptions();
  if (!isAdmin) return null;

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={
          className ??
          "w-full sm:w-44 h-12 bg-card/40 border-border/40 font-black uppercase text-[10px] tracking-widest rounded-md"
        }
      >
        <SelectValue placeholder="Team" />
      </SelectTrigger>
      <SelectContent position="popper" className="bg-card font-bold">
        <SelectItem value="ALL" className="uppercase text-[10px]">
          All Teams
        </SelectItem>
        {teams.map((t) => (
          <SelectItem key={t.id} value={t.id} className="text-[10px]">
            {t.name} ({t.code})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
