import { ChevronLeft, Gamepad2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { GritMeterItem } from "@/features/grit-meter/components/grit-meter-item";
import { ROLES } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Features | System & Configurations",
  description: "Manage system feature flags and toggles.",
};

export default async function FeaturesPage() {
  await requireRole([ROLES.ADMIN]);

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

      {/* Main Content */}
      <div className="w-full space-y-6">
        {/* Category Box: Gamification */}
        <div className="rounded-xl border bg-card overflow-hidden shadow-2xs">
          {/* Category Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/30">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400">
                <Gamepad2 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Gamification
                </h3>
                <p className="text-xs text-muted-foreground">
                  Features related to user levels, grit, activity tracking, and
                  rewards.
                </p>
              </div>
            </div>
          </div>

          {/* Category Feature List */}
          <div className="divide-y bg-card">
            <GritMeterItem />
          </div>
        </div>
      </div>
    </div>
  );
}
