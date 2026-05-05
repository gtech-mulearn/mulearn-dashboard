"use client";

import { useCompanyOnboardingStatus } from "@/features/auth/hooks";
import { useUserInfo } from "@/features/auth/hooks/use-session";
import { ROLES } from "@/lib/auth";
import { ActiveJobListingsCard } from "./company/active-job-listings-card";
import { CompanyHeroCard } from "./company/company-hero-card";
import { CompanyStatCards } from "./company/company-stat-cards";
import { CompanyVerifiedBanner } from "./company/company-verified-banner";
import { TalentPoolCard } from "./company/talent-pool-card";

export function CompanyHome() {
  const { data: userInfo } = useUserInfo();
  const isCompany = userInfo?.roles?.includes(ROLES.COMPANY) ?? false;
  const { data: companyStatus } = useCompanyOnboardingStatus(isCompany);

  return (
    <div className="space-y-5">
      {/* Verified banner — only shown when company is approved */}
      <CompanyVerifiedBanner status={companyStatus} />

      {/* Hero */}
      <CompanyHeroCard />

      {/* 4 stat cards */}
      <CompanyStatCards />

      {/* Bottom: Job listings | Talent pool */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_296px]">
        <ActiveJobListingsCard />
        <TalentPoolCard />
      </div>
    </div>
  );
}
