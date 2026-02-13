/**
 * Interest Groups Page
 *
 *  src/app/(dashboard)/dashboard/ig/page.tsx
 *
 * Discover and explore all available interest groups.
 */

"use client";

import { Sparkles } from "lucide-react";
import {
  InterestGroupsGrid,
  useInterestGroupsList,
} from "@/features/interest-groups";

export default function InterestGroupsPage() {
  const { data, isLoading, error } = useInterestGroupsList();

  const groups = data?.response?.data || [];

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 p-3">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-4xl font-black text-foreground">
              Discover Interest Groups
            </h1>
          </div>
        </div>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Join communities that share your passion. Connect, learn, and grow
          with like-minded individuals.
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6">
          <h3 className="font-semibold text-destructive">
            Failed to load interest groups
          </h3>
          <p className="mt-1 text-sm text-destructive/80">
            Please try again later or contact support if the issue persists.
          </p>
        </div>
      )}

      {/* Interest Groups Grid */}
      <InterestGroupsGrid groups={groups} isLoading={isLoading} />
    </div>
  );
}
