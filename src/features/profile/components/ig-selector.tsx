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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { InterestGroup, InterestGroupListItem } from "../schemas";
import { useInterestGroupsList } from "../hooks";

interface IGSelectorProps {
  userInterestGroups: InterestGroup[];
  userLevel: number;
  isOwnProfile: boolean;
  onSave: (groupIds: string[]) => Promise<void>;
}

export function IGSelector({
  userInterestGroups,
  userLevel,
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
  const sortedIgs = [...localIgs].sort((a, b) => a.name.localeCompare(b.name));

  // Get all available IGs that are not already selected
  const availableIgs = (allIgData?.interestGroup || []).filter(
    (ig) => !localIgs.some((selected) => selected.id === ig.id),
  );

  // Check if user can edit (level >= 4)
  const canEdit = isOwnProfile && userLevel >= 4;

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
    setLocalIgs([...localIgs, { id: ig.id, name: ig.name, karma: 0 }]);
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
    <div className="rounded-xl bg-slate-50 p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">
          Your Interest Groups
        </span>
        <div className="flex gap-2">
          {canEdit && !editMode && (
            <button
              type="button"
              onClick={() => setEditMode(true)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-[#456ff6] transition-colors hover:bg-blue-100"
              title="Edit"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
          {editMode && (
            <>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-500 transition-colors hover:bg-red-100"
                title="Cancel"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-green-50 text-green-600 transition-colors hover:bg-green-100"
                title="Save"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
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
              className={`relative flex items-center gap-2 rounded-xl border-2 border-[#456ff6] px-3 py-2 text-sm font-medium transition-all ${
                editMode ? "scale-95" : ""
              }`}
            >
              {editMode && (
                <button
                  type="button"
                  onClick={() => handleRemoveIg(ig.id || "")}
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 text-white hover:bg-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
              <span className="text-gray-800">{ig.name}</span>
              <span className="rounded-lg bg-primary px-2 py-0.5 text-xs text-white">
                {formatKarma(ig.karma)}
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">
            {canEdit
              ? "No Interest Groups Selected. Click the edit button to select your interest groups."
              : "No Interest Groups Selected. You need to reach Level 4 to Select"}
          </p>
        )}
      </div>

      {/* Divider when in edit mode */}
      {editMode && sortedIgs.length > 0 && (
        <hr className="my-4 border-gray-200" />
      )}

      {/* Available IGs to Add */}
      {editMode && (
        <div className="flex flex-wrap gap-3">
          {isLoadingAllIg ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : availableIgs.length > 0 ? (
            availableIgs.map((ig) => (
              <button
                key={ig.id}
                type="button"
                onClick={() => handleAddIg(ig)}
                className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm font-medium text-[#456ff6] transition-colors hover:bg-blue-100"
              >
                <Plus className="h-3.5 w-3.5" />
                {ig.name}
              </button>
            ))
          ) : (
            <p className="text-sm text-gray-400">No more groups available</p>
          )}
        </div>
      )}
    </div>
  );
}
