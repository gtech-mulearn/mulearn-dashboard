import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /*
   * Server-side environment variables
   * ❗ These are NOT exposed to the browser
   */
  server: {
    BACKEND_URL: z.string().url().optional(),
  },

  client: {
    NEXT_PUBLIC_DJANGO_API_URL: z.string().url(),
    NEXT_PUBLIC_DISCORD_AUTH_URL: z.string().url(),
    NEXT_PUBLIC_CDN_URL: z.string().url().optional(),
  },

  runtimeEnv: {
    BACKEND_URL: process.env.BACKEND_URL,
    NEXT_PUBLIC_DJANGO_API_URL: process.env.NEXT_PUBLIC_DJANGO_API_URL,
    NEXT_PUBLIC_DISCORD_AUTH_URL: process.env.NEXT_PUBLIC_DISCORD_AUTH_URL,
    NEXT_PUBLIC_CDN_URL: process.env.NEXT_PUBLIC_CDN_URL,
  },

  /*
   * Skip validation during build (optional)
   * Useful in CI or Docker
   */
  skipValidation: false,
});
