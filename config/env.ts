import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /*
   * Server-side environment variables
   * ❗ These are NOT exposed to the browser
   */
  server: {
    // Example (add later if needed)
    // DATABASE_URL: z.string().url(),
  },

  /*
   * Client-side environment variables
   * ❗ MUST start with NEXT_PUBLIC_
   */
  client: {
    NEXT_PUBLIC_DJANGO_API_URL: z.string().url(),
  },

  /*
   * Runtime values
   * Required for Next.js App Router
   */
  runtimeEnv: {
    NEXT_PUBLIC_DJANGO_API_URL: process.env.NEXT_PUBLIC_DJANGO_API_URL,
  },

  /*
   * Skip validation during build (optional)
   * Useful in CI or Docker
   */
  skipValidation: false,
});
