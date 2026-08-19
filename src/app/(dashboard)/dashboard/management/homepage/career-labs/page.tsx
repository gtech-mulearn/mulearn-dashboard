import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { HiringTable } from "@/features/career-labs";
import { MANAGEMENT_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Career Labs | Management",
  description: "Manage hiring postings shown on the homepage.",
};

export default async function CareerLabsPage() {
  await requireRole(MANAGEMENT_ROLES);

  return (
    <div className="space-y-6 py-6">
      <Link
        href="/dashboard/management/homepage"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Homepage
      </Link>
      <HiringTable />
    </div>
  );
}
