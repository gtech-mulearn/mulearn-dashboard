"use client";

import { Calendar } from "lucide-react";
import Image from "next/image";
import type { ContentStatus } from "../schemas";

const STATUS_CLASSES: Record<ContentStatus, string> = {
  upcoming: "bg-chart-2/20 border border-chart-2/30",
  ongoing: "bg-success/20 border border-success/30",
  completed: "bg-muted/60 border border-border",
};

const GRADIENTS = [
  "from-chart-1 to-chart-2",
  "from-chart-4 to-chart-5",
  "from-chart-3 to-chart-2",
  "from-chart-5 to-chart-1",
  "from-chart-2 to-chart-3",
];

function seedGradient(id: string): string {
  const n = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return GRADIENTS[n % GRADIENTS.length];
}

function formatDate(date: string): string {
  try {
    return new Date(date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return date;
  }
}

export interface MediaCardProps {
  id: string;
  title: string;
  subtitle?: string;
  date: string;
  status: ContentStatus;
  imageSrc?: string | null;
  onClick: () => void;
}

export function MediaCard({
  id,
  title,
  subtitle,
  date,
  status,
  imageSrc,
  onClick,
}: MediaCardProps) {
  const gradient = seedGradient(id);

  return (
    <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <button
        type="button"
        className="absolute inset-0 z-10 cursor-pointer"
        onClick={onClick}
        aria-label={`View details for ${title}`}
      />

      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-background/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Status */}
        <div className="absolute left-3 top-3 z-10">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize backdrop-blur-sm ${STATUS_CLASSES[status]}`}
          >
            {status}
          </span>
        </div>

        {/* Content */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-4 text-foreground">
          <div className="mb-1 flex items-center gap-1 text-[11px] opacity-75">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(date)}</span>
          </div>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 line-clamp-1 text-xs opacity-80">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function MediaCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="aspect-[4/3] w-full animate-pulse bg-muted" />
    </div>
  );
}
