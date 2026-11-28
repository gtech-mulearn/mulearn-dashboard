"use client";

import { useMemo } from "react";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActiveTeams } from "../hooks/use-intern";
import { getISTDateString } from "../utils/intern-helpers";

export type TInternTeamValue = {
  team_id: string;
  join_date: string;
  end_date: string;
};

export const EMPTY_INTERN_TEAM: TInternTeamValue = {
  team_id: "",
  join_date: "",
  end_date: "",
};

/** Team is required; dates only for people who aren't interns yet (server checks). */
export function isInternTeamValid(v: TInternTeamValue) {
  if (!v.team_id) return false;
  if (!!v.join_date !== !!v.end_date) return false;
  return !v.join_date || v.end_date >= v.join_date;
}

/** Fields sent with Intern / Intern Lead role assignment. */
export function toInternTeamPayload(v: TInternTeamValue) {
  return {
    team_id: v.team_id,
    ...(v.join_date && { join_date: v.join_date, end_date: v.end_date }),
  };
}

/** Team + tenure inputs for assigning Intern / Intern Lead (admin pages). */
export function InternTeamFields({
  value,
  onChange,
  disabled,
  enabled = true,
}: {
  value: TInternTeamValue;
  onChange: (value: TInternTeamValue) => void;
  disabled?: boolean;
  enabled?: boolean;
}) {
  const { data: teams = [], isLoading } = useActiveTeams({ enabled });
  const options = useMemo(
    () => teams.map((t) => ({ id: t.id, title: `${t.name} (${t.code})` })),
    [teams],
  );
  const today = getISTDateString();

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Team <span className="text-destructive">*</span>
        </Label>
        <Combobox
          options={options}
          value={value.team_id}
          onValueChange={(team_id) => onChange({ ...value, team_id })}
          placeholder={isLoading ? "Loading teams..." : "Select a team..."}
          searchPlaceholder="Search teams..."
          disabled={disabled || isLoading}
          className="h-11 rounded-xl"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label
            htmlFor="intern-team-join"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Join Date
          </Label>
          <Input
            id="intern-team-join"
            type="date"
            min={today}
            value={value.join_date}
            disabled={disabled}
            onChange={(e) => onChange({ ...value, join_date: e.target.value })}
            className="h-11 rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="intern-team-end"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            End Date
          </Label>
          <Input
            id="intern-team-end"
            type="date"
            min={value.join_date || today}
            value={value.end_date}
            disabled={disabled}
            onChange={(e) => onChange({ ...value, end_date: e.target.value })}
            className="h-11 rounded-xl"
          />
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Dates are required when the person isn't an intern yet. Leave them empty
        to promote an existing intern.
      </p>
    </div>
  );
}
