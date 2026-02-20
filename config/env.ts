import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /*
   * Server-side environment variables
   * ❗ These are NOT exposed to the browser
   */
  server: {
    // Optional internal backend URL for server→backend calls (e.g. http://backend:8000).
    // Falls back to NEXT_PUBLIC_DJANGO_API_URL when not set.
    BACKEND_URL: z.string().url().optional(),
  },

  /*
   * Client-side environment variables
   * ❗ MUST start with NEXT_PUBLIC_
   */
  client: {
    NEXT_PUBLIC_DJANGO_API_URL: z.string().url(),
    NEXT_PUBLIC_DISCORD_AUTH_URL: z.string().url(),
  },

  /*
   * Runtime values
   * Required for Next.js App Router
   */
  runtimeEnv: {
    BACKEND_URL: process.env.BACKEND_URL,
    NEXT_PUBLIC_DJANGO_API_URL: process.env.NEXT_PUBLIC_DJANGO_API_URL,
    NEXT_PUBLIC_DISCORD_AUTH_URL: process.env.NEXT_PUBLIC_DISCORD_AUTH_URL,
  },

  /*
   * Skip validation during build (optional)
   * Useful in CI or Docker
   */
  skipValidation: false,
});
