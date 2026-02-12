/**
 * Circle List Component
 *
 * 📍 src/features/learning-circle/components/circle-list.tsx
 *
 * Grid display of learning circles with loading and empty states.
 */

"use client";

import { Loader2, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
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
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-gray-500">Loading circles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="search"
          placeholder="Search circles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Empty State */}
      {filteredCircles.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-gray-50 p-12">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
            <Users className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            {searchQuery ? "No circles found" : "No Learning Circles Yet"}
          </h3>
          <p className="text-center text-sm text-gray-500 max-w-sm">
            {searchQuery
              ? "Try a different search term"
              : "Be the first to create a learning circle and start collaborating!"}
          </p>
        </div>
      )}

      {/* Circle Grid */}
      {filteredCircles.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCircles.map((circle) => (
            <CircleCard key={circle.id} circle={circle} />
          ))}
        </div>
      )}
    </div>
  );
}
