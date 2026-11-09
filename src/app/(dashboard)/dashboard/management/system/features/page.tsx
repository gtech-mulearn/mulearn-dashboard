import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { MANAGEMENT_ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";
import { FeaturesClient } from "./features-client";

export const metadata: Metadata = {
  title: "Features | System & Configurations",
  description: "Manage system feature flags and toggles.",
};

export default async function FeaturesPage() {
  await requireRole(MANAGEMENT_ROLES);

  return (
    <div className="space-y-8 py-6">
      {/* Breadcrumb Header */}
      <div className="space-y-4">
        <Link
          href="/dashboard/management/system"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to System & Configurations
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Features</h1>
          <p className="mt-1 text-muted-foreground">
            Configure system feature flags, status, and toggles.
          </p>
        </div>
      </div>

      <FeaturesClient />
    </div>
  );
}
