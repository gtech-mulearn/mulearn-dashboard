/**
 * Interest Group Detail Page
 *
 * 📍 src/app/(dashboard)/dashboard/ig/[id]/page.tsx
 *
 * Detailed view of a specific interest group.
 */

import { InterestGroupDetailClient } from "@/features/interest-groups";

type InterestGroupDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function InterestGroupDetailPage({
  params,
}: InterestGroupDetailPageProps) {
  const { id } = await params;

  return <InterestGroupDetailClient id={id} />;
}
