/**
 * Google OAuth2 Callback Page
 *
 * 📍 src/app/(auth)/callback/page.tsx
 *
 * Handles the redirect from Google, exchanges the code for tokens,
 * and redirects the user to the dashboard.
 */

import { CallbackClient } from "./callback-client";

export default async function CallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string }>;
}) {
  const code = (await searchParams).code;
  const error = (await searchParams).error;

  return <CallbackClient code={code} error={error} />;
}
