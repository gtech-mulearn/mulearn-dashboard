/**
 * Learning Circle Detail Page
 *
 * 📍 src/app/(dashboard)/dashboard/learning-circle/[id]/page.tsx
 *
 * Individual circle detail view.
 */

import type { Metadata } from "next";
import { CircleDetail } from "@/features/learning-circle";

export const metadata: Metadata = {
  title: "Learning Circle Details",
  description: "View details for a specific learning circle.",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CircleDetailPage({ params }: PageProps) {
  const { id } = await params;

  return <CircleDetail circleId={id} />;
}
