/**
 * Interest Group Detail Client Component
 *
 * 📍 src/features/interest-groups/components/interest-group-detail-client.tsx
 *
 * Client component wrapper for the interest group detail page.
 */

"use client";

import { ArrowLeft, Calendar, Sparkles, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useInterestGroupDetail } from "../hooks";

type InterestGroupDetailClientProps = {
  id: string;
};

export function InterestGroupDetailClient({
  id,
}: InterestGroupDetailClientProps) {
  const router = useRouter();
  const { data, isLoading, error } = useInterestGroupDetail(id);

  const group = data?.response;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-2">
            <div className="h-3 w-3 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
            <div className="h-3 w-3 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
            <div className="h-3 w-3 animate-bounce rounded-full bg-primary" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Loading interest group...
          </p>
        </div>
      </div>
    );
  }

  if (error || !group) {
    // Check if it's a server error (500) vs not found (404)
    const isServerError =
      error &&
      "status" in error &&
      typeof error.status === "number" &&
      error.status >= 500;

    return (
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-8 text-center">
          <h3 className="text-lg font-semibold text-destructive">
            {isServerError ? "Server Error" : "Interest Group Not Found"}
          </h3>
          <p className="mt-2 text-sm text-destructive/80">
            {isServerError
              ? "We're experiencing technical difficulties loading this interest group. Please try again later or contact support if the issue persists."
              : "The interest group you're looking for doesn't exist or has been removed."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Interest Groups
      </button>

      {/* Header with Gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 p-12">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        <div className="relative space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              {group.category && (
                <div className="inline-block rounded-xl bg-white/20 px-4 py-2 backdrop-blur-sm">
                  <p className="text-sm font-semibold uppercase tracking-wider text-white/90">
                    {group.category}
                  </p>
                </div>
              )}

              <h1 className="font-display text-5xl font-black text-white drop-shadow-lg">
                {group.name}
              </h1>

              {group.description && (
                <p className="max-w-2xl text-lg text-white/90">
                  {group.description}
                </p>
              )}
            </div>

            {group.code && (
              <div className="rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                <p className="text-sm font-bold text-white">{group.code}</p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4">
            {group.member_count !== undefined && (
              <div className="flex items-center gap-2 rounded-2xl bg-white/20 px-5 py-3 backdrop-blur-sm">
                <Users className="h-5 w-5 text-white" />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {group.member_count.toLocaleString()}
                  </p>
                  <p className="text-xs font-medium text-white/80">Members</p>
                </div>
              </div>
            )}

            {group.created_at && (
              <div className="flex items-center gap-2 rounded-2xl bg-white/20 px-5 py-3 backdrop-blur-sm">
                <Calendar className="h-5 w-5 text-white" />
                <div>
                  <p className="text-sm font-semibold text-white">
                    Created{" "}
                    {new Date(group.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-3xl border border-border bg-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">About</h2>
            </div>

            {group.description ? (
              <p className="text-base leading-relaxed text-muted-foreground">
                {group.description}
              </p>
            ) : (
              <p className="text-sm italic text-muted-foreground">
                No description available for this interest group yet.
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-bold text-foreground">
              Quick Info
            </h3>
            <div className="space-y-4">
              {group.code && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Code
                  </p>
                  <p className="mt-1 font-mono text-sm font-semibold text-foreground">
                    {group.code}
                  </p>
                </div>
              )}

              {group.category && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Category
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {group.category}
                  </p>
                </div>
              )}

              {group.member_count !== undefined && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Members
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {group.member_count.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
