"use client";

import { Check, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useInterestGroupsList } from "../hooks";
import type { InterestGroup, InterestGroupListItem } from "../schemas";

interface EditInterestGroupsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentGroups: InterestGroup[];
  onSave: (groupIds: string[]) => Promise<void>;
}

const CATEGORY_TABS = [
  { id: "all", label: "All" },
  { id: "coder", label: "Coder" },
  { id: "maker", label: "Maker" },
  { id: "manager", label: "Manager" },
  { id: "creative", label: "Creative" },
];

const MAX_GROUPS = 3;

export function EditInterestGroupsModal({
  open,
  onOpenChange,
  currentGroups,
  onSave,
}: EditInterestGroupsModalProps) {
  const { data: igListData, isLoading } = useInterestGroupsList();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedIds(
        currentGroups.map((g) => g.id).filter((id): id is string => !!id),
      );
      setSearch("");
      setActiveCategory("all");
    }
  }, [open, currentGroups]);

  const allIgs = igListData?.interestGroup || [];

  const filteredIgs = useMemo(() => {
    return allIgs.filter((ig) => {
      const matchesSearch = ig.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesCategory =
        activeCategory === "all" || ig.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allIgs, search, activeCategory]);

  const selectedIgs = useMemo(
    () =>
      selectedIds
        .map((id) => allIgs.find((ig) => ig.id === id))
        .filter((ig): ig is InterestGroupListItem => !!ig),
    [selectedIds, allIgs],
  );

  const atLimit = selectedIds.length >= MAX_GROUPS;

  const toggleGroup = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= MAX_GROUPS) {
        toast.error("You can only select 3 interest groups");
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
      <DialogContent className="flex flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        {/* Header */}
        <div className="shrink-0 border-b border-border/60 px-6 pb-4 pt-6">
          <DialogTitle className="text-base font-semibold tracking-tight">
            Your Interests
          </DialogTitle>
          <DialogDescription className="mt-0.5 text-sm text-muted-foreground">
            Choose up to 3 groups that match your goals
          </DialogDescription>

          {/* Progress indicator */}
          {(() => {
            const overLimit = selectedIds.length > MAX_GROUPS;
            const excess = selectedIds.length - MAX_GROUPS;
            return (
              <div className="mt-4 flex items-center gap-2.5">
                <div className="flex gap-1.5">
                  {Array.from({ length: MAX_GROUPS }, (_, i) => i).map(
                    (dotIndex) => (
                      <div
                        key={`dot-${dotIndex}`}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          overLimit
                            ? "w-5 bg-destructive"
                            : dotIndex < selectedIds.length
                              ? "w-5 bg-primary"
                              : "w-1.5 bg-border"
                        }`}
                      />
                    ),
                  )}
                </div>
                {overLimit ? (
                  <span className="text-xs font-medium text-destructive">
                    Remove {excess} to continue
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {selectedIds.length} of {MAX_GROUPS} chosen
                  </span>
                )}
              </div>
            );
          })()}

          {/* Selected chips */}
          {selectedIgs.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {selectedIgs.map((ig) => {
                const overLimit = selectedIds.length > MAX_GROUPS;
                return (
                  <span
                    key={ig.id}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                      overLimit
                        ? "bg-destructive/10 text-destructive"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {ig.name}
                    <button
                      type="button"
                      onClick={() => toggleGroup(ig.id)}
                      className={`rounded-full p-0.5 transition-colors ${
                        overLimit
                          ? "hover:bg-destructive/20"
                          : "hover:bg-primary/20"
                      }`}
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Search + category tabs */}
        <div className="shrink-0 space-y-3 px-6 pb-3 pt-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search interest groups…"
              className="w-full rounded-lg border border-border bg-muted/40 py-2 pl-9 pr-9 text-sm outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary/40 focus:bg-background"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Category tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  activeCategory === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* IG grid — scrollable */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-4">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Spinner className="h-5 w-5 text-muted-foreground" />
            </div>
          ) : filteredIgs.length === 0 ? (
            <div className="flex h-40 items-center justify-center">
              <p className="text-sm text-muted-foreground">
                {search
                  ? `No results for "${search}"`
                  : "No groups in this category"}
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {filteredIgs.map((ig) => {
                const isSelected = selectedIds.includes(ig.id);
                const isDimmed = !isSelected && atLimit;
                return (
                  <button
                    key={ig.id}
                    type="button"
                    onClick={() => toggleGroup(ig.id)}
                    className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : isDimmed
                          ? "cursor-not-allowed border-border/40 bg-muted/20 text-muted-foreground/40"
                          : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/5"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 shrink-0" />}
                    {ig.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border/60 px-6 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="text-muted-foreground"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={
              isSaving ||
              isLoading ||
              selectedIds.length === 0 ||
              selectedIds.length > MAX_GROUPS
            }
            className="min-w-20"
          >
            {isSaving ? <Spinner className="h-3.5 w-3.5" /> : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
