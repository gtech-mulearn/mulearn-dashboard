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
import { ActiveJobListingsCard } from "./company/active-job-listings-card";
import { CompanyHeroCard } from "./company/company-hero-card";
import { CompanyStatCards } from "./company/company-stat-cards";
import { CompanyVerifiedBanner } from "./company/company-verified-banner";
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
    ...(calendarEvents ?? []),
    ...(sessionEvents ?? []),
  ];

  const jobsPosted =
    summary?.quick_stats?.jobs_posted ?? jobsData?.pagination?.count ?? 0;
  const companyDisplayName = profile?.name ?? undefined;

  const quickStats = summary?.quick_stats ?? {
    jobs_posted: jobsPosted,
    total_views: 0,
    applications: 0,
    hired: 0,
  };

  return (
    <div className="space-y-5">
      <CompanyVerifiedBanner
        status={companyStatus}
        companyName={companyDisplayName}
      />
      <CompanyHeroCard
        jobsPosted={jobsPosted}
        isLoading={jobsLoading || profileLoading}
      />
      <CompanyStatCards quickStats={quickStats} isLoading={summaryLoading} />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_296px]">
        <ActiveJobListingsCard />
        <div className="space-y-5">
          <EventCalendarCard
            events={mergedCalendarEvents}
            isLoading={loadingCalendar || loadingSessions}
          />
          <TalentPoolCard
            talentPool={summary?.talent_pool}
            isLoading={summaryLoading}
          />
        </div>
      </div>
    </div>
  );
}
