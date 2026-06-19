import { env } from "../../config/env";

export function getBaseUrl(): string {
  return env.BACKEND_URL ?? env.NEXT_PUBLIC_DJANGO_API_URL;
}
