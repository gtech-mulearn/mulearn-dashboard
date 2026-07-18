import { Trophy } from "lucide-react";
import Image from "next/image";
import * as React from "react";

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
  const [hasError, setHasError] = React.useState(false);

  // Reset error state when the image URL changes (e.g. switching rows)
  // biome-ignore lint/correctness/useExhaustiveDependencies: imageUrl triggers resetting the error state
  React.useEffect(() => {
    setHasError(false);
  }, [imageUrl]);

  let src = imageUrl;
  if (src && !src.startsWith("http")) {
    // The backend stores files under Django's MEDIA_URL (typically /media/).
    // Relative paths like "achievements/icons/uuid.jpg" must be prefixed with
    // the API origin + /media/ to form a valid URL.
    const base = (process.env.NEXT_PUBLIC_DJANGO_API_URL ?? "").replace(
      /\/$/,
      "",
    );
    const relativePath = src.startsWith("/") ? src : `/media/${src}`;
    src = `${base}${relativePath}`;
  }

  if (src && !hasError) {
    return (
      <Image
        src={src}
        alt={name ?? "Achievement icon"}
        width={size}
        height={size}
        className="rounded-md object-cover"
        onError={() => setHasError(true)}
        unoptimized
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
