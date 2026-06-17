/**
 * My Invitations Page
 *
 * 📍 src/app/(dashboard)/dashboard/learning-circle/invites/page.tsx
 *
 * Shows current user's pending circle invitations.
 */

import { PendingInvites } from "@/features/learning-circle";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Invitations",
  description: "View your pending learning circle invitations.",
};

export default function InvitesPage() {
  return <PendingInvites />;
}
