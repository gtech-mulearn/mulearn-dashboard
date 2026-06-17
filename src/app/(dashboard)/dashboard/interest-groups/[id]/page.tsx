/**
 * Interest Group Detail Page
 *
 * 📍 src/app/(dashboard)/dashboard/interest-groups/[id]/page.tsx
 *
 * Detailed view of a specific interest group.
 */

import { InterestGroupDetailClient } from "@/features/interest-groups";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interest Group Details",
  description: "Detailed view of a specific interest group.",
};

export default async function InterestGroupDetailPage() {
  return <InterestGroupDetailClient />;
}
