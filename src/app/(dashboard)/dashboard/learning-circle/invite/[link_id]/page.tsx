/**
 * Invite Link Page
 *
 * 📍 src/app/(dashboard)/dashboard/learning-circle/invite/[link_id]/page.tsx
 *
 * Accept or reject a circle invitation via shareable link.
 */

import { InviteLinkView } from "@/features/learning-circle";

interface PageProps {
  params: Promise<{ link_id: string }>;
}

export default async function InviteLinkPage({ params }: PageProps) {
  const { link_id } = await params;

  return <InviteLinkView linkId={link_id} />;
}
