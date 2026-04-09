/**
 * Interest Groups Client Component
 *
 * 📍 src/features/interest-groups/components/interest-groups-client.tsx
 *
 * Client component wrapper for the interest groups listing page.
 */

"use client";

import { Sparkles } from "lucide-react";
import { useInterestGroupsList } from "../hooks";
import { InterestGroupsGrid } from "./interest-groups-grid";

export function InterestGroupsClient() {
  const { data, isLoading, error } = useInterestGroupsList();

  const groups = data?.response?.interestGroup || [];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 px-4 py-8 md:px-6 lg:px-8">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-linear-to-br from-primary/20 to-primary/10 p-3">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground md:text-3xl lg:text-4xl">
              Discover Interest Groups
            </h1>
          </div>
        </div>
        <p className="max-w-2xl text-base sm:text-lg text-muted-foreground">
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
