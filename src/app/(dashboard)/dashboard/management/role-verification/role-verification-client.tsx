"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ManageCompaniesTable } from "@/features/manage-companies";
import { MentorVerificationPanel } from "@/features/mentor/admin/components/mentor-verification-page";
import { VerifyOrgsView } from "@/features/organizations";
import { RoleVerificationTable } from "@/features/role-verification";
import {
  parseVerificationTab,
  VERIFICATION_TAB_LABELS,
  VERIFICATION_TABS,
  type VerificationTab,
} from "@/features/role-verification/lib/tabs";
import { cn } from "@/lib/utils";

export function RoleVerificationClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // The URL is the only tab state, so hub cards and old-route redirects can
  // deep-link to a queue.
  const activeTab = parseVerificationTab(searchParams.get("tab"));

  const selectTab = (tab: VerificationTab) => {
    router.replace(`${pathname}?tab=${tab}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Role Verification
        </h1>
        <p className="text-sm text-muted-foreground md:text-base mt-2">
          Review mentor, enabler, organization and company requests.
        </p>
      </div>

      {/* Underline tabs, as on the Organizations page. */}
      <div
        role="tablist"
        aria-label="Verification queues"
        className="flex overflow-x-auto gap-1 border-b pb-0 no-scrollbar"
      >
        {VERIFICATION_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => selectTab(tab)}
            className={cn(
              "inline-flex shrink-0 items-center px-4 py-2.5 text-sm font-medium rounded-none border-b-2 transition-colors",
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {VERIFICATION_TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Only the active queue mounts, so one list request runs at a time. */}
      <div role="tabpanel">
        {activeTab === "mentor" && <MentorVerificationPanel />}
        {activeTab === "enabler" && (
          <RoleVerificationTable roleTitle="Enabler" />
        )}
        {activeTab === "college" && <VerifyOrgsView />}
        {activeTab === "company" && <ManageCompaniesTable />}
      </div>
    </div>
  );
}
