"use client";

/**
 * AssignRoleDialog
 *
 * 📍 src/features/manage-users/components/assign-role-dialog.tsx
 *
 * A self-contained dialog that lets an admin assign a role to a user.
 * It progressively reveals extra fields depending on whether the
 * selected role is "intern" or "mentor" (matched case-insensitively
 * against the role label).
 *
 * Usage:
 *   <AssignRoleDialog userId={id} roles={meta?.roles ?? []} />
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { useForm, type Control } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
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
import {
  AssignRoleFormSchema,
  type AssignRoleFormValues,
  type AssignRolePayload,
  INTERN_ROLE_NAME,
  MENTOR_ROLE_NAME,
  type UiOption,
} from "../schemas";

// ── Guilds available for Intern assignment ────────────────────────────────────
const GUILD_OPTIONS = [
  "Backend Guild",
  "Frontend Guild",
  "DevOps Guild",
  "Design Guild",
  "Data Guild",
  "Mobile Guild",
] as const;

// ── Mentor tier labels ────────────────────────────────────────────────────────
const MENTOR_TIER_OPTIONS: {
  value: AssignRoleFormValues["mentor_tier"];
  label: string;
}[] = [
  { value: "MENTOR", label: "General Platform Mentor" },
  { value: "IG_MENTOR", label: "Interest Group Mentor" },
  { value: "CAMPUS_MENTOR", label: "Campus Mentor" },
  { value: "COMPANY_MENTOR", label: "Company Mentor" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Derives the simplified role type from the human-readable role label.
 * Falls back to "general" for anything unrecognised.
 */
function getRoleType(
  roleId: string,
  roles: UiOption[],
): AssignRoleFormValues["role_type"] {
  const label = roles.find((r) => r.value === roleId)?.label ?? "";
  const normalised = label.toLowerCase();
  if (normalised.includes(INTERN_ROLE_NAME)) return "intern";
  if (normalised.includes(MENTOR_ROLE_NAME)) return "mentor";
  return "general";
}

/**
 * Converts validated form values into the correct API payload shape.
 */
function buildPayload(
  userId: string,
  values: AssignRoleFormValues,
): AssignRolePayload {
  const base = { user_id: userId, role_id: values.role_id };

  if (values.role_type === "intern") {
    return { ...base, guild: values.guild! };
  }

  if (values.role_type === "mentor") {
    const tier = values.mentor_tier!;

    if (tier === "IG_MENTOR") {
      return { ...base, mentor_tier: tier, ig_ids: values.ig_ids ?? [] };
    }

    if (tier === "CAMPUS_MENTOR" || tier === "COMPANY_MENTOR") {
      return { ...base, mentor_tier: tier, org_id: values.org_id! };
    }

    // "MENTOR" – general platform mentor
    return { ...base, mentor_tier: "MENTOR" };
  }

  // General / Admin / Campus Lead etc.
  return base;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  userId: string;
  /** Flat list of roles from useManageUsersMeta */
  roles: UiOption[];
  /** Optional: list of Interest Group options for IG_MENTOR tier */
  interestGroups?: UiOption[];
  /** Optional: list of org options for CAMPUS_MENTOR / COMPANY_MENTOR */
  organisations?: UiOption[];
}

