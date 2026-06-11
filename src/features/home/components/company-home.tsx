"use client";

import { useCompanyOnboardingStatus } from "@/features/auth/hooks";
import { useUserInfo } from "@/features/auth/hooks/use-session";
import { useCompanyProfile } from "@/features/company-jobs/hooks/use-company-profile";
import { useJobs } from "@/features/company-jobs/hooks/use-jobs";
import { ROLES } from "@/lib/auth";
import { useCompanyHomeSummary } from "../hooks";
import { ActiveJobListingsCard } from "./company/active-job-listings-card";
import { CompanyHeroCard } from "./company/company-hero-card";
import { CompanyStatCards } from "./company/company-stat-cards";
import { CompanyVerifiedBanner } from "./company/company-verified-banner";
import { TalentPoolCard } from "./company/talent-pool-card";

export function CompanyHome() {
  const { data: userInfo } = useUserInfo();
  const isCompany = userInfo?.roles?.includes(ROLES.COMPANY) ?? false;
  const { data: companyStatus } = useCompanyOnboardingStatus(isCompany);
  const { profile, isLoading: profileLoading } = useCompanyProfile();
  const { data: jobsData, isLoading: jobsLoading } = useJobs({ perPage: 100 });
  const { data: summary, isLoading: summaryLoading } = useCompanyHomeSummary();

  const jobsPosted =
    summary?.quick_stats?.jobs_posted ?? jobsData?.pagination?.count ?? 0;
  const companyName = profile?.name ?? undefined;

  const quickStats = summary?.quick_stats ?? {
    jobs_posted: jobsPosted,
    total_views: 0,
    applications: 0,
    hired: 0,
  };

  return (
    <div className="space-y-5">
      <CompanyVerifiedBanner status={companyStatus} companyName={companyName} />
      <CompanyHeroCard
        jobsPosted={jobsPosted}
        isLoading={jobsLoading || profileLoading}
      />
      <CompanyStatCards quickStats={quickStats} isLoading={summaryLoading} />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_296px]">
        <ActiveJobListingsCard />
        <TalentPoolCard
          talentPool={summary?.talent_pool}
          isLoading={summaryLoading}
        />
      </div>
    </div>
  );
}
