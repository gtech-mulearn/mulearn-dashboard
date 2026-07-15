/**
 * Basic Info Section
 *
 * 📍 src/features/manage-users/components/basic-info-section.tsx
 *
 * Form section for basic user info fields (name, email, mobile, discord, location, communities, roles, IGs).
 */

"use client";

import { useEffect, useState } from "react";
import type { Control } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGuilds } from "../../intern/hooks/use-intern";
import { useAssignUserRole } from "../hooks";
import type { ManageUserFormValues } from "../schemas";
import { INTERN_ROLE_NAME, MENTOR_ROLE_NAME, type UiOption } from "../schemas";
import { LocationSearchDropdown } from "./location-search-dropdown";
import { MultiSelectDropdown } from "./multi-select-dropdown";
import { OrganizationCombobox } from "./organisationSearch";

interface BasicInfoSectionProps {
  control: Control<ManageUserFormValues>;
  user_id: string;
  colleges: UiOption[];
  companies: UiOption[];
  isBusy: boolean;
  locationSearch: string;
  isLocationMenuOpen: boolean;
  isLocationFetching: boolean;
  locationOptions: { value: string; label: string }[];
  onLocationSearchChange: (value: string) => void;
  onLocationMenuOpenChange: (open: boolean) => void;
  communities: { value: string; label: string }[];
  roles: { value: string; label: string }[];
  interests: { value: string; label: string }[];
  selectedCommunities: string[];
  selectedRoles: string[];
  selectedInterests: string[];
  onToggleArrayField: (
    fieldName: "communities" | "roles" | "interest_groups",
    value: string,
    checked: boolean,
  ) => void;
}

const fieldClassName =
  "h-12 rounded-2xl border border-border bg-muted px-4 text-base focus-visible:ring-1 focus-visible:ring-primary/20";

