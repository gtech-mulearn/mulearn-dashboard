"use client";
import Image from "next/image";
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
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <Image
        src={imageUrl}
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
