/**
 * Learning Circle Detail Page
 *
 * 📍 src/app/(dashboard)/dashboard/learning-circle/[id]/page.tsx
 *
 * Individual circle detail view.
 */

import { CircleDetail } from "@/features/learning-circle";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CircleDetailPage({ params }: PageProps) {
  const { id } = await params;

  return <CircleDetail circleId={id} />;
}