export function BasicInfoSection({
  control,
  user_id,
  isBusy,
  locationSearch,
  isLocationMenuOpen,
  isLocationFetching,
  locationOptions,
  onLocationSearchChange,
  onLocationMenuOpenChange,
  communities,
  roles,
  interests,
  selectedCommunities,
  selectedRoles,
  selectedInterests,
  colleges = [],
  onToggleArrayField,
}: BasicInfoSectionProps) {
  const [pendingRoleId, setPendingRoleId] = useState<string | null>(null);
  const [pendingRoleType, setPendingRoleType] = useState<
    "intern" | "mentor" | "both" | null
  >(null);
  const [pendingRoleLabel, setPendingRoleLabel] = useState("");
  const [guild, setGuild] = useState("");
  const [mentorTier, setMentorTier] = useState("");
  const [igIds, setIgIds] = useState<string[]>([]);
  const [orgId, setOrgId] = useState("");
  const assignRole = useAssignUserRole(user_id);
  const { data: guildsList = [], isLoading: isLoadingGuilds } = useGuilds();

  // Sync: reset all extra fields whenever a new role is pending
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional reactive reset — must re-run when pendingRoleId changes
  useEffect(() => {
    setGuild("");
    setMentorTier("");
    setIgIds([]);
    setOrgId("");
  }, [pendingRoleId]);

  // Sync: derive pendingRoleType from pendingRoleId + roles list
  useEffect(() => {
    if (!pendingRoleId) {
      setPendingRoleType(null);
      return;
    }
    const label =
      roles.find((r) => r.value === pendingRoleId)?.label?.toLowerCase() ?? "";
    const hasIntern = label.includes(INTERN_ROLE_NAME);
    const hasMentor = label.includes(MENTOR_ROLE_NAME);
    if (hasIntern && hasMentor) setPendingRoleType("both");
    else if (hasIntern) setPendingRoleType("intern");
    else if (hasMentor) setPendingRoleType("mentor");
    else setPendingRoleType(null);
  }, [pendingRoleId, roles]);

  // Sync: derive label reactively from pendingRoleId
  useEffect(() => {
    if (!pendingRoleId) {
      setPendingRoleLabel("");
      return;
    }
    setPendingRoleLabel(
      roles.find((r) => r.value === pendingRoleId)?.label ?? "",
    );
  }, [pendingRoleId, roles]);

  // Sync: reset IG / org selections whenever mentor tier changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional reactive reset — must re-run when mentorTier changes
  useEffect(() => {
    setIgIds([]);
    setOrgId("");
  }, [mentorTier]);

  // Toggle handler — only sets pendingRoleId; pendingRoleType is synced by effect
  const handleRoleToggle = (value: string, checked: boolean) => {
    if (checked) {
      const label =
        roles.find((r) => r.value === value)?.label?.toLowerCase() ?? "";
      const isSpecialRole =
        label.includes(INTERN_ROLE_NAME) || label.includes(MENTOR_ROLE_NAME);
      if (isSpecialRole) {
        setPendingRoleId(value);
        return;
      }
    }
    onToggleArrayField("roles", value, checked);
  };

  // Cancel — only clears pendingRoleId; all derived state cascades via effects
  const handleCancel = () => {
    setPendingRoleId(null);
  };

  const handleAssignRole = async () => {
    if (!pendingRoleId) return;

    if (
      (pendingRoleType === "intern" || pendingRoleType === "both") &&
      !guild
    ) {
      toast.error("Please select a guild");
      return;
    }

    if (
      (pendingRoleType === "mentor" || pendingRoleType === "both") &&
      !mentorTier
    ) {
      toast.error("Please select a mentor tier");
      return;
    }

    if (mentorTier === "IG_MENTOR" && (!igIds || igIds.length === 0)) {
      toast.error("Please select at least one Interest Group");
      return;
    }

    if (mentorTier === "CAMPUS_MENTOR" && !orgId) {
      toast.error("Please select an organisation");
      return;
    }

    try {
      let payload: Parameters<typeof assignRole.mutateAsync>[0];

      if (pendingRoleType === "both") {
        const extra: Record<string, unknown> = {
          user_id,
          role_id: pendingRoleId,
          guild,
          mentor_tier: mentorTier,
        };
        if (mentorTier === "IG_MENTOR") extra.ig_ids = igIds;
        else if (mentorTier === "CAMPUS_MENTOR") extra.org_id = orgId;
        payload = extra as Parameters<typeof assignRole.mutateAsync>[0];
      } else if (pendingRoleType === "intern") {
        payload = { user_id, role_id: pendingRoleId, guild };
      } else if (mentorTier === "IG_MENTOR") {
        payload = {
          user_id,
          role_id: pendingRoleId,
          mentor_tier: "IG_MENTOR",
          ig_ids: igIds,
        };
      } else if (mentorTier === "CAMPUS_MENTOR") {
        payload = {
          user_id,
          role_id: pendingRoleId,
          mentor_tier: "CAMPUS_MENTOR",
          org_id: orgId,
        };
      } else {
        payload = { user_id, role_id: pendingRoleId };
      }

      await assignRole.mutateAsync(payload);
      onToggleArrayField("roles", pendingRoleId, true);
      toast.success("Role assigned successfully");
    } catch {
      toast.error("Failed to assign role");
    } finally {
      handleCancel();
    }
  };

  const showInlineExtra = !!pendingRoleId && !!pendingRoleType;
  const needsGuild = pendingRoleType === "intern" || pendingRoleType === "both";
  const needsMentor =
    pendingRoleType === "mentor" || pendingRoleType === "both";

  return (
    <div className="space-y-4">
      <h3 className="text-center text-2xl font-semibold uppercase tracking-wide text-primary">
        Basic Info
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isBusy}
                  className={fieldClassName}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  {...field}
                  disabled={isBusy}
                  className={fieldClassName}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="mobile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mobile</FormLabel>
              <FormControl>
                <Input
                  maxLength={10}
                  {...field}
                  disabled={isBusy}
                  className={fieldClassName}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="discord_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discord ID</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isBusy}
                  className={fieldClassName}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <LocationSearchDropdown
          control={control}
          isBusy={isBusy}
          locationSearch={locationSearch}
          isLocationMenuOpen={isLocationMenuOpen}
          isLocationFetching={isLocationFetching}
          locationOptions={locationOptions}
          onLocationSearchChange={onLocationSearchChange}
          onLocationMenuOpenChange={onLocationMenuOpenChange}
        />
        <MultiSelectDropdown
          label="Communities"
          options={communities}
          selectedValues={selectedCommunities}
          onToggle={(value, checked) =>
            onToggleArrayField("communities", value, checked)
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <MultiSelectDropdown
          label="Roles"
          options={roles}
          selectedValues={selectedRoles}
          onToggle={handleRoleToggle}
        />

        <MultiSelectDropdown
          label="Interest Groups"
          options={interests}
          selectedValues={selectedInterests}
          onToggle={(value, checked) =>
            onToggleArrayField("interest_groups", value, checked)
          }
        />
      </div>

      {/* ── Inline extra-fields panel ── */}
      {showInlineExtra && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Additional details for{" "}
                <span className="text-primary">{pendingRoleLabel}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Fill in the required fields to assign this role.
              </p>
            </div>
          </div>

          {/* Guild picker (intern / both) */}
          {needsGuild && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Guild <span className="text-destructive">*</span>
              </Label>
              <Select
                value={guild}
                onValueChange={setGuild}
                disabled={isLoadingGuilds || assignRole.isPending}
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue
                    placeholder={
                      isLoadingGuilds ? "Loading guilds…" : "Select a guild…"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {guildsList.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Mentor tier picker (mentor / both) */}
          {needsMentor && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Mentor Tier <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={mentorTier}
                  onValueChange={setMentorTier}
                  disabled={assignRole.isPending}
                >
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Select mentor tier…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IG_MENTOR">
                      Interest Group Mentor
                    </SelectItem>
                    <SelectItem value="CAMPUS_MENTOR">Campus Mentor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Interest Group (IG_MENTOR) */}
              {mentorTier === "IG_MENTOR" && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Interest Group <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={igIds[0] ?? ""}
                    onValueChange={(v) => setIgIds([v])}
                    disabled={assignRole.isPending}
                  >
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Select interest group…" />
                    </SelectTrigger>
                    <SelectContent>
                      {interests.map((ig) => (
                        <SelectItem key={ig.value} value={ig.value}>
                          {ig.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Campus college (CAMPUS_MENTOR) */}
              {mentorTier === "CAMPUS_MENTOR" && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Campus College <span className="text-destructive">*</span>
                  </Label>
                  <OrganizationCombobox
                    value={orgId}
                    onChange={setOrgId}
                    options={colleges}
                    placeholder="Select college..."
                    searchPlaceholder="Search college..."
                  />
                </div>
              )}
            </div>
          )}

          {/* Action row */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-xl text-muted-foreground"
              onClick={handleCancel}
              disabled={assignRole.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="rounded-xl"
              onClick={handleAssignRole}
              disabled={assignRole.isPending}
            >
              {assignRole.isPending ? "Assigning…" : "Assign Role"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
