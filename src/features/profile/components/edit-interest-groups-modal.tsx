/**
 * Edit Interest Groups Modal
 *
 * 📍 src/features/profile/components/edit-interest-groups-modal.tsx
 *
 * Modal dialog for selecting interest groups by category.
 * Uses the same UI style as the old codebase onboarding flow.
 */

"use client";

import { Check, Info } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { InterestGroup, InterestGroupListItem } from "../schemas";
import { useInterestGroupsList } from "../hooks";
import { Spinner } from "@/components/ui/spinner";
  
interface EditInterestGroupsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentGroups: InterestGroup[];
  onSave: (groupIds: string[]) => Promise<void>;
}

// Category definitions matching old codebase
const CATEGORIES = [
  {
    id: "coder",
    title: "Coder",
    image: "/assets/landing/coder2.webp",
    descriptions: [
      "Web Development",
      "Mobile Apps",
      "Data Science",
      "Machine Learning",
      "Cloud Computing",
      "DevOps",
    ],
  },
  {
    id: "maker",
    title: "Maker",
    image: "/assets/landing/maker.webp",
    descriptions: [
      "Hardware Development",
      "IoT Projects",
      "Robotics",
      "3D Printing",
      "Electronics",
      "DIY Projects",
    ],
  },
  {
    id: "manager",
    title: "Manager",
    image: "/assets/landing/manager.webp",
    descriptions: [
      "Project Management",
      "Product Management",
      "Business Strategy",
      "Team Leadership",
      "Operations",
      "HR Management",
    ],
  },
  {
    id: "creative",
    title: "Creative",
    image: "/assets/landing/creative.webp",
    descriptions: [
      "UI/UX Design",
      "Graphic Design",
      "Animation",
      "Video Editing",
      "Content Creation",
      "Digital Marketing",
    ],
  },
];

const MAX_GROUPS = 3;

export function EditInterestGroupsModal({
  open,
  onOpenChange,
  currentGroups,
  onSave,
}: EditInterestGroupsModalProps) {
  const { data: igListData, isLoading: isLoadingGroups } =
    useInterestGroupsList();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize selected IDs from current groups
  useEffect(() => {
    if (open) {
      setSelectedIds(
        currentGroups.map((g) => g.id).filter((id): id is string => !!id),
      );
    }
  }, [open, currentGroups]);

  // Group interest groups by category
  const groupsByCategory = useMemo(() => {
    if (!igListData?.interestGroup) return {};
    return igListData.interestGroup.reduce(
      (acc, ig) => {
        const category = ig.category || "other";
        if (!acc[category]) acc[category] = [];
        acc[category].push(ig);
        return acc;
      },
      {} as Record<string, InterestGroupListItem[]>,
    );
  }, [igListData]);

  // Check if a category has any selected groups
  const getCategorySelectedCount = (categoryId: string) => {
    const groups = groupsByCategory[categoryId] || [];
    return groups.filter((g) => selectedIds.includes(g.id)).length;
  };

  const toggleGroup = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= MAX_GROUPS) {
        toast.error(`You can select up to ${MAX_GROUPS} interest groups`);
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(selectedIds);
      toast.success("Interest groups updated");
      onOpenChange(false);
    } catch {
      toast.error("Failed to update interest groups");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Interest Groups</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="mb-4 text-sm text-gray-500">
            Select up to {MAX_GROUPS} interest groups that match your learning
            goals. ({selectedIds.length}/{MAX_GROUPS} selected)
          </p>

          {isLoadingGroups ? (
            <div className="flex h-48 items-center justify-center">
              <Spinner className="h-8 w-8 text-gray-400" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Category Cards */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {CATEGORIES.map((category) => {
                  const selectedCount = getCategorySelectedCount(category.id);
                  const hasGroups =
                    (groupsByCategory[category.id] || []).length > 0;
                  const isExpanded = expandedCategory === category.id;

                  return (
                    <button
                      type="button"
                      key={category.id}
                      className={`relative flex cursor-pointer flex-col items-center rounded-xl border-2 bg-white p-4 shadow-sm transition-all hover:shadow-md ${
                        selectedCount > 0
                          ? "border-[#456ff6]"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() =>
                        setExpandedCategory(isExpanded ? null : category.id)
                      }
                    >
                      {/* Selected count badge */}
                      {selectedCount > 0 && (
                        <div className="absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#456ff6] text-xs font-bold text-white shadow">
                          {selectedCount}
                        </div>
                      )}

                      {/* Info button */}
                      <span
                        className={`absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
                          isExpanded
                            ? "bg-[#456ff6] text-white"
                            : "bg-gray-100 text-[#456ff6]"
                        }`}
                      >
                        <Info className="h-3.5 w-3.5" />
                      </span>

                      {/* Category image */}
                      <div className="relative mb-2 h-24 w-20 sm:h-28 sm:w-24">
                        <Image
                          src={category.image}
                          alt={category.title}
                          fill
                          className="object-contain"
                          onError={(e) => {
                            // Fallback if image doesn't exist
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      </div>

                      {/* Title */}
                      <p className="text-sm font-semibold text-gray-800">
                        {category.title}
                      </p>

                      {/* Quick descriptions */}
                      {!hasGroups && (
                        <p className="mt-1 text-center text-xs text-gray-400">
                          No groups available
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Expanded category - show interest groups */}
              {expandedCategory && (
                <div className="animate-in slide-in-from-top-2 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <h4 className="mb-3 text-sm font-semibold text-gray-700">
                    Select from{" "}
                    {CATEGORIES.find((c) => c.id === expandedCategory)?.title}:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(groupsByCategory[expandedCategory] || []).map((ig) => {
                      const isSelected = selectedIds.includes(ig.id);
                      return (
                        <button
                          key={ig.id}
                          type="button"
                          onClick={() => toggleGroup(ig.id)}
                          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-all ${
                            isSelected
                              ? "border-[#456ff6] bg-[#456ff6] text-white"
                              : "border-gray-200 bg-white text-gray-700 hover:border-[#456ff6] hover:bg-blue-50"
                          }`}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5" />}
                          {ig.name}
                        </button>
                      );
                    })}
                    {(groupsByCategory[expandedCategory] || []).length ===
                      0 && (
                      <p className="text-sm text-gray-400">
                        No interest groups in this category yet.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Selected groups summary */}
              {selectedIds.length > 0 && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                  <h4 className="mb-2 text-sm font-semibold text-green-800">
                    Selected Groups ({selectedIds.length}/{MAX_GROUPS}):
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedIds.map((id) => {
                      const ig = igListData?.interestGroup.find(
                        (g) => g.id === id,
                      );
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700"
                        >
                          {ig?.name || id}
                          <button
                            type="button"
                            onClick={() => toggleGroup(id)}
                            className="ml-1 text-green-500 hover:text-green-700"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
            disabled={isSaving || isLoadingGroups}
          >
            {isSaving && <Spinner className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
