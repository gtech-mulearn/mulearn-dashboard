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
  params,
}: {
  params: Promise<{ code?: string; error?: string }>;
}) {
  const code = (await params).code;
  const error = (await params).error;

  return <CallbackClient code={code} error={error} />;
}
