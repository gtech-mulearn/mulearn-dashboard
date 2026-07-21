"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInterestGroupsList } from "@/features/interest-groups";
import { useGuilds } from "@/features/intern";
import { useColleges } from "@/features/onboarding";
import type { BulkAssignExtraPayload } from "../api/manage-roles.api";
import type { Role, RoleUser } from "../schemas";

interface ExtraAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: RoleUser | null;
  role: Role | null;
  onConfirm: (extraData: BulkAssignExtraPayload) => void;
  isPending?: boolean;
}

export function ExtraAssignmentDialog({
  open,
  onOpenChange,
  user,
  role,
  onConfirm,
  isPending = false,
}: ExtraAssignmentDialogProps) {
  // Derived role classification — updated reactively when role changes
  const isIntern = React.useMemo(() => {
    const lowerTitle = role?.title.toLowerCase() ?? "";
    return lowerTitle.includes("intern");
  }, [role]);

  const isMentor = React.useMemo(() => {
    const lowerTitle = role?.title.toLowerCase() ?? "";
    return lowerTitle.includes("mentor");
  }, [role]);

  // Form states
  const [guild, setGuild] = React.useState("");
  const [mentorTier, setMentorTier] = React.useState("");
  const [selectedIgs, setSelectedIgs] = React.useState<string[]>([]);
  const [orgId, setOrgId] = React.useState("");

  // Queries for dynamic dropdowns (enabled conditionally based on role/tier)
  const { data: colleges = [], isLoading: isLoadingColleges } = useColleges({
    enabled: open && isMentor && mentorTier === "CAMPUS_MENTOR",
  });
  const { data: igsResponse, isLoading: isLoadingIgs } = useInterestGroupsList(
    undefined,
    {
      enabled: open && isMentor && mentorTier === "IG_MENTOR",
    },
  );
  const { data: guilds = [], isLoading: isLoadingGuilds } = useGuilds({
    enabled: open && isIntern,
  });

  // Map guilds to Combobox options format
  const guildOptions = React.useMemo(() => {
    return guilds.map((guild) => ({
      id: guild,
      title: guild,
    }));
  }, [guilds]);

  // Sync: reset all fields when dialog opens or the target role changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: open and role?.id are intentional triggers; setters are stable
  React.useEffect(() => {
    setGuild("");
    setMentorTier("");
    setSelectedIgs([]);
    setOrgId("");
  }, [open, role?.id]);

  // Sync: reset sub-fields when mentor tier changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: mentorTier is the intentional trigger; setters are stable
  React.useEffect(() => {
    setSelectedIgs([]);
    setOrgId("");
  }, [mentorTier]);

  // Map IGs to MultiSelect options format
  const igOptions = React.useMemo(() => {
    const list = igsResponse?.response?.interestGroup || [];
    return list.map((ig) => ({
      value: ig.id,
      label: ig.name || ig.code || "Unnamed Group",
    }));
  }, [igsResponse]);

  // Validation
  const isValid = React.useMemo(() => {
    if (!role || !user) return false;
    // Compound role: both intern and mentor
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
    }
    return false;
  }, [role, user, isIntern, isMentor, guild, mentorTier, selectedIgs, orgId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    // Compound role: both intern and mentor
    if (isIntern && isMentor) {
      const extra: BulkAssignExtraPayload = {
        guild: guild.trim(),
        mentor_tier: mentorTier,
      };
      if (mentorTier === "IG_MENTOR") extra.ig_ids = selectedIgs;
      else if (mentorTier === "CAMPUS_MENTOR") extra.org_id = orgId;
      onConfirm(extra);
      return;
    }

    if (isIntern) {
      onConfirm({ guild: guild.trim() });
    } else if (isMentor) {
      const extra: BulkAssignExtraPayload = { mentor_tier: mentorTier };
      if (mentorTier === "IG_MENTOR") extra.ig_ids = selectedIgs;
      else if (mentorTier === "CAMPUS_MENTOR") extra.org_id = orgId;
      onConfirm(extra);
    }
  };

  if (!role || !user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Additional Details Required
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Provide extra parameters required to assign the{" "}
            <strong>{role.title}</strong> role to{" "}
            <strong>{user.full_name || user.muid}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {isIntern && (
            <div className="space-y-2">
              <Label htmlFor="guild-input" className="text-sm font-semibold">
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
                disabled={isPending || isLoadingGuilds}
                className="h-11 rounded-xl"
              />
            </div>
          )}

          {isMentor && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="mentor-tier" className="text-sm font-semibold">
                  Mentor Tier <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={mentorTier}
                  onValueChange={setMentorTier}
                  disabled={isPending}
                >
                  <SelectTrigger id="mentor-tier" className="h-11 rounded-xl">
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

              {mentorTier === "IG_MENTOR" && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
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
                    disabled={isPending || isLoadingIgs}
                  />
                </div>
              )}

              {mentorTier === "CAMPUS_MENTOR" && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
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
                    disabled={isPending || isLoadingColleges}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="pt-4 flex sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isPending}
              className="rounded-xl"
            >
              {isPending ? "Assigning..." : "Confirm Assignment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
