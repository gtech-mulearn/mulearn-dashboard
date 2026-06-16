/**
 * Basic Info Section
 *
 * 📍 src/features/manage-users/components/basic-info-section.tsx
 *
 * Form section for basic user info fields (name, email, mobile, discord, location, communities, roles, IGs).
 */

"use client";

import { useState } from "react";
import type { Control } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  companies = [],
  onToggleArrayField,
}: BasicInfoSectionProps) {
  const [pendingRoleId, setPendingRoleId] = useState<string | null>(null);
  const [pendingRoleType, setPendingRoleType] = useState<
    "intern" | "mentor" | null
  >(null);
  const [guild, setGuild] = useState("");
  const [mentorTier, setMentorTier] = useState("");
  const [igIds, setIgIds] = useState<string[]>([]);
  const [orgId, setOrgId] = useState("");
  const assignRole = useAssignUserRole(user_id);

  const handleRoleToggle = (value: string, checked: boolean) => {
    if (checked) {
      const label =
        roles.find((r) => r.value === value)?.label?.toLowerCase() ?? "";
      if (label.includes(INTERN_ROLE_NAME)) {
        setPendingRoleId(value);
        setPendingRoleType("intern");
        return;
      }
      if (label.includes(MENTOR_ROLE_NAME)) {
        setPendingRoleId(value);
        setPendingRoleType("mentor");
        return;
      }
    }
    onToggleArrayField("roles", value, checked);
  };

  const handleDialogConfirm = async () => {
    if (!pendingRoleId) return;

    if (pendingRoleType === "intern" && !guild) {
      toast.error("Please select a guild");
      return;
    }

    if (pendingRoleType === "mentor" && !mentorTier) {
      toast.error("Please select a mentor tier");
      return;
    }

    if (mentorTier === "IG_MENTOR" && (!igIds || igIds.length === 0)) {
      toast.error("Please select at least one Interest Group");
      return;
    }

    if (
      (mentorTier === "CAMPUS_MENTOR" || mentorTier === "COMPANY_MENTOR") &&
      !orgId
    ) {
      toast.error("Please select an organisation");
      return;
    }

    try {
      let payload: Parameters<typeof assignRole.mutateAsync>[0];

      if (pendingRoleType === "intern") {
        payload = {
          user_id,
          role_id: pendingRoleId,
          guild,
        };
      } else if (mentorTier === "IG_MENTOR") {
        payload = {
          user_id,
          role_id: pendingRoleId,
          mentor_tier: "IG_MENTOR",
          ig_ids: igIds,
        };
      } else if (
        mentorTier === "CAMPUS_MENTOR" ||
        mentorTier === "COMPANY_MENTOR"
      ) {
        payload = {
          user_id,
          role_id: pendingRoleId,
          mentor_tier: mentorTier,
          org_id: orgId,
        };
      } else {
        payload = {
          user_id,
          role_id: pendingRoleId,
          mentor_tier: "MENTOR",
        };
      }

      await assignRole.mutateAsync(payload);

      onToggleArrayField("roles", pendingRoleId, true);

      toast.success("Role assigned successfully");
    } catch {
      toast.error("Failed to assign role");
    } finally {
      setPendingRoleId(null);
      setPendingRoleType(null);
      setGuild("");
      setMentorTier("");
      setIgIds([]);
      setOrgId("");
    }
  };

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

        {/* Follow-up dialog for Intern / Mentor */}
        <Dialog
          open={!!pendingRoleId}
          onOpenChange={(open) => {
            if (!open) {
              setPendingRoleId(null);
              setPendingRoleType(null);
              setGuild("");
              setMentorTier("");
            }
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {pendingRoleType === "intern"
                  ? "Select Guild"
                  : "Select Mentor Tier"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {pendingRoleType === "intern" && (
                <Select value={guild} onValueChange={setGuild}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a guild…" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Backend Guild",
                      "Frontend Guild",
                      "DevOps Guild",
                      "Design Guild",
                      "Data Guild",
                      "Mobile Guild",
                    ].map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {pendingRoleType === "mentor" && (
                <>
                  <Select
                    value={mentorTier}
                    onValueChange={(v) => {
                      setMentorTier(v);
                      setIgIds([]);
                      setOrgId("");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select mentor tier…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MENTOR">
                        General Platform Mentor
                      </SelectItem>
                      <SelectItem value="IG_MENTOR">
                        Interest Group Mentor
                      </SelectItem>
                      <SelectItem value="CAMPUS_MENTOR">
                        Campus Mentor
                      </SelectItem>
                      <SelectItem value="COMPANY_MENTOR">
                        Company Mentor
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {(mentorTier === "CAMPUS_MENTOR" ||
                    mentorTier === "COMPANY_MENTOR") && (
                    <OrganizationCombobox
                      value={orgId}
                      onChange={setOrgId}
                      options={
                        mentorTier === "CAMPUS_MENTOR" ? colleges : companies
                      }
                      placeholder={
                        mentorTier === "CAMPUS_MENTOR"
                          ? "Select college..."
                          : "Select company..."
                      }
                      searchPlaceholder={
                        mentorTier === "CAMPUS_MENTOR"
                          ? "Search college..."
                          : "Search company..."
                      }
                    />
                  )}

                  {mentorTier === "IG_MENTOR" && (
                    <Select
                      value={igIds[0] ?? ""}
                      onValueChange={(value) => setIgIds([value])}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            mentorTier === "IG_MENTOR"
                              ? "Select IG…"
                              : "Select company…"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {interests.map((org) => (
                          <SelectItem key={org.value} value={org.value}>
                            {org.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => {
                  setPendingRoleId(null);
                  setPendingRoleType(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDialogConfirm}
                disabled={assignRole.isPending}
              >
                {assignRole.isPending ? "Assigning…" : "Confirm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <MultiSelectDropdown
          label="Interest Groups"
          options={interests}
          selectedValues={selectedInterests}
          onToggle={(value, checked) =>
            onToggleArrayField("interest_groups", value, checked)
          }
        />
      </div>
    </div>
  );
}
