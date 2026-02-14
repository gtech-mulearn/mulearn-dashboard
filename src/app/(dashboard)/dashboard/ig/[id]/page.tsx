/**
 * Interest Group Detail Page
 *
 * 📍 src/app/(dashboard)/dashboard/ig/[id]/page.tsx
 *
 * Detailed view of a specific interest group.
 */

import { InterestGroupDetailClient } from "@/features/interest-groups";

type InterestGroupDetailPageProps = {
  params: {
    id: string;
  };
};

export default function InterestGroupDetailPage({
  params,
}: InterestGroupDetailPageProps) {
  return <InterestGroupDetailClient id={params.id} />;
}
