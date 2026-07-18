"use client";

import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";
import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/hooks/use-debounce";
import { fetchIgOptions } from "../api/ig-options.api";
import { useAssignMentors } from "../hooks/use-mentor-verify";
import type { MentorTier } from "../schemas";
import { AssignMentorsPayloadSchema, MENTOR_TIERS } from "../schemas";

// One-line meaning per tier, shown in the tier select (A1 rule 5).
const TIER_DESCRIPTIONS: Record<MentorTier, string> = {
  IG_MENTOR: "scoped to chosen Interest Groups",
  MENTOR: "platform-wide global mentor",
  COMPANY_MENTOR: "scoped to one company",
  CAMPUS_MENTOR: "scoped to one campus",
};

// Lenient org-search responses (college search returns title, company list
// returns name) — normalised to { id, name } below.
const OrgSearchResponseSchema = z
  .object({
    response: z
      .object({
        data: z.array(
          z
            .object({
              id: z.string(),
              title: z.string().optional(),
              name: z.string().optional(),
            })
            .passthrough(),
        ),
      })
      .passthrough(),
  })
  .passthrough();

interface OrgOption {
  id: string;
  name: string;
}

async function searchOrgs(
  tier: MentorTier,
  search: string,
): Promise<OrgOption[]> {
  const base =
    tier === "COMPANY_MENTOR"
      ? endpoints.company.list
      : endpoints.search.colleges;
  const q = new URLSearchParams({ search, perPage: "10" });
  const res = await apiClient.get(`${base}?${q}`, OrgSearchResponseSchema);
  return res.response.data.map((o) => ({
    id: o.id,
    name: o.name ?? o.title ?? o.id,
  }));
}

