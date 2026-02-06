/**
 * Karma History Tab Component
 *
 * 📍 src/features/profile/components/karma-history.tsx
 *
 * Displays user's activity log with karma points in card grid.
 * Matches old codebase card-based layout.
 */

"use client";

import { Flame, Loader2 } from "lucide-react";
import { useState } from "react";
import type { UserLogData } from "../schemas";

interface KarmaHistoryProps {
  userLog?: UserLogData;
  isLoading?: boolean;
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  } catch {
    return dateString;
  }
}

export function KarmaHistory({ userLog, isLoading }: KarmaHistoryProps) {
  const [hideChatKarma, setHideChatKarma] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userLog || userLog.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="italic text-[#456ff6]">
          Hey there! We know you&apos;re new here, so grab some Karma and
          we&apos;ll keep score of it here!
        </p>
      </div>
    );
  }

  // Filter chat karma if toggle is on
  const filteredLog = hideChatKarma
    ? userLog.filter((log) => log.task_name !== "Chat Karma")
    : userLog;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
      {/* Header with toggle */}
      <div className="mb-4 flex items-center justify-end gap-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
          Hide daily chat karma
          <input
            type="checkbox"
            checked={hideChatKarma}
            onChange={(e) => setHideChatKarma(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-[#456ff6] focus:ring-[#456ff6]"
          />
        </label>
      </div>

      {/* Card Grid */}
      <div className="grid max-h-[450px] gap-5 overflow-y-auto sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredLog.map((entry, index) => (
          <div
            key={`${entry.task_name}-${entry.created_date}-${index}`}
            className="relative min-h-[220px] overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            {/* Background Karma Icon */}
            <div className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-10">
              <Flame className="h-32 w-32 text-blue-600" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex h-full flex-col items-center justify-center text-center">
              {/* Karma Amount */}
              <h1 className="text-3xl font-bold text-[#014bb2]">
                {entry.karma} ϰ
              </h1>
              <h2 className="text-sm text-gray-600">Karma</h2>

              {/* Task Name */}
              <div className="mt-5">
                <p className="text-xs text-gray-500">Awarded for</p>
                <p className="mt-1 rounded bg-blue-100/50 px-2 py-1 text-sm font-medium text-[#014bb2]">
                  #{entry.task_name}
                </p>
              </div>

              {/* Relative Time */}
              <p className="mt-6 text-xs text-gray-500">
                {formatRelativeTime(entry.created_date)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
