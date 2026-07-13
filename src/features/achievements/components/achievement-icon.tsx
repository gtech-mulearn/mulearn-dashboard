"use client";
import { Trophy } from "lucide-react";

interface AchievementIconProps {
  imageUrl?: string | null;
  name?: string;
  size?: number;
}

export function AchievementIcon({
  imageUrl,
  name,
  size = 40,
}: AchievementIconProps) {
  let src = imageUrl;
  if (src && !src.startsWith("http")) {
    const base = process.env.NEXT_PUBLIC_DJANGO_API_URL ?? "";
    const sep = base.endsWith("/") || src.startsWith("/") ? "" : "/";
    src = `${base}${sep}${src}`;
  }

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name ?? "Achievement icon"}
        width={size}
        height={size}
        className="rounded-md object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
          const sibling = e.currentTarget.nextSibling as HTMLElement | null;
          if (sibling) sibling.style.display = "flex";
        }}
        data-testid="achievement-icon-img"
      />
    );
  }

  return (
    <div
      className="flex items-center justify-center rounded-md bg-muted"
      style={{ width: size, height: size }}
      data-testid="achievement-icon-fallback"
    >
      <Trophy
        className="text-muted-foreground"
        style={{ width: size * 0.55, height: size * 0.55 }}
      />
    </div>
  );
}
