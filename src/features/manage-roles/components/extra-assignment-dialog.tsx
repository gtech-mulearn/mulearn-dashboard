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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInterestGroupsList } from "../../interest-groups/hooks/useInterestGroupsList";
import { useGuilds } from "../../intern/hooks/use-intern";
import { useColleges } from "../../onboarding/hooks/use-colleges";
import { useCompanies } from "../../onboarding/hooks/use-companies";
import type { Role, RoleUser } from "../schemas";

interface ExtraAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: RoleUser | null;
  role: Role | null;
  onConfirm: (extraData: {
    guild?: string;
    mentor_tier?: string;
    ig_ids?: string[];
    org_id?: string;
  }) => void;
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
  const isIntern = role?.title.toLowerCase() === "intern";
  const isMentor = role?.title.toLowerCase() === "mentor";

  // Form states
  const [guild, setGuild] = React.useState("");
  const [mentorTier, setMentorTier] = React.useState("MENTOR");
  const [selectedIgs, setSelectedIgs] = React.useState<string[]>([]);
  const [orgId, setOrgId] = React.useState("");

  // Queries for dynamic dropdowns (enabled conditionally based on role/tier)
  const { data: colleges = [], isLoading: isLoadingColleges } = useColleges();
  const { data: companies = [], isLoading: isLoadingCompanies } =
    useCompanies();
  const { data: igsResponse, isLoading: isLoadingIgs } =
    useInterestGroupsList();
  const { data: guilds = [], isLoading: isLoadingGuilds } = useGuilds();

  // Map guilds to Combobox options format
  const guildOptions = React.useMemo(() => {
    return guilds.map((guild) => ({
      id: guild,
      title: guild,
    }));
  }, [guilds]);

  // Reset form when dialog opens/changes
  React.useEffect(() => {
    if (open) {
      setGuild("");
      setMentorTier("MENTOR");
      setSelectedIgs([]);
      setOrgId("");
    }
  }, [open]);

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
    if (isIntern) {
      return guild.trim().length > 0;
    }
    if (isMentor) {
      if (mentorTier === "MENTOR") return true;
      if (mentorTier === "IG_MENTOR") return selectedIgs.length > 0;
      if (mentorTier === "CAMPUS_MENTOR" || mentorTier === "COMPANY_MENTOR") {
        return orgId.trim().length > 0;
      }
    }
    return false;
  }, [role, user, isIntern, isMentor, guild, mentorTier, selectedIgs, orgId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    if (isIntern) {
      onConfirm({ guild: guild.trim() });
    } else if (isMentor) {
      const extra: {
        mentor_tier: string;
        ig_ids?: string[];
        org_id?: string;
      } = { mentor_tier: mentorTier };

      if (mentorTier === "IG_MENTOR") {
        extra.ig_ids = selectedIgs;
      } else if (
        mentorTier === "CAMPUS_MENTOR" ||
        mentorTier === "COMPANY_MENTOR"
      ) {
        extra.org_id = orgId;
      }
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
                  onValueChange={(val) => {
                    setMentorTier(val);
                    setOrgId("");
                    setSelectedIgs([]);
                  }}
                  disabled={isPending}
                >
                  <SelectTrigger id="mentor-tier" className="h-11 rounded-xl">
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="MENTOR">General Mentor</SelectItem>
                    <SelectItem value="IG_MENTOR">
                      Interest Group Mentor
                    </SelectItem>
                    <SelectItem value="CAMPUS_MENTOR">Campus Mentor</SelectItem>
                    <SelectItem value="COMPANY_MENTOR">
                      Company Mentor
                    </SelectItem>
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

              {mentorTier === "COMPANY_MENTOR" && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    Company <span className="text-destructive">*</span>
                  </Label>
                  <Combobox
                    options={companies}
                    value={orgId}
                    onValueChange={setOrgId}
                    placeholder={
                      isLoadingCompanies
                        ? "Loading companies..."
                        : "Search company..."
                    }
                    searchPlaceholder="Search companies..."
                    emptyText="No companies found."
                    disabled={isPending || isLoadingCompanies}
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
