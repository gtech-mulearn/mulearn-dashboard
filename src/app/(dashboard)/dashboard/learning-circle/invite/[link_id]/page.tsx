/**
 * Invite Link Page
 *
 * 📍 src/app/(dashboard)/dashboard/learning-circle/invite/[link_id]/page.tsx
 *
 * Accept or reject a circle invitation via shareable link.
 */

import { InviteLinkView } from "@/features/learning-circle";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Circle Invitation",
  description: "Accept or reject a learning circle invitation.",
};

interface PageProps {
  params: Promise<{ link_id: string }>;
}

export default async function InviteLinkPage({ params }: PageProps) {
  const { link_id } = await params;

  return <InviteLinkView linkId={link_id} />;
}
