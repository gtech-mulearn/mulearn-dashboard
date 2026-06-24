/**
 * Circle List Component
 *
 * 📍 src/features/learning-circle/components/circle-list.tsx
 *
 * Masonry-style grid of learning circles with refined search and empty states.
 */

"use client";

import { Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useCircles } from "../hooks";
import { CircleCard } from "./circle-card";

export function CircleList() {
  const { data: circles, isLoading } = useCircles();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCircles = useMemo(() => {
    if (!circles) return [];
    if (!searchQuery.trim()) return circles;

    const query = searchQuery.toLowerCase();
    return circles.filter(
      (circle) =>
        circle.title.toLowerCase().includes(query) ||
        circle.ig.toLowerCase().includes(query) ||
        circle.org?.toLowerCase().includes(query),
    );
  }, [circles, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
            <Spinner className="relative h-8 w-8 text-primary" />
          </div>
          <p
            className="text-[13px] font-medium text-muted-foreground"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Loading circles…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="space-y-8"
      style={{
        fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
        fontFeatureSettings: "'cv02', 'cv03', 'cv04'",
      }}
    >
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search circles by name, topic, or organization…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-12 rounded-xl border-[1.5px] border-border bg-card pl-11 pr-4 text-[14px] text-foreground shadow-none
            placeholder:text-muted-foreground
            focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/10 focus-visible:outline-none
            transition-all duration-200"
        />
      </div>

      {/* Empty State */}
      {filteredCircles.length === 0 && (
        <div className="lc-fade-in flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-8 py-24 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Users className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-[18px] font-bold tracking-[-0.02em] text-foreground">
            {searchQuery ? "No circles found" : "No Learning Circles Yet"}
          </h3>
          <p className="max-w-sm text-center text-[14px] leading-relaxed text-muted-foreground">
            {searchQuery
              ? "Try a different search term or adjust your filters"
              : "Be the first to create a learning circle and start collaborating with peers!"}
          </p>
        </div>
      )}

      {/* Circle Grid — CSS columns for masonry effect */}
      {filteredCircles.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 [&>a]:mb-4 [&>a]:break-inside-avoid [&>a]:block">
          {filteredCircles.map((circle, index) => (
            <div
              key={circle.id}
              className="mb-4 break-inside-avoid lc-slide-up"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <CircleCard circle={circle} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
