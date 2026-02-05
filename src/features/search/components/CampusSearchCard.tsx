"use client";

import Link from "next/link";
import { MapPin, Users, Trophy } from "lucide-react";
import type { CampusSearchResult } from "../schemas";

interface CampusSearchCardProps {
  campus: CampusSearchResult;
}

export function CampusSearchCard({ campus }: CampusSearchCardProps) {
  return (
    <Link
      href={`/dashboard/campuses/${campus.code}`}
      className="block rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-[#0961F5] hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Campus Info */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-gray-900">
            {campus.title}
          </h3>
          <p className="text-sm font-medium text-gray-500">{campus.code}</p>

          <div className="mt-2 space-y-1">
            {/* Zone & District */}
            {(campus.zone || campus.district) && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate">
                  {[campus.zone, campus.district].filter(Boolean).join(", ")}
                </span>
              </div>
            )}

            {/* Member Count */}
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Users className="h-3.5 w-3.5" />
              <span>{campus.member_count.toLocaleString()} members</span>
            </div>
          </div>
        </div>

        {/* Rank */}
        {campus.rank && (
          <div className="flex-shrink-0 text-right">
            <div className="flex items-center gap-1 text-lg font-bold text-[#0961F5]">
              <Trophy className="h-5 w-5" />#{campus.rank}
            </div>
            <div className="text-xs text-gray-500">Rank</div>
          </div>
        )}
      </div>
    </Link>
  );
}