export function AssignRoleDialog({
  userId,
  roles,
  interestGroups = [],
  organisations = [],
}: Props) {
  const [open, setOpen] = useState(false);
  const assignRole = useAssignUserRole(userId);

  const form = useForm({
    resolver: zodResolver(AssignRoleFormSchema),
    defaultValues: {
      role_id: "",
      role_type: "general",
      guild: "",
      mentor_tier: undefined,
      ig_ids: [],
      org_id: "",
    },
  }) as ReturnType<typeof useForm<AssignRoleFormValues>>;

  const roleType = form.watch("role_type");
  const mentorTier = form.watch("mentor_tier");

  // When the user picks a role, auto-detect the role type and reset extras
  const handleRoleChange = (roleId: string) => {
    const detectedType = getRoleType(roleId, roles);
    form.setValue("role_id", roleId);
    form.setValue("role_type", detectedType);
    // Clear previously filled tier-specific fields
    form.setValue("guild", "");
    form.setValue("mentor_tier", undefined);
    form.setValue("ig_ids", []);
    form.setValue("org_id", "");
  };

  const handleSubmit = async (values: AssignRoleFormValues) => {
    try {
      const payload = buildPayload(userId, values);
      const result = await assignRole.mutateAsync(payload);

      // Friendly contextual success messages
      if ("intern_guild_created" in result) {
        toast.success(
          result.intern_guild_created
            ? "Intern role assigned and guild created"
            : "Intern role assigned — existing profile reactivated",
        );
      } else if ("mentor_profile_created" in result) {
        toast.success(
          result.mentor_profile_created
            ? "Mentor role assigned and profile created"
            : "Mentor role assigned — existing application approved",
        );
      } else {
        toast.success("Role assigned successfully");
      }

      setOpen(false);
      form.reset();
    } catch (err: unknown) {
      // Surface the first server-side validation message if available
      const serverMsg =
        err &&
        typeof err === "object" &&
        "message" in err &&
        err.message &&
        typeof err.message === "object"
          ? Object.values(err.message as Record<string, string[]>)
              .flat()
              .at(0)
          : undefined;

      toast.error(serverMsg ?? "Failed to assign role");
    }
  };

  const isPending = assignRole.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) form.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <PlusCircle className="size-4" />
          Assign Role
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Role</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            id="assign-role-form"
            onSubmit={form.handleSubmit(handleSubmit as any)}
            className="space-y-4"
          >
            {/* ── Role selector ──────────────────────────────────────────── */}
            <FormField
              control={form.control}
              name="role_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={handleRoleChange}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role…" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── Intern: guild ─────────────────────────────────────────── */}
            {roleType === "intern" && (
              <FormField
                control={form.control}
                name="guild"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guild</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a guild…" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {GUILD_OPTIONS.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* ── Mentor: tier picker ───────────────────────────────────── */}
            {roleType === "mentor" && (
              <>
                <FormField
                  control={form.control}
                  name="mentor_tier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mentor Tier</FormLabel>
                      <Select
                        value={field.value ?? ""}
                        onValueChange={(v) => {
                          field.onChange(v);
                          // Reset tier-specific fields when tier changes
                          form.setValue("ig_ids", []);
                          form.setValue("org_id", "");
                        }}
                        disabled={isPending}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select mentor tier…" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MENTOR_TIER_OPTIONS.map((t) => (
                            <SelectItem key={t.value} value={t.value!}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* IG Mentor: multi-select for interest groups */}
                {mentorTier === "IG_MENTOR" && (
                  <FormField
                    control={form.control}
                    name="ig_ids"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interest Groups</FormLabel>
                        <div className="flex flex-wrap gap-2 rounded-md border p-2">
                          {interestGroups.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                              No interest groups available
                            </p>
                          )}
                          {interestGroups.map((ig) => {
                            const checked = (field.value ?? []).includes(
                              ig.value,
                            );
                            return (
                              <button
                                key={ig.value}
                                type="button"
                                onClick={() => {
                                  const next = checked
                                    ? (field.value ?? []).filter(
                                        (v) => v !== ig.value,
                                      )
                                    : [...(field.value ?? []), ig.value];
                                  field.onChange(next);
                                }}
                                className={`rounded-full border px-3 py-0.5 text-sm transition-colors ${
                                  checked
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border bg-background text-foreground hover:bg-accent"
                                }`}
                              >
                                {ig.label}
                              </button>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Campus / Company Mentor: organisation selector */}
                {(mentorTier === "CAMPUS_MENTOR" ||
                  mentorTier === "COMPANY_MENTOR") && (
                  <FormField
                    control={form.control}
                    name="org_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {mentorTier === "CAMPUS_MENTOR"
                            ? "College / School"
                            : "Company"}
                        </FormLabel>
                        {organisations.length > 0 ? (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={isPending}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select organisation…" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {organisations.map((org) => (
                                <SelectItem key={org.value} value={org.value}>
                                  {org.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          /* Fallback: free-text UUID entry if no list provided */
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter organisation ID…"
                              disabled={isPending}
                            />
                          </FormControl>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}
          </form>
        </Form>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" form="assign-role-form" disabled={isPending}>
            {isPending ? "Assigning…" : "Assign Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
