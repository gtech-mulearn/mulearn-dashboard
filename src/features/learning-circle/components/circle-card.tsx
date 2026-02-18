/**
 * Circle Card Component
 *
 * 📍 src/features/learning-circle/components/circle-card.tsx
 *
 * Individual learning circle card with hover effects.
 */

"use client";

import { Users } from "lucide-react";
import Link from "next/link";
import type { LearningCircle } from "../schemas";

// Gradient colors for visual variety
const GRADIENT_CLASSES = [
  "gradient-1",
  "gradient-2",
  "gradient-3",
  "gradient-4",
  "gradient-5",
  "gradient-6",
];

function getGradientClass(id: string): string {
  const index =
    id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    GRADIENT_CLASSES.length;
  return GRADIENT_CLASSES[index];
}

interface CircleCardProps {
  circle: LearningCircle;
}

export function CircleCard({ circle }: CircleCardProps) {
  const gradientClass = getGradientClass(circle.id);

  return (
    <Link href={`/dashboard/learning-circle/${circle.id}`}>
      <div
        className={`group relative overflow-hidden rounded-2xl border border-gray-100 ${gradientClass} p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
      >
        {/* Decorative circles */}
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/30 blur-2xl" />
        <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white/20 blur-xl" />

        {/* Content */}
        <div className="relative">
          {/* IG Badge */}
          <div className="mb-4 inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-gray-700 shadow-sm backdrop-blur-sm">
            {circle.ig}
          </div>

          {/* Title */}
          <h3 className="mb-2 text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {circle.title}
          </h3>

          {/* Organization */}
          <p className="mb-4 text-sm text-gray-600 line-clamp-1">
            {circle.org || "No organization"}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Users className="h-4 w-4" />
              <span>{circle.attendees?.length || 0} members</span>
            </div>

            {/* Arrow indicator */}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-muted-foreground shadow-sm backdrop-blur-sm transition-all group-hover:bg-primary group-hover:text-primary-foreground">
              <svg
                role="img"
                aria-label="Arrow Icon"
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
