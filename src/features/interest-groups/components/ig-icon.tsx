/**
 * Shared Interest Group icon renderer
 *
 * 📍 src/features/interest-groups/components/ig-icon.tsx
 *
 * Single source of truth for "show the IG's icon image, or fall back to a
 * BookOpen glyph" — used by the public IG cards/grid/detail page, the admin
 * IG table/detail panel, and the campus chapter list, so every surface
 * degrades the same way instead of five near-identical implementations.
 */

"use client";

import { BookOpen } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface IGIconProps {
  /** Preferred source — pass `icon_image` first, fall back to legacy `icon` at the call site. */
  src?: string | null;
  /** Accessible label; defaults to empty (decorative) since IG name is usually shown alongside. */
  alt?: string;
  /** Pixel size of the square avatar box. Defaults to 36. */
  size?: number;
  className?: string;
}

function isRenderableSrc(src?: string | null): src is string {
  return !!src && /^(https?:\/\/|\/)/.test(src);
}

export function IGIcon({ src, alt = "", size = 36, className }: IGIconProps) {
  const [hasError, setHasError] = useState(false);
  const showImage = isRenderableSrc(src) && !hasError;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted text-muted-foreground",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <Image
          key={src}
          src={src}
          alt={alt}
          width={size}
          height={size}
          className="h-full w-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <BookOpen className="h-1/2 w-1/2" />
      )}
    </div>
  );
}
