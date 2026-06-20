/**
 * Interest Group Selector Component
 *
 * 📍 src/features/profile/components/ig-selector.tsx
 *
 * Displays user's interest groups as chips with karma.
 * Has edit mode to add/remove groups (max 3).
 * Matches the old codebase IGSelector component.
 */

"use client";

import { Check, Pencil, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInterestGroupsList } from "../hooks";
import type { InterestGroup, InterestGroupListItem } from "../schemas";

interface IGSelectorProps {
  userInterestGroups: InterestGroup[];
  isOwnProfile: boolean;
  onSave: (groupIds: string[]) => Promise<void>;
}

export function IGSelector({
  userInterestGroups,
  isOwnProfile,
  onSave,
}: IGSelectorProps) {
  const { data: allIgData, isLoading: isLoadingAllIg } =
    useInterestGroupsList();

  const [editMode, setEditMode] = useState(false);
  const [localIgs, setLocalIgs] = useState<InterestGroup[]>(userInterestGroups);
  const [isSaving, setIsSaving] = useState(false);

  // Sync local state with props
  useEffect(() => {
    setLocalIgs(userInterestGroups);
  }, [userInterestGroups]);

  // Sort IGs alphabetically
  const sortedIgs = useMemo(
    () => [...localIgs].sort((a, b) => a.name.localeCompare(b.name)),
    [localIgs],
  );

  // Get all available IGs that are not already selected
  const availableIgs = useMemo(
    () =>
      (allIgData?.interestGroup || []).filter(
        (ig) => !localIgs.some((selected) => selected.id === ig.id),
      ),
    [allIgData, localIgs],
  );

  const canEdit = isOwnProfile;

  // Format level to display as "Level X"
  const formatLevel = (level: { unit: string; count: number }) => {
    const unit = level.unit || "Level";
    const count = level.count || 1;
    return `${unit.charAt(0).toUpperCase() + unit.slice(1)} ${count}`;
  };

  const handleRemoveIg = (igId: string) => {
    if (localIgs.length <= 1) {
      toast.error("You must have at least one interest group");
      return;
    }
    setLocalIgs(localIgs.filter((ig) => ig.id !== igId));
  };

  const handleAddIg = (ig: InterestGroupListItem) => {
    if (localIgs.length >= 3) {
      toast.error("Maximum 3 interest groups allowed");
      return;
    }
    setLocalIgs([
      ...localIgs,
      {
        id: ig.id,
        name: ig.name,
        karma: 0,
        level: { unit: "level", count: 1 },
      },
    ]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const newIgIds = sortedIgs
        .map((ig) => ig.id)
        .filter((id): id is string => !!id);
      await onSave(newIgIds);
      setEditMode(false);
      toast.success("Interest groups updated successfully");
    } catch {
      toast.error("Failed to update interest groups");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setLocalIgs(userInterestGroups);
    setEditMode(false);
  };

  // Format karma display
  const formatKarma = (karma: number | undefined | null) => {
    if (!karma) return "0";
    if (karma > 1000) return `${(karma / 1000).toFixed(1)}K`;
    return String(karma);
  };

  return (
    <div className="rounded-xl bg-muted p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">
          {isOwnProfile ? "Your Interest Groups" : "Interest Groups"}
        </span>
        <div className="flex gap-2">
          {canEdit && !editMode && (
            <Button
              type="button"
              variant="default"
              size="icon"
              onClick={() => setEditMode(true)}
              className="h-7 w-7"
              title="Edit"
              aria-label="Edit interest groups"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
          {editMode && (
            <>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={handleCancel}
                disabled={isSaving}
                className="h-7 w-7 bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20"
                title="Cancel"
                aria-label="Cancel"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={handleSave}
                disabled={isSaving}
                className="h-7 w-7 bg-success/10 text-success transition-colors hover:bg-success/20"
                title="Save"
                aria-label="Save"
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Interest Groups List */}
      <div className="flex flex-wrap gap-3">
        {sortedIgs.length > 0 ? (
          sortedIgs.map((ig) => (
            <div
              key={ig.id || ig.name}
              className={`relative flex w-full flex-col items-start gap-2 rounded-xl border-2 border-brand-blue px-3 py-2 text-sm font-medium transition-all sm:w-auto ${
                editMode ? "scale-95" : ""
              }`}
            >
              {editMode && (
                <Button
                  type="button"
                  variant="default"
                  size="icon"
                  onClick={() => handleRemoveIg(ig.id || "")}
                  className="absolute -right-2 -top-2  h-5 w-5 bg-brand-blue text-background hover:bg-destructive border-none"
                  aria-label={`Remove ${ig.name}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              {/* Row 1: IG name (wraps for long titles) */}
              <span className="text-foreground wrap-break-word">{ig.name}</span>
              {/* Row 2: Level + points chips */}
              <div className="flex flex-row items-center gap-2">
                <Badge
                  variant="outline"
                  className="gap-1 border border-brand-blue px-3 text-xs sm:gap-1.5 sm:text-sm"
                >
                  {formatLevel(ig.level)}
                </Badge>
                <Badge variant="default" className="rounded-lg px-2 py-0.5">
                  {formatKarma(ig.karma)}
                </Badge>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            {canEdit
              ? "No Interest Groups Selected. Click the edit button to select your interest groups."
              : "No Interest Groups Selected."}
          </p>
        )}
      </div>

      {/* Divider when in edit mode */}
      {editMode && sortedIgs.length > 0 && (
        <hr className="my-4 border-border" />
      )}

      {/* Available IGs to Add */}
      {editMode && (
        <div className="flex flex-wrap gap-3">
          {isLoadingAllIg ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : availableIgs.length > 0 ? (
            availableIgs.map((ig) => (
              <Button
                key={ig.id}
                type="button"
                variant="secondary"
                onClick={() => handleAddIg(ig)}
                className="flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                aria-label={`Add ${ig.name}`}
              >
                <Plus className="h-3.5 w-3.5" />
                {ig.name}
              </Button>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No more groups available
            </p>
          )}
        </div>
      )}
    </div>
  );
}
