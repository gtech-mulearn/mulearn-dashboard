"use client";

import { useCompanyOnboardingStatus } from "@/features/auth/hooks";
import { useUserInfo } from "@/features/auth/hooks/use-session";
import { useCompanyProfile } from "@/features/company-jobs/hooks/use-company-profile";
import { useJobs } from "@/features/company-jobs/hooks/use-jobs";
import { ROLES } from "@/lib/auth";
import {
  useCompanyCalendarEvents,
  useCompanyHomeSummary,
  useCompanyOrgId,
  useCompanySessionCalendar,
} from "../hooks";
import { flattenEventBuckets, flattenSessionBuckets } from "../utils";
import { ActiveJobListingsCard } from "./company/active-job-listings-card";
import { CompanyHeroCard } from "./company/company-hero-card";
import { CompanyStatCards } from "./company/company-stat-cards";
import { TalentPoolCard } from "./company/talent-pool-card";
import { EventCalendarCard } from "./event-calendar-card";

export function CompanyHome() {
  const { data: userInfo } = useUserInfo();
  const isCompany = userInfo?.roles?.includes(ROLES.COMPANY) ?? false;
  const { data: companyStatus } = useCompanyOnboardingStatus(isCompany);
  const { profile, isLoading: profileLoading } = useCompanyProfile();
  const { data: jobsData, isLoading: jobsLoading } = useJobs({ perPage: 100 });
  const { data: summary, isLoading: summaryLoading } = useCompanyHomeSummary();
  const companyName = profile?.name ?? summary?.company?.name;
  const { data: companyOrgId } = useCompanyOrgId(companyName);
  const { data: calendarEvents, isLoading: loadingCalendar } =
    useCompanyCalendarEvents(companyOrgId ?? undefined);
  const { data: sessionEvents, isLoading: loadingSessions } =
    useCompanySessionCalendar(companyOrgId ?? undefined);
  const mergedCalendarEvents = [
    ...flattenEventBuckets(calendarEvents),
    ...flattenSessionBuckets(sessionEvents),
  ];

  const jobsPosted =
    summary?.quick_stats?.jobs_posted ?? jobsData?.pagination?.count ?? 0;

  const quickStats = summary?.quick_stats ?? {
    jobs_posted: jobsPosted,
    total_views: 0,
    applications: 0,
    hired: 0,
  };

  const status = companyStatus?.status?.toLowerCase();
  const isVerified =
    companyStatus?.verified === true ||
    companyStatus?.is_verified === true ||
    status === "approved" ||
    status === "active" ||
    status === "verified";

  return (
    <div className="space-y-5">
      <CompanyHeroCard
        jobsPosted={jobsPosted}
        isLoading={jobsLoading || profileLoading}
        isVerified={isVerified}
      />
      <CompanyStatCards
        quickStats={quickStats}
        isLoading={summaryLoading}
        isVerified={isVerified}
      />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_296px]">
        <ActiveJobListingsCard isVerified={isVerified} />
        <div className="space-y-5">
          <EventCalendarCard
            events={mergedCalendarEvents}
            isLoading={loadingCalendar || loadingSessions}
          />
          <TalentPoolCard
            talentPool={summary?.talent_pool}
            isLoading={summaryLoading}
            isVerified={isVerified}
          />
        </div>
      </div>
    </div>
  );
}
