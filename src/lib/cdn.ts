import { env } from "config/env";

export function cdnUrl(path: string): string {
  const base = env.NEXT_PUBLIC_CDN_URL;
  const cleanPath = path.replace(/^\/+/, "");
  return `${base}/${cleanPath}`;
}
