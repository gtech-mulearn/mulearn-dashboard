"use client";

import { useCompanyOnboardingStatus } from "@/features/auth/hooks";
import { useUserInfo } from "@/features/auth/hooks/use-session";
import { useCompanyProfile } from "@/features/company-jobs/hooks/use-company-profile";
import { useJobs } from "@/features/company-jobs/hooks/use-jobs";
import { ROLES } from "@/lib/auth";
import { useCompanyHomeSummary } from "@/features/home/hooks";
import { ActiveJobListingsCard } from "@/features/home/components/company/active-job-listings-card";
import { CompanyHeroCard } from "@/features/home/components/company/company-hero-card";
import { CompanyStatCards } from "@/features/home/components/company/company-stat-cards";
import { CompanyVerifiedBanner } from "@/features/home/components/company/company-verified-banner";
import { TalentPoolCard } from "@/features/home/components/company/talent-pool-card";

import Link from "next/link";
import { ClipboardList, ArrowRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function CompanyDashboardClient() {
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
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <ActiveJobListingsCard />
            <div className="flex justify-end">
              <Link
                href="/dashboard/company/jobs"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 px-1"
              >
                Manage all jobs <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Link href="/dashboard/company/tasks" className="block group">
              <Card className="h-full transition-colors hover:bg-muted/50 rounded-2xl border shadow-sm">
                <CardHeader className="p-5 pb-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                    <ClipboardList className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base font-bold">
                    Manage Tasks
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Create and monitor tasks submitted by your company. Track
                    admin approval status.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-5 pb-5 pt-0">
                  <div className="text-xs font-semibold text-primary flex items-center gap-1">
                    View Tasks <ArrowRight className="h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/company/mentors" className="block group">
              <Card className="h-full transition-colors hover:bg-muted/50 rounded-2xl border shadow-sm">
                <CardHeader className="p-5 pb-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                      role="img"
                    >
                      <title>Mentors Icon</title>
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <CardTitle className="text-base font-bold">
                    Manage Mentors
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Nominate new company mentors to support your community tasks
                    and initiatives.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-5 pb-5 pt-0">
                  <div className="text-xs font-semibold text-primary flex items-center gap-1">
                    View Mentors <ArrowRight className="h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        <div>
          <TalentPoolCard
            talentPool={summary?.talent_pool}
            isLoading={summaryLoading}
          />
        </div>
      </div>
    </div>
  );
}
