import path from "node:path";
import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
    // e2e/ holds Playwright tests (bun run smoke), which Vitest must never pick up.
    exclude: [...configDefaults.exclude, "e2e/**"],
    env: {
      NEXT_PUBLIC_DJANGO_API_URL: "http://localhost:8000",
      NEXT_PUBLIC_DISCORD_AUTH_URL: "http://localhost:3000",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