interface AssignMentorsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignMentorsDialog({
  open,
  onOpenChange,
}: AssignMentorsDialogProps) {
  const assign = useAssignMentors();

  const [muidsRaw, setMuidsRaw] = useState("");
  const [tier, setTier] = useState<MentorTier>("IG_MENTOR");
  const [org, setOrg] = useState<OrgOption | null>(null);
  const [orgQuery, setOrgQuery] = useState("");
  const [igIds, setIgIds] = useState<string[]>([]);
  const [hours, setHours] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const muids = useMemo(
    () => [
      ...new Set(
        muidsRaw
          .split(/[\s,;]+/)
          .map((m) => m.trim())
          .filter(Boolean),
      ),
    ],
    [muidsRaw],
  );

  const needsOrg = tier === "COMPANY_MENTOR" || tier === "CAMPUS_MENTOR";
  const needsIgs = tier === "IG_MENTOR";

  const debouncedOrgQuery = useDebounce(orgQuery, 300);
  const orgResults = useQuery({
    queryKey: ["mentor-assign-org-search", tier, debouncedOrgQuery],
    queryFn: () => searchOrgs(tier, debouncedOrgQuery),
    enabled: open && needsOrg && debouncedOrgQuery.length >= 2 && !org,
  });

  const igOptions = useQuery({
    queryKey: ["mentor-assign-ig-options"],
    queryFn: fetchIgOptions,
    enabled: open,
    staleTime: 10 * 60 * 1000,
  });

  const resetForm = () => {
    setMuidsRaw("");
    setTier("IG_MENTOR");
    setOrg(null);
    setOrgQuery("");
    setIgIds([]);
    setHours("");
    setErrors({});
  };

  const handleTierChange = (next: MentorTier) => {
    setTier(next);
    setOrg(null);
    setOrgQuery("");
    setErrors({});
  };

  const handleSubmit = () => {
    const payload = {
      user_muids: muids,
      mentor_tier: tier,
      org_id: needsOrg ? (org?.id ?? null) : null,
      ig_ids: igIds,
      hours: hours ? Number(hours) : undefined,
    };
    const parsed = AssignMentorsPayloadSchema.safeParse(payload);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        next[String(issue.path[0] ?? "form")] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    assign.mutate(parsed.data, {
      onSuccess: () => {
        resetForm();
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) resetForm();
        onOpenChange(o);
      }}
    >
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-4">
          <DialogTitle>Assign Mentors</DialogTitle>
          <DialogDescription>
            Assignments apply immediately (no pending review) and are additive —
            existing scopes are kept. Safe to re-run.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 space-y-4 overflow-y-auto px-6 py-4">
          {/* muids */}
          <div className="space-y-1.5">
            <Label htmlFor="assign-muids">User MUIDs</Label>
            <Textarea
              id="assign-muids"
              rows={3}
              placeholder={"one-muid@mulearn\nanother-muid@mulearn"}
              value={muidsRaw}
              onChange={(e) => setMuidsRaw(e.target.value)}
            />
            <div className="flex flex-wrap items-center gap-1.5">
              {muids.slice(0, 8).map((m) => (
                <Badge key={m} variant="secondary" className="text-xs">
                  {m}
                </Badge>
              ))}
              {muids.length > 8 && (
                <span className="text-xs text-muted-foreground">
                  +{muids.length - 8} more
                </span>
              )}
              {muids.length > 0 && (
                <span className="ml-auto text-xs text-muted-foreground">
                  {muids.length} user{muids.length === 1 ? "" : "s"}
                </span>
              )}
            </div>
            {errors.user_muids && (
              <p className="text-xs text-destructive">{errors.user_muids}</p>
            )}
          </div>

          {/* tier */}
          <div className="space-y-1.5">
            <Label>Mentor tier</Label>
            <Select
              value={tier}
              onValueChange={(v) => handleTierChange(v as MentorTier)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MENTOR_TIERS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t} — {TIER_DESCRIPTIONS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* conditional org picker */}
          {needsOrg && (
            <div className="space-y-1.5">
              <Label>
                {tier === "COMPANY_MENTOR" ? "Company" : "Campus (college)"}
              </Label>
              {org ? (
                <div className="flex items-center justify-between rounded-md border px-3 py-2">
                  <span className="truncate text-sm font-medium">
                    {org.name}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setOrg(null)}
                    aria-label="Clear organisation"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-8"
                      placeholder={
                        tier === "COMPANY_MENTOR"
                          ? "Search companies…"
                          : "Search colleges…"
                      }
                      value={orgQuery}
                      onChange={(e) => setOrgQuery(e.target.value)}
                    />
                  </div>
                  {orgQuery.trim().length >= 2 && (
                    <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border p-1.5">
                      {orgResults.isLoading ? (
                        <p className="p-2 text-xs text-muted-foreground">
                          Searching…
                        </p>
                      ) : (orgResults.data?.length ?? 0) === 0 ? (
                        <p className="p-2 text-xs text-muted-foreground">
                          No results found
                        </p>
                      ) : (
                        orgResults.data?.map((o) => (
                          <button
                            key={o.id}
                            type="button"
                            className="w-full rounded px-2 py-1.5 text-left text-sm hover:bg-muted/60"
                            onClick={() => {
                              setOrg(o);
                              setOrgQuery("");
                            }}
                          >
                            {o.name}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
              {errors.org_id && (
                <p className="text-xs text-destructive">{errors.org_id}</p>
              )}
            </div>
          )}

          {/* IG multiselect — required for IG_MENTOR, optional add-on otherwise */}
          <div className="space-y-1.5">
            <Label>
              Interest Groups
              {!needsIgs && (
                <span className="ml-1 font-normal text-muted-foreground">
                  (optional — also grants IG scopes)
                </span>
              )}
            </Label>
            <MultiSelect
              options={(igOptions.data ?? []).map((ig) => ({
                value: ig.id,
                label: ig.name,
              }))}
              value={igIds}
              onChange={setIgIds}
              placeholder={
                igOptions.isLoading
                  ? "Loading interest groups…"
                  : "Select interest groups…"
              }
            />
            {errors.ig_ids && (
              <p className="text-xs text-destructive">{errors.ig_ids}</p>
            )}
          </div>

          {/* hours */}
          <div className="space-y-1.5">
            <Label htmlFor="assign-hours">Weekly hours (optional)</Label>
            <Input
              id="assign-hours"
              type="number"
              min={0}
              placeholder="e.g. 4"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="shrink-0 gap-2 border-t border-border px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={assign.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={assign.isPending || muids.length === 0}
          >
            {assign.isPending
              ? "Assigning…"
              : `Assign ${muids.length || ""} mentor${muids.length === 1 ? "" : "s"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
