/**
 * Interest Groups Client Component
 *
 * 📍 src/features/interest-groups/components/interest-groups-client.tsx
 *
 * Client component wrapper for the interest groups listing page.
 */

"use client";

import { PageHeader } from "@/components/ui/page-header";
import { useInterestGroupsList } from "../hooks";
import { InterestGroupsGrid } from "./interest-groups-grid";

export function InterestGroupsClient() {
  const { data, isLoading, error } = useInterestGroupsList();

  const groups = data?.response?.interestGroup || [];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 py-6 sm:py-8">
      {/* Header Section */}
      <PageHeader
        title="Discover Interest Groups"
        description="Join communities that share your passion. Connect, learn, and grow with like-minded individuals."
      />

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
