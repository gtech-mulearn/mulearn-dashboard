import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  // Normalise to https so Next.js Image remotePatterns match correctly
  const normalised = url.startsWith("http://")
    ? url.replace("http://", "https://")
    : url;
  if (normalised.startsWith("https://")) return normalised;
  if (normalised.startsWith("/images/") || normalised.startsWith("/assets/"))
    return normalised;
  const base = (process.env.NEXT_PUBLIC_DJANGO_API_URL ?? "").replace(
    /\/$/,
    "",
  );

  // If it already has /media/ prefix, do not double-prefix it
  if (normalised.startsWith("/media/") || normalised.startsWith("media/")) {
    const relativePath = normalised.startsWith("/")
      ? normalised
      : `/${normalised}`;
    return `${base}${relativePath}`;
  }

  const relativePath = normalised.startsWith("/")
    ? normalised
    : `/media/${normalised}`;
  return `${base}${relativePath}`;
}
